import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function conversationsResponse(conversations: Array<{ citizenId: string; title: string; subtitle: string }>, status = 200) {
  return NextResponse.json(
    { conversations },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return conversationsResponse([], 401);
  }

  const supabase = await createClient();

  if (user.role === "citizen") {
    const { data: citizen } = await supabase
      .from("citizens")
      .select("id,citizen_name,practice_place")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!citizen) {
      return conversationsResponse([]);
    }

    return conversationsResponse([
        {
          citizenId: citizen.id,
          title: "Min partsrepræsentant",
          subtitle: citizen.practice_place ?? "Samtale om forløb"
        }
      ]);
  }

  if (user.role === "representative") {
    const { data: representative } = await supabase
      .from("representative_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!representative) {
      return conversationsResponse([]);
    }

    const { data: links } = await supabase
      .from("citizen_representative_links")
      .select("citizen_id")
      .eq("representative_id", representative.id)
      .eq("status", "active");

    const citizenIds = links?.map((link) => link.citizen_id) ?? [];

    if (citizenIds.length === 0) {
      return conversationsResponse([]);
    }

    const { data: citizens } = await supabase
      .from("citizens")
      .select("id,citizen_name,practice_place")
      .in("id", citizenIds);

    return conversationsResponse(
      citizens?.map((citizen) => ({
          citizenId: citizen.id,
          title: citizen.citizen_name ?? "Ukendt borger",
          subtitle: citizen.practice_place ?? "Samtale om forløb"
        })) ?? []
    );
  }

  return conversationsResponse([]);
}
