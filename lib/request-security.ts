import type { CurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const configuredOrigin = process.env.APP_ORIGIN?.replace(/\/$/, "");
  if (configuredOrigin) return origin === configuredOrigin;

  return process.env.NODE_ENV !== "production" && origin === new URL(request.url).origin;
}

export async function canAccessCitizen(user: CurrentUser, citizenId: string) {
  const supabase = await createClient();

  if (user.role === "administrator") {
    const { data } = await supabase.from("citizens").select("id").eq("id", citizenId).maybeSingle();
    return Boolean(data);
  }

  if (user.role === "citizen") {
    const { data } = await supabase
      .from("citizens")
      .select("id")
      .eq("id", citizenId)
      .eq("user_id", user.id)
      .maybeSingle();
    return Boolean(data);
  }

  if (user.role === "representative") {
    const { data: representative } = await supabase
      .from("representative_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!representative) return false;

    const { data: link } = await supabase
      .from("citizen_representative_links")
      .select("citizen_id")
      .eq("citizen_id", citizenId)
      .eq("representative_id", representative.id)
      .eq("status", "active")
      .maybeSingle();
    return Boolean(link);
  }

  return false;
}
