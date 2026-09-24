"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getCitizenByUserId } from "@/lib/citizens";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { createClient } from "@/lib/supabase/server";
import { copenhagenDateTimeToUtcIso, padDatePart } from "@/app/kalender/time";

export type OnboardingActionState = {
  ok: boolean;
  message: string | null;
  nextStep?: number;
};

const initialError = "Onboarding kunne ikke gemmes. Prøv igen senere.";

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function asBool(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function asNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function getCitizenIdForCurrentUser() {
  const user = await requireUser("citizen");
  const { citizen, warning } = await getCitizenByUserId(user.id);

  if (!citizen) {
    return {
      citizenId: null,
      message: warning ?? "Borgerprofilen blev ikke fundet."
    };
  }

  return {
    citizenId: citizen.id,
    userId: user.id,
    message: null
  };
}

const practiceWeekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
] as const;

const weekdayIndexes: Record<(typeof practiceWeekdays)[number], number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0
};

function selectedPracticeWeekdays(formData: FormData) {
  const selected = formData.getAll("practice_weekdays").map(String);
  return practiceWeekdays.filter((weekday) => selected.includes(weekday));
}

function parseLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
}

function buildPracticeEvents({
  citizenId,
  userId,
  practiceCompany,
  practiceStartDate,
  practiceEndDate,
  weekdays
}: {
  citizenId: string;
  userId: string;
  practiceCompany: string | null;
  practiceStartDate: string | null;
  practiceEndDate: string | null;
  weekdays: Array<(typeof practiceWeekdays)[number]>;
}) {
  if (!practiceStartDate || !practiceEndDate || weekdays.length === 0) {
    return [];
  }

  const startDate = parseLocalDate(practiceStartDate);
  const endDate = parseLocalDate(practiceEndDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return [];
  }

  const selectedIndexes = new Set(weekdays.map((weekday) => weekdayIndexes[weekday]));
  const events = [];

  for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (!selectedIndexes.has(date.getDay())) {
      continue;
    }

    const dateKey = localDateKey(date);

    events.push({
      citizen_id: citizenId,
      created_by: userId,
      title: "Praktik",
      description: "Automatisk oprettet fra borgerens onboarding.",
      location: practiceCompany,
      event_type: "practice",
      status: "planned",
      visibility: "private",
      start_time: copenhagenDateTimeToUtcIso(dateKey, "07:30"),
      end_time: copenhagenDateTimeToUtcIso(dateKey, "10:00"),
      all_day: false,
      source: "onboarding_practice",
      source_ref: "practice"
    });
  }

  return events;
}

async function updateOnboardingStep(citizenId: string, step: number) {
  const supabase = await createClient();

  await supabase
    .from("citizen_onboarding")
    .update({
      current_step: step,
      updated_at: new Date().toISOString()
    })
    .eq("citizen_id", citizenId);
}

