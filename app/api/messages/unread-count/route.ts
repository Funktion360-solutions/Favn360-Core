import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function unreadResponse(unread: number) {
  return NextResponse.json(
    { unread },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unreadResponse(0);
  }

  const supabase = await createClient();

  let citizenIds: string[] = [];

  if (user.role === "citizen") {
    const { data: citizen } = await supabase
      .from("citizens")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (citizen) {
      citizenIds = [citizen.id];
    }
  }

  if (user.role === "representative") {
    const { data: representative } = await supabase
      .from("representative_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (representative) {
      const { data: links } = await supabase
        .from("citizen_representative_links")
        .select("citizen_id")
        .eq("representative_id", representative.id)
        .eq("status", "active");

      citizenIds = links?.map((link) => link.citizen_id) ?? [];
    }
  }

  if (citizenIds.length === 0) {
    return unreadResponse(0);
  }

  const { count } = await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true
    })
    .in("citizen_id", citizenIds)
    .is("read_at", null)
    .neq("sender_id", user.id);

  return unreadResponse(count ?? 0);
}
