import { NextResponse } from "next/server";
import { z } from "zod";

import { isSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";

import { requireUser } from "@/lib/auth";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  roleTitle: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(160).optional().default(""),
  cvr: z.string().trim().max(20).optional().default(""),
  cityArea: z.string().trim().max(120).optional().default(""),
  website: z.preprocess(
    emptyToUndefined,
    z.string().url().max(500).optional()
  ),
  profileText: z.string().trim().max(3000).optional().default(""),
  reason: z.string().trim().min(20).max(5000)
});


export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Anmodningen blev afvist." },
      { status: 403 }
    );
  }

  let user;

try {
  user = await requireUser();
} catch {
  return NextResponse.json(
    { error: "Du skal være logget ind for at sende en ansøgning." },
    { status: 401 }
  );
}

  const parsed = applicationSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Kontrollér de indtastede oplysninger." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "submit_representative_application",
    {
      p_name: input.name,
      p_email: input.email,
      p_phone: input.phone,
      p_role_title: input.roleTitle,
      p_company_name: input.companyName || null,
      p_cvr: input.cvr || null,
      p_city_area: input.cityArea || null,
      p_website: input.website ?? null,
      p_profile_text: input.profileText || null,
      p_reason: input.reason
    }
  );

if (input.email.toLowerCase() !== user.email.toLowerCase()) {
  return NextResponse.json(
    { error: "E-mailadressen skal være den samme som på din Favn360-konto." },
    { status: 400 }
  );
}

  if (error) {
    console.warn("[favn360] Representative application failed.", {
      code: error.code
    });

    return NextResponse.json(
      { error: "Ansøgningen kunne ikke sendes." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}