export async function saveCitizenOnboardingStep(
  _previousState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const step = Number(formData.get("step"));
  const nextStep = Math.min(Math.max(step + 1, 1), 8);
  const { citizenId, userId, message } = await getCitizenIdForCurrentUser();

  if (!citizenId || !userId) {
    return { ok: false, message };
  }

  const supabase = await createClient();

  try {
    if (step === 2) {
      const practiceWeekdayValues = selectedPracticeWeekdays(formData);
      const payload = {
        citizen_id: citizenId,
        in_practice: asBool(formData, "in_practice"),
        practice_company: asText(formData.get("practice_company")),
        practice_start_date: asText(formData.get("practice_start_date")),
        practice_end_date: asText(formData.get("practice_end_date")),
        practice_hours_per_week: asNumber(formData.get("practice_hours_per_week")),
        practice_contact_person: asText(formData.get("practice_contact_person")),
        practice_weekdays: practiceWeekdayValues,
        job_clarification: asBool(formData, "job_clarification"),
        resource_program: asBool(formData, "resource_program"),
        sick_leave: asBool(formData, "sick_leave"),
        cash_benefits: asBool(formData, "cash_benefits"),
        sickness_benefits: asBool(formData, "sickness_benefits"),
        disability_pension: asBool(formData, "disability_pension")
      };

      const { error: deleteError } = await supabase.from("citizen_employment").delete().eq("citizen_id", citizenId);
      if (deleteError) throw deleteError;

      const { error } = await supabase.from("citizen_employment").insert(payload);
      if (error) throw error;

      const { error: deletePracticeEventsError } = await supabase
        .from("calendar_events")
        .delete()
        .eq("citizen_id", citizenId)
        .eq("source", "onboarding_practice");
      if (deletePracticeEventsError) throw deletePracticeEventsError;

      const practiceEvents = buildPracticeEvents({
        citizenId,
        userId,
        practiceCompany: payload.practice_company,
        practiceStartDate: payload.practice_start_date,
        practiceEndDate: payload.practice_end_date,
        weekdays: payload.in_practice ? practiceWeekdayValues : []
      });

      if (practiceEvents.length > 0) {
        const { error: practiceEventsError } = await supabase.from("calendar_events").insert(practiceEvents);
        if (practiceEventsError) throw practiceEventsError;
      }
    }

    if (step === 3) {
      const areas = formData.getAll("function_area").map(String);
      const payload = areas.map((areaKey) => ({
        citizen_id: citizenId,
        category: asText(formData.get(`category_${areaKey}`)) ?? "Andet",
        title: asText(formData.get(`label_${areaKey}`)) ?? "Andet",
        severity: asText(formData.get(`severity_${areaKey}`)) ?? "moderate",
        description: asText(formData.get(`description_${areaKey}`))
      }));

      const { error: deleteError } = await supabase.from("citizen_function_profile").delete().eq("citizen_id", citizenId);
      if (deleteError) throw deleteError;

      if (payload.length > 0) {
        const { error } = await supabase.from("citizen_function_profile").insert(payload);
        if (error) throw error;
      }
    }

    if (step === 4) {
      const contactKeys = formData.getAll("contact_key").map(String);
      const payload = contactKeys
        .map((key) => ({
          citizen_id: citizenId,
          contact_type: asText(formData.get(`contact_type_${key}`)),
          name: asText(formData.get(`name_${key}`)),
          phone: asText(formData.get(`phone_${key}`)),
          email: asText(formData.get(`email_${key}`)),
          notes: asText(formData.get(`notes_${key}`))
        }))
        .filter((contact) => contact.name || contact.phone || contact.email || contact.notes);

      const { error: deleteError } = await supabase.from("citizen_contacts").delete().eq("citizen_id", citizenId);
      if (deleteError) throw deleteError;

      if (payload.length > 0) {
        const { error } = await supabase.from("citizen_contacts").insert(payload);
        if (error) throw error;
      }
    }

    if (step === 6) {
      const selectedGoals = formData.getAll("goal").map(String);
      const customGoal = asText(formData.get("custom_goal"));
      const payload = [
        ...selectedGoals.map((goal) => ({
          citizen_id: citizenId,
          goal_type: goal,
          custom_goal: null as string | null,
          active: true
        })),
        ...(customGoal
          ? [
            {
              citizen_id: citizenId,
              goal_type: "custom",
              custom_goal: customGoal,
              active: true
            }
          ]
        : [])
      ];

      const { error: deleteError } = await supabase.from("citizen_goals").delete().eq("citizen_id", citizenId);
      if (deleteError) throw deleteError;

      if (payload.length > 0) {
        const { error } = await supabase.from("citizen_goals").insert(payload);
        if (error) throw error;
      }
    }

    if (step === 7) {
      if (!asBool(formData, "data_processing")) {
        return {
          ok: false,
          message: "Du skal bekræfte, at du har læst privatlivspolitikken."
        };
      }

      const payload = {
        citizen_id: citizenId,
        data_processing: true,
        representative_sharing: asBool(formData, "representative_sharing"),
        ai_analysis: asBool(formData, "ai_analysis"),
        notifications: asBool(formData, "notifications")
      };

      const { error: deleteError } = await supabase.from("citizen_consents").delete().eq("citizen_id", citizenId);
      if (deleteError) throw deleteError;

      const { error } = await supabase.from("citizen_consents").insert(payload);
      if (error) throw error;
    }

    await updateOnboardingStep(citizenId, nextStep);
    revalidatePath("/onboarding/borger");

    return {
      ok: true,
      message: "Trinnet er gemt.",
      nextStep
    };
  } catch (error) {
    console.error("[favn360] Borger-onboarding kunne ikke gemmes.", friendlyDatabaseError(error));

    return {
      ok: false,
      message: friendlyDatabaseError(error, initialError)
    };
  }
}

export async function completeCitizenOnboarding(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard/borger");
  const safeRedirectTo = redirectTo === "/dagbog" ? "/dagbog" : "/dashboard/borger";
  const { citizenId } = await getCitizenIdForCurrentUser();

  if (!citizenId) {
    redirect("/dashboard/borger");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("citizen_onboarding")
    .update({
      onboarding_completed: true,
      current_step: 8,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("citizen_id", citizenId);

  if (error) {
    console.error("[favn360] Borger-onboarding kunne ikke færdiggøres.", friendlyDatabaseError(error));

    redirect("/onboarding/borger");
  }

  revalidatePath("/dashboard/borger");
  revalidatePath("/onboarding/borger");
  redirect(safeRedirectTo);
}
