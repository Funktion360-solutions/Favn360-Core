import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;
const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  roleTitle: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(160).optional().default(""),
  cvr: z.string().trim().max(20).optional().default(""),
  cityArea: z.string().trim().max(120).optional().default(""),
  website: z.preprocess(emptyToUndefined, z.string().url().max(500).optional()),
  profileText: z.string().trim().max(3000).optional().default(""),
  reason: z.string().trim().min(20).max(5000)
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
  }

  const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Kontrollér de indtastede oplysninger." }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("representative_applications").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    role_title: input.roleTitle,
    company_name: input.companyName || null,
    cvr: input.cvr || null,
    city_area: input.cityArea || null,
    website: input.website ?? null,
    profile_text: input.profileText || null,
    reason: input.reason,
    status: "pending"
  });

  if (error) {
    console.warn("[favn360] Representative application failed.", { code: error.code });
    return NextResponse.json({ error: "Ansøgningen kunne ikke sendes." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
