import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getCitizenByUserId } from "@/lib/citizens";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { createClient } from "@/lib/supabase/server";
import { CitizenOnboardingWizard, type CitizenOnboardingData } from "./Wizard";

async function getOrCreateOnboarding(citizenId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("citizen_onboarding")
    .select("id,current_step,onboarding_completed")
    .eq("citizen_id", citizenId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data as { id: string; current_step: number | null; onboarding_completed: boolean | null };
  }

  const { data: created, error: createError } = await supabase
    .from("citizen_onboarding")
    .insert({
      citizen_id: citizenId,
      current_step: 1,
      onboarding_completed: false
    })
    .select("id,current_step,onboarding_completed")
    .single();

  if (createError) {
    throw createError;
  }

  return created as { id: string; current_step: number | null; onboarding_completed: boolean | null };
}

async function getOnboardingData(citizenId: string): Promise<CitizenOnboardingData> {
  const supabase = await createClient();
  const [employment, functionProfile, contacts, goals, consents] = await Promise.all([
    supabase.from("citizen_employment").select("*").eq("citizen_id", citizenId).maybeSingle(),
    supabase.from("citizen_function_profile").select("*").eq("citizen_id", citizenId),
    supabase.from("citizen_contacts").select("*").eq("citizen_id", citizenId),
    supabase.from("citizen_goals").select("*").eq("citizen_id", citizenId),
    supabase.from("citizen_consents").select("*").eq("citizen_id", citizenId).maybeSingle()
  ]);

  const firstError = employment.error ?? functionProfile.error ?? contacts.error ?? goals.error ?? consents.error;

  if (firstError) {
    throw firstError;
  }

  return {
    employment: (employment.data ?? null) as CitizenOnboardingData["employment"],
    functionProfile: (functionProfile.data ?? []) as CitizenOnboardingData["functionProfile"],
    contacts: (contacts.data ?? []) as CitizenOnboardingData["contacts"],
    goals: (goals.data ?? []) as CitizenOnboardingData["goals"],
    consents: (consents.data ?? null) as CitizenOnboardingData["consents"]
  };
}

export default async function CitizenOnboardingPage() {
  const user = await requireUser("citizen");
  const { citizen, warning } = await getCitizenByUserId(user.id);

  if (!citizen) {
    return (
      <AppShell user={user}>
        <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          {warning ?? "Borgerprofilen blev ikke fundet. Kontakt support, hvis problemet fortsætter."}
        </div>
      </AppShell>
    );
  }

  let onboarding: { id: string; current_step: number | null; onboarding_completed: boolean | null };
  let data: CitizenOnboardingData;

  try {
    onboarding = await getOrCreateOnboarding(citizen.id);
    data = await getOnboardingData(citizen.id);
    } catch (error) {
    console.error("Citizen onboarding load error:", error);

    return (
      <AppShell user={user}>
        <div className="rounded border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-800">
          <p className="font-semibold">Onboarding-fejl</p>
          <p className="mt-2">
            {JSON.stringify(error, null, 2)}
          </p>
        </div>
      </AppShell>
    );
  }

  if (onboarding.onboarding_completed) {
    redirect("/dashboard/borger");
  }

  return (
    <AppShell user={user}>
      <CitizenOnboardingWizard
        citizenName={citizen.citizen_name ?? user.fullName}
        initialStep={onboarding.current_step ?? 1}
        data={data}
      />
    </AppShell>
  );
}
