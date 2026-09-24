import type { User } from "@supabase/supabase-js";
import { friendlyDatabaseError } from "@/lib/database-errors";
import type { CurrentUser } from "@/lib/auth";
import type { UserRole } from "@/types/database";

type ProfileClient = {
  from: (table: string) => any;
};

function displayNameFromUser(user: User) {
  const metadataName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  return typeof metadataName === "string" && metadataName.trim().length > 0 ? metadataName.trim() : user.email ?? "Ukendt bruger";
}

function normalizeRole(role: unknown): UserRole {

  if (role === "administrator" || role === "admin") {

    return "administrator";

  }

  if (role === "representative" || role === "partsrepraesentant") {

    return "representative";

  }

  if (role === "borger" || role === "citizen") {

    return "citizen";

  }

  return "ukendt";

}

function profileToCurrentUser(profile: Record<string, unknown>, user: User): CurrentUser {
  const role = normalizeRole(profile.role);

  return {
    id: user.id,
    email: typeof profile.email === "string" && profile.email.length > 0 ? profile.email : user.email ?? "",
    fullName:
      typeof profile.full_name === "string" && profile.full_name.length > 0 ? profile.full_name : displayNameFromUser(user),
    role
  };
}

export async function ensureProfileForUser(user: User, authenticatedClient?: ProfileClient): Promise<CurrentUser> {
  const profileClient = authenticatedClient;
  const email = user.email ?? "";
  const fallbackProfile: CurrentUser = {
    id: user.id,
    email,
    fullName: displayNameFromUser(user),
    role: "ukendt"
  };

  if (!profileClient) {
    return fallbackProfile;
  }

  try {
    const { data: profileById, error: selectByIdError } = await profileClient
      .from("profiles")
      .select("id,email,full_name,role")
      .eq("id", user.id)
      .maybeSingle();

    if (selectByIdError) {
      console.warn(friendlyDatabaseError(selectByIdError));
    }

    if (profileById) {
      return profileToCurrentUser(profileById, user);
    }

    console.warn("[favn360] Authenticated user is missing a profile row.");
    return fallbackProfile;
  } catch (error) {
    console.warn(friendlyDatabaseError(error));
    return fallbackProfile;
  }
}
