import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCitizen, isSameOrigin } from "@/lib/request-security";

const BUCKET_NAME = process.env.DOCUMENT_BUCKET_NAME ?? "favn360-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedCategories = ["laege", "jobcenter", "praktik", "moede", "afgoerelse", "andet"] as const;
const metadataSchema = z.object({
  citizenId: z.string().uuid(),
  category: z.enum(allowedCategories),
  title: z.string().trim().max(160)
});

const signatures: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]]
};

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 120) || "document";
}

async function hasValidSignature(file: File) {
  const expected = signatures[file.type];
  if (!expected) return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return expected.some((signature) => signature.every((byte, index) => bytes[index] === byte));
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Du er ikke logget ind." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_FILE_SIZE + 64 * 1024) {
    return NextResponse.json({ error: "Filen er for stor." }, { status: 413 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = metadataSchema.safeParse({
    citizenId: String(formData.get("citizenId") ?? ""),
    category: String(formData.get("category") ?? "andet"),
    title: String(formData.get("title") ?? "")
  });

  if (!(file instanceof File) || !parsed.success) {
    return NextResponse.json({ error: "Uploaden indeholder ugyldige oplysninger." }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE || !(await hasValidSignature(file))) {
    return NextResponse.json(
      { error: "Kun gyldige PDF-, JPEG- og PNG-filer på højst 10 MB accepteres." },
      { status: 415 }
    );
  }

  const { citizenId, category, title } = parsed.data;
  if (!(await canAccessCitizen(user, citizenId))) {
    return NextResponse.json({ error: "Du har ikke adgang til den valgte borger." }, { status: 403 });
  }

  const supabase = await createClient();
  const safeFileName = sanitizeFileName(file.name);
  const filePath = `${citizenId}/${crypto.randomUUID()}-${safeFileName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    console.warn("[favn360] Document upload failed.", { code: uploadError.message });
    return NextResponse.json({ error: "Filen kunne ikke uploades." }, { status: 500 });
  }

  const { data: document, error: insertError } = await supabase.from("documents").insert({
    citizen_id: citizenId,
    uploaded_by: user.id,
    category,
    title: title || null,
    file_name: safeFileName,
    file_path: filePath,
    mime_type: file.type,
    file_size: file.size
  }).select("id").single();

  if (insertError || !document) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return NextResponse.json({ error: "Dokumentet kunne ikke registreres." }, { status: 500 });
  }

  await writeAuditLog({
    action: "attachment_uploaded",
    actorId: user.id,
    citizenId,
    entityType: "document",
    entityId: document.id,
    metadata: { category, mimeType: file.type, fileSize: file.size }
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
