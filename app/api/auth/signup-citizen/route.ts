import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isSameOrigin } from "@/lib/request-security";

const SIGNUP_NOTICE_VERSION = "2026-09-24";
const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  municipality: z.string().trim().min(2).max(120),
  password: z.string().min(12).max(128),
  consentTerms: z.literal(true),
  privacyNoticeAccepted: z.literal(true)
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Kontrollér de indtastede oplysninger." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appOrigin = process.env.APP_ORIGIN;
  if (!supabaseUrl || !publishableKey || !appOrigin) {
    return NextResponse.json({ error: "Kontooprettelse er midlertidigt utilgængelig." }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { fullName, email, phone, municipality, password } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appOrigin.replace(/\/$/, "")}/auth/login`,
      data: {
        full_name: fullName,
        phone,
        municipality,
        terms_accepted_at: new Date().toISOString(),
        terms_version: SIGNUP_NOTICE_VERSION,
        privacy_notice_acknowledged_at: new Date().toISOString(),
        privacy_notice_version: SIGNUP_NOTICE_VERSION
      }
    }
  });

  if (error) {
    console.warn("[favn360] Signup failed.", { code: error.code });
  }

  return NextResponse.json(
    { ok: true, message: "Hvis adressen kan oprettes, modtager du en bekræftelsesmail." },
    { status: 202, headers: { "Cache-Control": "no-store" } }
  );
}
