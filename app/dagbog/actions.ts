"use server";

import { revalidatePath } from "next/cache";
import { calculateWorkMinutes } from "@/lib/practice-schedule";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAiAnalysis } from "@/lib/ai-analysis-data";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { getOrCreateCitizenForUser } from "@/lib/citizens";
import { fetchDiaryEntryById, isDiaryLocked } from "@/lib/diary-data";

export type SaveDiaryState = {
  ok: boolean;
  message: string | null;
};

function asBool(value: FormDataEntryValue | null) {
  return value === "true";
}

function asNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function selectedCare(formData: FormData, ...values: string[]) {
  const selected = formData.getAll("personal_care").map(String);
  return values.some((value) => selected.includes(value));
}

export async function saveDiaryEntry(_previousState: SaveDiaryState, formData: FormData): Promise<SaveDiaryState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Du er ikke logget ind. Log ind igen og prøv at gemme dagbogen."
    };
  }

  if (user.role !== "citizen") {
    return {
      ok: false,
      message: "Kun borgere kan gemme egne dagbogsregistreringer."
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "Supabase er ikke konfigureret. Dagbogen kan ikke gemmes permanent endnu."
    };
  }

  const entryDate = String(formData.get("entry_date") ?? new Date().toISOString().slice(0, 10));
  const existingEntryId = asText(formData.get("diary_entry_id"));
  const startTime = asText(formData.get("actual_start_time"));
  const endTime = asText(formData.get("actual_end_time"));
  const existingEntryResult = existingEntryId ? await fetchDiaryEntryById(existingEntryId) : null;

  if (existingEntryId && !existingEntryResult?.data) {
    return {
      ok: false,
      message: existingEntryResult?.warning ?? "Dagbogen blev ikke fundet, eller du har ikke adgang til den."
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  if (
    existingEntryResult?.data &&
    (existingEntryResult.data.entry_date !== today || isDiaryLocked(existingEntryResult.data))
  ) {
    return {
      ok: false,
      message: "Dagbogen kan ikke redigeres, fordi den er låst eller ikke længere er fra i dag."
    };
  }

  const effectiveEntryDate = existingEntryResult?.data?.entry_date ?? entryDate;
  const { citizen, warning: citizenWarning } = existingEntryResult?.data
    ? { citizen: { id: existingEntryResult.data.citizen_id }, warning: null }
    : await getOrCreateCitizenForUser(user);

  if (!citizen) {
    console.error("[favn360] Dagbogen kunne ikke gemmes: borger-række mangler.", {
      userId: user.id,
      warning: citizenWarning
    });

    return {
      ok: false,
      message: citizenWarning ?? "Borgeroplysninger mangler. Opret borgeren i citizens-tabellen og prøv igen."
    };
  }

  const payload = {

  citizen_id: citizen.id,

  entry_date: effectiveEntryDate,

  status: String(formData.get("status") ?? "draft") as "draft" | "completed",

  home_day_description: asText(formData.get("home_day")),

  sleep_description: asText(formData.get("sleep")),

  went_back_to_bed: asBool(formData.get("went_back_to_bed")),

  fatigue_waking: asNumber(formData.get("fatigue_wakeup")),

  fatigue_getting_up: asNumber(formData.get("fatigue_getting_up")),

  fatigue_daytime: asNumber(formData.get("fatigue_daytime")),

  fatigue_bedtime: asNumber(formData.get("fatigue_bedtime")),

  mental_waking: asNumber(formData.get("mental_wakeup")),

  mental_getting_up: asNumber(formData.get("mental_getting_up")),

  mental_daytime: asNumber(formData.get("mental_daytime")),

  mental_bedtime: asNumber(formData.get("mental_bedtime")),

  pain_level_daytime: asNumber(formData.get("pain_level")),

  pain_limitations: asText(formData.get("pain_limitations")),

  planned_home_tasks: asText(formData.get("home_planned_tasks")),

  completed_home_tasks: asText(formData.get("home_completed_tasks")),

  what_went_well: asText(formData.get("went_well_home")),

  psychological_challenges: asText(formData.get("mentally_challenging")),

  challenge_handling: asText(formData.get("coping")),

  take_to_tomorrow: asText(formData.get("tomorrow_takeaway")),

  hygiene_brushed_teeth: selectedCare(formData, "brushed_teeth", "Børste tænder"),

  hygiene_brushed_hair: selectedCare(formData, "brushed_hair", "Børste hår"),

  hygiene_body_wash: selectedCare(formData, "body_wash", "Kropsbad"),

  hygiene_hair_wash: selectedCare(formData, "hair_wash", "Hårvask"),

  hygiene_makeup: selectedCare(formData, "makeup", "Make-up"),

  hygiene_dressing: selectedCare(formData, "dressing", "Påklædning"),

  other_important_comments: asText(formData.get("important_comments")),

  had_practice_day: asBool(formData.get("was_practice_day")),

  actual_start_time: startTime,

  actual_end_time: endTime,

  calculated_work_minutes: calculateWorkMinutes(startTime, endTime),

  absence: asBool(formData.get("absence")),

  absence_reason: asText(formData.get("absence_reason")),

  skipped_or_stopped_tasks: asText(formData.get("skipped_or_stopped_tasks")),

  pressured_tasks: asText(formData.get("pressured_tasks")),

  limited_tasks: asText(formData.get("limited_tasks")),

  work_went_well: asText(formData.get("went_well_work")),

  work_difficulties: asText(formData.get("difficult_work")),

  workload_suitable: asText(formData.get("workload_fit")),

  break_count: asNumber(formData.get("break_count")),

  break_total_minutes: asNumber(formData.get("break_length")),

  break_description: asText(formData.get("break_description")),

  colleague_cooperation: asText(formData.get("collaboration")),

  pressure_level: asNumber(formData.get("work_pressure")),

  functional_level: asNumber(formData.get("function_level")),

  work_notes: asText(formData.get("work_notes")),

  created_by: user.id,

  updated_by: user.id

};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("diary_entries")
      .upsert(payload, { onConflict: "citizen_id,entry_date" })
      .select()
      .single();

    if (error) {
      console.error("[favn360] Dagbogen kunne ikke gemmes.", friendlyDatabaseError(error));

      return {
        ok: false,
        message: friendlyDatabaseError(error, "Dagbogen kunne ikke gemmes. Prøv igen senere.")
      };
    }

    try {
      const analysisResult = await createAiAnalysis({
        citizenId: citizen.id,
        periodStart: effectiveEntryDate,
        periodEnd: effectiveEntryDate,
        analysisType: "daily_mini",
        user
      });

      if (analysisResult.warning) {
        console.warn(analysisResult.warning);
      }
    } catch (analysisError) {
      console.warn(friendlyDatabaseError(analysisError, "Favn360 Analyse kunne ikke gemmes."));
    }

    try {
      await writeAuditLog({
        action: "diary_updated",
        actorId: user.id,
        citizenId: citizen.id,
        entityType: "diary_entry",
        entityId: data.id,
        metadata: { entryDate: effectiveEntryDate }
      });
    } catch (auditError) {
      console.warn(friendlyDatabaseError(auditError, "Audit-log kunne ikke gemmes."));
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/borger");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dagbog");
    revalidatePath(`/dagbog/${data.id}`);
    revalidatePath(`/dagbog/${data.id}/rediger`);

    return {
      ok: true,
      message: "Dagbogen er gemt."
    };
  } catch (error) {
    console.error("[favn360] Dagbogen kunne ikke gemmes.", friendlyDatabaseError(error));

    return {
      ok: false,
      message: friendlyDatabaseError(error, "Dagbogen kunne ikke gemmes. Prøv igen senere.")
    };
  }
}
