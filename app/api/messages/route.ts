import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCitizen, isSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";

const citizenIdSchema = z.string().uuid();
const messageSchema = z.object({
  citizenId: citizenIdSchema,
  body: z.string().trim().min(1).max(4000)
});

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ messages: [] }, { status: 401 });

  const citizenId = new URL(request.url).searchParams.get("citizenId");
  const parsedId = citizenIdSchema.safeParse(citizenId);
  if (!parsedId.success) return NextResponse.json({ messages: [] }, { status: 400 });
  if (!(await canAccessCitizen(user, parsedId.data))) {
    return NextResponse.json({ messages: [] }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id,citizen_id,sender_id,body,read_at,created_at")
    .eq("citizen_id", parsedId.data)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[favn360] Messages could not be read.", { code: error.code });
    return NextResponse.json({ messages: [] }, { status: 500 });
  }

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("citizen_id", parsedId.data)
    .is("read_at", null)
    .neq("sender_id", user.id);

  return NextResponse.json(
    { messages: messages ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Beskeden er ugyldig eller for lang." }, { status: 400 });
  }

  if (!(await canAccessCitizen(user, parsed.data.citizenId))) {
    return NextResponse.json({ error: "Du har ikke adgang til samtalen." }, { status: 403 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    citizen_id: parsed.data.citizenId,
    sender_id: user.id,
    body: parsed.data.body
  });

  if (error) {
    console.warn("[favn360] Message could not be sent.", { code: error.code });
    return NextResponse.json({ error: "Beskeden kunne ikke sendes." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
