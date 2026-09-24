"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const betaPath = "/dashboard/admin/beta";
const betaStatuses = ["invited", "active", "completed", "suspended"] as const;
const betaRoles = ["citizen", "representative"] as const;

type BetaStatus = (typeof betaStatuses)[number];
type BetaRole = (typeof betaRoles)[number];

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function asRequiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asRole(value: FormDataEntryValue | null): BetaRole {
  const selected = String(value ?? "citizen");
  return betaRoles.includes(selected as BetaRole) ? (selected as BetaRole) : "citizen";
}

function asStatus(value: FormDataEntryValue | null): BetaStatus {
  const selected = String(value ?? "active");
  return betaStatuses.includes(selected as BetaStatus) ? (selected as BetaStatus) : "active";
}

function done(params: { error?: string; status?: string }): never {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  redirect(`${betaPath}?${searchParams.toString()}`);
}

async function requireAdminClient() {
  await requireUser("administrator");
  const supabaseAdmin = createAdminClient();

  if (!supabaseAdmin) {
    done({ error: "Serveren mangler Supabase service role-konfiguration." });
  }

  return supabaseAdmin;
}

async function findProfileByEmail(supabaseAdmin: NonNullable<ReturnType<typeof createAdminClient>>, email: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[favn360] Profil kunne ikke hentes.", error);
  }

  return data;
}

async function ensureCitizenProfile({
  supabaseAdmin,
  userId,
  fullName,
  phone
}: {
  supabaseAdmin: NonNullable<ReturnType<typeof createAdminClient>>;
  userId: string;
  fullName: string;
  phone: string | null;
}) {
  const { data: existingCitizen, error: citizenFetchError } = await supabaseAdmin
    .from("citizens")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (citizenFetchError) throw citizenFetchError;

  const citizen =
    existingCitizen ??
    (
      await supabaseAdmin
        .from("citizens")
        .insert({
          user_id: userId,
          citizen_name: fullName,
          phone
        })
        .select("id")
        .single()
    ).data;

  if (!citizen?.id) {
    throw new Error("Borgerprofilen kunne ikke oprettes.");
  }

  const { data: onboarding, error: onboardingFetchError } = await supabaseAdmin
    .from("citizen_onboarding")
    .select("id")
    .eq("citizen_id", citizen.id)
    .maybeSingle();

  if (onboardingFetchError) throw onboardingFetchError;

  if (!onboarding) {
    const { error: onboardingError } = await supabaseAdmin.from("citizen_onboarding").insert({
      citizen_id: citizen.id,
      onboarding_completed: false,
      current_step: 1
    });

    if (onboardingError) throw onboardingError;
  }
}

async function ensureRepresentativeProfile({
  supabaseAdmin,
  userId,
  fullName,
  email,
  phone
}: {
  supabaseAdmin: NonNullable<ReturnType<typeof createAdminClient>>;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
}) {
  const { data: existingRepresentative, error: fetchError } = await supabaseAdmin
    .from("representative_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const payload = {
    user_id: userId,
    display_name: fullName,
    email,
    phone,
    approved_by_admin: true,
    verified: true,
    suspended: false,
    public_profile: false,
    accepts_new_clients: false
  };

  const { error } = existingRepresentative
    ? await supabaseAdmin.from("representative_profiles").update(payload).eq("id", existingRepresentative.id)
    : await supabaseAdmin.from("representative_profiles").insert(payload);

  if (error) throw error;
}

async function upsertBetaUser({
  supabaseAdmin,
  userId,
  betaGroup,
  status,
  roleAtBetaStart,
  internalNote,
  createdBy
}: {
  supabaseAdmin: NonNullable<ReturnType<typeof createAdminClient>>;
  userId: string;
  betaGroup: string | null;
  status: BetaStatus;
  roleAtBetaStart: string;
  internalNote: string | null;
  createdBy: string;
}) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("beta_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const payload = {
    user_id: userId,
    beta_group: betaGroup,
    status,
    role_at_beta_start: roleAtBetaStart,
    internal_note: internalNote,
    created_by: createdBy,
    updated_at: new Date().toISOString()
  };

  const { error } = existing
    ? await supabaseAdmin.from("beta_users").update(payload).eq("id", existing.id)
    : await supabaseAdmin.from("beta_users").insert(payload);

  if (error) throw error;
}

