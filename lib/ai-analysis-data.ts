import { revalidatePath } from "next/cache";
import { hasSupabaseEnv, isAiAnalysisEnabled, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getCitizenByUserId } from "@/lib/citizens";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { writeAuditLog } from "@/lib/audit";
import {
  AI_ANALYSIS_PROMPT_VERSION,
  fallbackAnalysisOutput,
  generateAiAnalysisOutput,
  type AiAnalysis,
  type AnalysisStatus
} from "@/lib/ai-analysis";
import type { Citizen, DiaryEntry } from "@/types/database";

type DataResult<T> = {
  data: T;
  warning: string | null;
};

type SupabaseLike = Awaited<ReturnType<typeof createClient>>;

function demoAnalysis(citizenId = "demo-citizen"): AiAnalysis {
  const output = fallbackAnalysisOutput({
    citizen: {
      id: citizenId,
      user_id: "demo-citizen",
      citizen_name: "Demo Borger",
      birth_year: null,
      practice_place: "Demo praktiksted",
      contact_person: null,
      administrator_name: null,
      practice_start_date: null,
      practice_end_date: null,
      weekly_hours: null,
      health_information: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    diaryEntries: [],
    analysisType: "dashboard",
    periodStart: null,
    periodEnd: null
  }, "Supabase ikke er konfigureret");

  return {
    id: "demo-analysis",
    citizen_id: citizenId,
    generated_by: null,
    analysis_type: "dashboard",
    period_start: null,
    period_end: null,
    version_number: 1,
    status: "generated",
    risk_level: output.riskLevel,
    title: output.title,
    summary: output.summary,
    observations: output.observations,
    patterns: output.patterns,
    functional_themes: output.functionalThemes,
    support_needs: output.supportNeeds,
    critical_observations: output.criticalObservations,
    citizen_reflection: output.citizenReflection,
    administrator_comment: null,
    approved_by: null,
    approved_at: null,
    used_in_report: false,
    prompt_version: AI_ANALYSIS_PROMPT_VERSION,
    model_used: "placeholder",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function canAccessCitizen(user: CurrentUser, citizenId: string) {
  if (user.role === "administrator") return true;
  if (user.role !== "citizen") return false;
  const { citizen } = await getCitizenByUserId(user.id);
  return citizen?.id === citizenId;
}

export async function fetchAnalysesForCitizen(citizenId: string | null, limit = 6): Promise<DataResult<AiAnalysis[]>> {
  if (!citizenId) return { data: [], warning: null };
  if (!hasSupabaseEnv()) {
    return isDemoMode()
      ? { data: [demoAnalysis(citizenId)], warning: null }
      : { data: [], warning: "Databasen er ikke konfigureret." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_analyses")
      .select("*")
      .eq("citizen_id", citizenId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: [], warning: friendlyDatabaseError(error, "Favn360 Analyse kunne ikke hentes.") };
    }

    return { data: (data ?? []) as AiAnalysis[], warning: null };
  } catch (error) {
    return { data: [], warning: friendlyDatabaseError(error, "Favn360 Analyse kunne ikke hentes.") };
  }
}

export async function fetchLatestAnalysisForPeriod(
  supabase: SupabaseLike,
  citizenId: string,
  periodStart: string | null,
  periodEnd: string | null
) {
  let query = supabase
    .from("ai_analyses")
    .select("*")
    .eq("citizen_id", citizenId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (periodStart) query = query.gte("period_end", periodStart);
  if (periodEnd) query = query.lte("period_start", periodEnd);

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.warn(friendlyDatabaseError(error, "Favn360 Analyse kunne ikke hentes til PDF."));
    return null;
  }

  return (data ?? null) as AiAnalysis | null;
}

export async function createAiAnalysis(input: {
  citizenId: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  analysisType?: string | null;
  user?: CurrentUser | null;
}) {
  if (!hasSupabaseEnv() && isDemoMode()) {
    return { analysis: demoAnalysis(input.citizenId), warning: "Supabase er ikke konfigureret. Der vises en demoanalyse." };
  }

  if (!hasSupabaseEnv()) {
    return { analysis: null, warning: "Databasen er ikke konfigureret." };
  }

  const user = input.user ?? await getCurrentUser();
  if (!user) {
    return { analysis: null, warning: "Du er ikke logget ind." };
  }

  if (!(await canAccessCitizen(user, input.citizenId))) {
    return { analysis: null, warning: "Du har ikke adgang til at analysere den valgte borger." };
  }

  const supabase = await createClient();
  if (!isAiAnalysisEnabled()) {
    return { analysis: null, warning: "AI-analyse er deaktiveret af hensyn til databeskyttelse." };
  }

  const { data: consent } = await supabase
    .from("citizen_consents")
    .select("ai_analysis")
    .eq("citizen_id", input.citizenId)
    .maybeSingle();
  if (consent?.ai_analysis !== true) {
    return { analysis: null, warning: "AI-analyse kræver et registreret, aktivt samtykke." };
  }

  const analysisType = input.analysisType || "period";
  const { data: citizenData, error: citizenError } = await supabase
    .from("citizens")
    .select("*")
    .eq("id", input.citizenId)
    .single();

  if (citizenError || !citizenData) {
    return { analysis: null, warning: friendlyDatabaseError(citizenError, "Borgeren kunne ikke hentes til analyse.") };
  }

  let diaryQuery = supabase
    .from("diary_entries")
    .select("*")
    .eq("citizen_id", input.citizenId)
    .order("entry_date", { ascending: true });

  if (input.periodStart) diaryQuery = diaryQuery.gte("entry_date", input.periodStart);
  if (input.periodEnd) diaryQuery = diaryQuery.lte("entry_date", input.periodEnd);

  const { data: diaryData, error: diaryError } = await diaryQuery;
  if (diaryError) {
    return { analysis: null, warning: friendlyDatabaseError(diaryError, "Dagbogsregistreringer kunne ikke hentes til analyse.") };
  }

  const diaryEntries = (diaryData ?? []) as DiaryEntry[];
  const entryIds = diaryEntries.map((entry) => entry.id);

  const adminNotes = entryIds.length
    ? await supabase
        .from("diary_notes")
        .select("id,diary_entry_id,author_role,body,created_at")
        .in("diary_entry_id", entryIds)
        .in("author_role", ["administrator", "admin"])
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (error) console.warn(friendlyDatabaseError(error, "Administratornoter kunne ikke hentes til analyse."));
          return data ?? [];
        })
    : [];

  const attachments = await supabase
    .from("attachments")
    .select("id,diary_entry_id,file_name,mime_type,file_size,created_at")
    .eq("citizen_id", input.citizenId)
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) console.warn(friendlyDatabaseError(error, "Bilagsmetadata kunne ikke hentes til analyse."));
      return data ?? [];
    });

  const previousAnalyses = await supabase
    .from("ai_analyses")
    .select("id,version_number,title,summary,risk_level,created_at")
    .eq("citizen_id", input.citizenId)
    .eq("analysis_type", analysisType)
    .order("created_at", { ascending: false })
    .limit(3)
    .then(({ data, error }) => {
      if (error) console.warn(friendlyDatabaseError(error, "Tidligere analyser kunne ikke hentes."));
      return data ?? [];
    });

  const context = {
    citizen: citizenData as Citizen,
    diaryEntries,
    adminNotes,
    attachments,
    previousAnalyses,
    periodStart: input.periodStart ?? diaryEntries[0]?.entry_date ?? null,
    periodEnd: input.periodEnd ?? diaryEntries.at(-1)?.entry_date ?? null,
    analysisType
  };

  let generated;
  try {
    generated = await generateAiAnalysisOutput(context);
  } catch (error) {
    console.error("[favn360] Favn360 Analyse fejlede.", error);
    generated = {
      output: fallbackAnalysisOutput(context, "AI-kaldet fejlede"),
      modelUsed: "placeholder",
      rawText: null,
      warning: "AI-kaldet fejlede. Der er gemt en sikker placeholder-analyse."
    };
  }

  const { data: latestVersion } = await supabase
    .from("ai_analyses")
    .select("version_number")
    .eq("citizen_id", input.citizenId)
    .eq("analysis_type", analysisType)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versionNumber = ((latestVersion as { version_number?: number } | null)?.version_number ?? 0) + 1;
  const output = generated.output;
  const { data: inserted, error: insertError } = await supabase
    .from("ai_analyses")
    .insert({
      citizen_id: input.citizenId,
      generated_by: user.id,
      analysis_type: analysisType,
      period_start: context.periodStart,
      period_end: context.periodEnd,
      version_number: versionNumber,
      status: "generated",
      risk_level: output.riskLevel,
      title: output.title,
      summary: output.summary,
      observations: output.observations,
      patterns: output.patterns,
      functional_themes: output.functionalThemes,
      support_needs: output.supportNeeds,
      critical_observations: output.criticalObservations,
      citizen_reflection: output.citizenReflection,
      prompt_version: AI_ANALYSIS_PROMPT_VERSION,
      model_used: generated.modelUsed
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return { analysis: null, warning: friendlyDatabaseError(insertError, "Favn360 Analyse kunne ikke gemmes.") };
  }

  try {
    await writeAuditLog({
      action: "ai_generated",
      actorId: user.id,
      citizenId: input.citizenId,
      entityType: "ai_analysis",
      entityId: (inserted as AiAnalysis).id,
      metadata: { analysisType, versionNumber, periodStart: context.periodStart, periodEnd: context.periodEnd }
    });
  } catch (auditError) {
    console.warn(friendlyDatabaseError(auditError, "Audit-log kunne ikke gemmes."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/borger");
  revalidatePath("/dashboard/admin");

  return { analysis: inserted as AiAnalysis, warning: generated.warning };
}

export async function updateAiAnalysisWorkflow(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user || user.role !== "administrator") {
    return;
  }

  const analysisId = String(formData.get("analysisId") ?? "");
  const citizenId = String(formData.get("citizenId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!analysisId || !citizenId || !hasSupabaseEnv()) return;

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (action === "review") update.status = "reviewed" satisfies AnalysisStatus;
  if (action === "approve") {
    update.status = "approved" satisfies AnalysisStatus;
    update.approved_by = user.id;
    update.approved_at = new Date().toISOString();
  }
  if (action === "used") {
    update.status = "used_in_report" satisfies AnalysisStatus;
    update.used_in_report = true;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("ai_analyses").update(update).eq("id", analysisId).eq("citizen_id", citizenId);
    if (error) console.warn(friendlyDatabaseError(error, "Favn360 Analyse kunne ikke opdateres."));
  } catch (error) {
    console.warn(friendlyDatabaseError(error, "Favn360 Analyse kunne ikke opdateres."));
  }

  revalidatePath("/dashboard/admin");
}
