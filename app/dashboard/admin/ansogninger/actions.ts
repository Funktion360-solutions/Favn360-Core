"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

const applicationsPath = "/dashboard/admin/ansogninger";

function noteFromForm(formData: FormData) {
  return String(formData.get("admin_note") ?? "").trim();
}

function idFromForm(formData: FormData) {
  return String(formData.get("application_id") ?? "").trim();
}

async function fetchApplication(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase
    .from("representative_applications")
    .select("id,email,status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return data;
}

async function updateMatchingRepresentativeProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  values: {
    approved?: boolean;
    verified?: boolean;
    suspended?: boolean;
    publicProfile?: boolean;
    acceptsNewClients?: boolean;
  }
) {
  const { data: profile, error: profileError } = await supabase
    .from("representative_profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    return;
  }

  if (!profile) {
    return;
  }

  const { error } = await supabase.rpc(
    "admin_set_representative_state",
    {
      p_user_id: profile.user_id,
      p_approved: values.approved ?? null,
      p_verified: values.verified ?? null,
      p_suspended: values.suspended ?? null,
      p_public_profile: values.publicProfile ?? null,
      p_accepts_new_clients: values.acceptsNewClients ?? null,
      p_promote_to_representative: false
    }
  );

  if (error) {
    console.error("[favn360] Failed to update representative state.", {
      code: error.code,
      message: error.message
    });
  }
}

async function logApplicationAction({
  action,
  actorId,
  applicationId,
  status
}: {
  action:
    | "representative_application_approved"
    | "representative_application_rejected"
    | "representative_application_suspended"
    | "representative_application_reopened"
    | "representative_application_reactivated";
  actorId: string;
  applicationId: string;
  status: string;
}) {
  await writeAuditLog({
    action,
    actorId,
    entityType: "representative_application",
    entityId: applicationId,
    metadata: { status }
  });
}

export async function approveApplication(formData: FormData) {
  const admin = await requireUser("administrator");
  const id = idFromForm(formData);

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const application = await fetchApplication(supabase, id);

  if (!application) {
    return;
  }

  const { error } = await supabase
    .from("representative_applications")
    .update({
      status: "approved",
      onboarding_unlocked: true,
      decided_at: new Date().toISOString(),
      decided_by: admin.id,
      admin_note: noteFromForm(formData) || null
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await logApplicationAction({
    action: "representative_application_approved",
    actorId: admin.id,
    applicationId: id,
    status: "approved"
  });

  revalidatePath(applicationsPath);
}

export async function rejectApplication(formData: FormData) {
  const admin = await requireUser("administrator");
  const id = idFromForm(formData);

  if (!id) {
    return;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("representative_applications")
    .update({
      status: "rejected",
      decided_at: new Date().toISOString(),
      decided_by: admin.id,
      admin_note: noteFromForm(formData) || null
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await logApplicationAction({
    action: "representative_application_rejected",
    actorId: admin.id,
    applicationId: id,
    status: "rejected"
  });

  revalidatePath(applicationsPath);
}

export async function suspendApplication(formData: FormData) {
  const admin = await requireUser("administrator");
  const id = idFromForm(formData);

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const application = await fetchApplication(supabase, id);

  if (!application) {
    return;
  }

  const { error } = await supabase
    .from("representative_applications")
    .update({
      status: "suspended",
      decided_at: new Date().toISOString(),
      decided_by: admin.id,
      admin_note: noteFromForm(formData) || null
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await updateMatchingRepresentativeProfile(supabase, application.email, {
  suspended: true,
  publicProfile: false,
  acceptsNewClients: false
});

  await logApplicationAction({
    action: "representative_application_suspended",
    actorId: admin.id,
    applicationId: id,
    status: "suspended"
  });

  revalidatePath(applicationsPath);
}

export async function reopenApplication(formData: FormData) {
  const admin = await requireUser("administrator");
  const id = idFromForm(formData);

  if (!id) {
    return;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("representative_applications")
    .update({
      status: "pending",
      onboarding_unlocked: false,
      decided_at: null,
      decided_by: null,
      admin_note: noteFromForm(formData) || null
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await logApplicationAction({
    action: "representative_application_reopened",
    actorId: admin.id,
    applicationId: id,
    status: "pending"
  });

  revalidatePath(applicationsPath);
}

export async function reactivateApplication(formData: FormData) {
  const admin = await requireUser("administrator");
  const id = idFromForm(formData);

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const application = await fetchApplication(supabase, id);

  if (!application || application.status !== "suspended") {
    return;
  }

  const { error } = await supabase
    .from("representative_applications")
    .update({
      status: "approved",
      onboarding_unlocked: true,
      decided_at: new Date().toISOString(),
      decided_by: admin.id,
      admin_note: noteFromForm(formData) || null
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await updateMatchingRepresentativeProfile(supabase, application.email, {
  suspended: false,
  approved: true,
  verified: true
});

  await logApplicationAction({
    action: "representative_application_reactivated",
    actorId: admin.id,
    applicationId: id,
    status: "approved"
  });

  revalidatePath(applicationsPath);
}