export async function createBetaUser(formData: FormData) {
  const admin = await requireUser("administrator");
  const supabaseAdmin = await requireAdminClient();

  const fullName = asRequiredText(formData.get("full_name"));
  const email = asRequiredText(formData.get("email")).toLowerCase();
  const phone = asText(formData.get("phone"));
  const role = asRole(formData.get("role"));
  const temporaryPassword = asRequiredText(formData.get("temporary_password"));
  const betaGroup = asText(formData.get("beta_group"));
  const internalNote = asText(formData.get("internal_note"));

  if (!fullName || !email || !temporaryPassword) {
    done({ error: "Navn, email og midlertidig adgangskode skal udfyldes." });
  }

  const existingProfile = await findProfileByEmail(supabaseAdmin, email);

  if (existingProfile) {
    done({ error: "Der findes allerede en bruger med denne email. Brug markér eksisterende bruger." });
  }

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role
    }
  });

  if (authError || !authUser.user) {
    const message = authError?.message?.toLowerCase().includes("already")
      ? "Der findes allerede en bruger med denne email. Brug markér eksisterende bruger."
      : authError?.message ?? "Testbrugeren kunne ikke oprettes.";
    done({ error: message });
  }

  const userId = authUser.user.id;

  try {
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    if (role === "citizen") {
      await ensureCitizenProfile({ supabaseAdmin, userId, fullName, phone });
    }

    if (role === "representative") {
      await ensureRepresentativeProfile({ supabaseAdmin, userId, fullName, email, phone });
    }

    await upsertBetaUser({
      supabaseAdmin,
      userId,
      betaGroup,
      status: "active",
      roleAtBetaStart: role,
      internalNote,
      createdBy: admin.id
    });
  } catch (error) {
    console.error("[favn360] Beta-testbruger kunne ikke oprettes.", error);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    done({ error: error instanceof Error ? error.message : "Testbrugeren kunne ikke oprettes." });
  }

  revalidatePath(betaPath);
  done({ status: "Testbrugeren er oprettet." });
}

export async function markExistingUserAsBeta(formData: FormData) {
  const admin = await requireUser("administrator");
  const supabaseAdmin = await requireAdminClient();

  const email = asRequiredText(formData.get("email")).toLowerCase();
  const betaGroup = asText(formData.get("beta_group"));
  const status = asStatus(formData.get("status"));
  const internalNote = asText(formData.get("internal_note"));

  if (!email) {
    done({ error: "Email skal udfyldes." });
  }

  const profile = await findProfileByEmail(supabaseAdmin, email);

  if (!profile) {
    done({ error: "Der blev ikke fundet en bruger med den email." });
  }

  await upsertBetaUser({
    supabaseAdmin,
    userId: profile.id,
    betaGroup,
    status,
    roleAtBetaStart: profile.role,
    internalNote,
    createdBy: admin.id
  });

  revalidatePath(betaPath);
  done({ status: "Brugeren er markeret som beta-bruger." });
}

export async function updateBetaUser(formData: FormData) {
  await requireUser("administrator");
  const supabaseAdmin = await requireAdminClient();

  const id = asRequiredText(formData.get("beta_user_id"));
  const status = asStatus(formData.get("status"));
  const internalNote = asText(formData.get("internal_note"));

  if (!id) {
    done({ error: "Beta-brugeren blev ikke fundet." });
  }

  const { error } = await supabaseAdmin
    .from("beta_users")
    .update({
      status,
      internal_note: internalNote,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("[favn360] Beta-bruger kunne ikke opdateres.", error);
    done({ error: "Beta-brugeren kunne ikke opdateres." });
  }

  revalidatePath(betaPath);
  done({ status: "Beta-brugeren er opdateret." });
}

export async function removeBetaMarking(formData: FormData) {
  await requireUser("administrator");
  const supabaseAdmin = await requireAdminClient();

  const id = asRequiredText(formData.get("beta_user_id"));

  if (!id) {
    done({ error: "Beta-brugeren blev ikke fundet." });
  }

  const { error } = await supabaseAdmin.from("beta_users").delete().eq("id", id);

  if (error) {
    console.error("[favn360] Beta-markering kunne ikke fjernes.", error);
    done({ error: "Beta-markeringen kunne ikke fjernes." });
  }

  revalidatePath(betaPath);
  done({ status: "Beta-markeringen er fjernet. Brugeren er ikke slettet." });
}
