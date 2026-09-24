import OpenAI from "openai";
import type { Citizen, DiaryEntry } from "@/types/database";

export const FUNCTIONAL_THEMES = [
  "Energi og udtrætning",
  "Psykisk belastning",
  "Fysisk belastning og smerter",
  "Struktur og overblik",
  "Koncentration",
  "Arbejdstempo",
  "Sociale relationer",
  "Transport",
  "Personlig pleje",
  "Praktiske opgaver",
  "Stabilitet og fremmøde",
  "Pauser og restitution",
  "Arbejdsopgaver og skånehensyn",
  "Udviklingsmuligheder"
] as const;

export type AnalysisRiskLevel = "green" | "yellow" | "red" | "neutral";
export type AnalysisStatus = "draft" | "generated" | "reviewed" | "approved" | "used_in_report";

export type FunctionalThemeAnalysis = {
  theme: string;
  description: string;
  evidenceDates: string[];
};

export type AiAnalysisOutput = {
  riskLevel: AnalysisRiskLevel;
  title: string;
  summary: string;
  observations: string[];
  patterns: string[];
  functionalThemes: FunctionalThemeAnalysis[];
  supportNeeds: string[];
  criticalObservations: string[];
  citizenReflection: string[];
  functionalDescriptionDraft: string;
};

export type AiAnalysis = {
  id: string;
  citizen_id: string;
  generated_by: string | null;
  analysis_type: string;
  period_start: string | null;
  period_end: string | null;
  version_number: number;
  status: AnalysisStatus;
  risk_level: AnalysisRiskLevel;
  title: string | null;
  summary: string | null;
  observations: unknown;
  patterns: unknown;
  functional_themes: unknown;
  support_needs: unknown;
  critical_observations: unknown;
  citizen_reflection: unknown;
  administrator_comment: string | null;
  approved_by: string | null;
  approved_at: string | null;
  used_in_report: boolean;
  prompt_version: string | null;
  model_used: string | null;
  created_at: string;
  updated_at: string;
};

type NoteLike = {
  id: string;
  diary_entry_id?: string | null;
  author_role?: string | null;
  body: string;
  created_at: string;
};

type AttachmentLike = {
  id: string;
  diary_entry_id?: string | null;
  file_name: string;
  mime_type: string;
  file_size?: number | null;
  created_at: string;
};

type PreviousAnalysisLike = {
  id: string;
  version_number: number;
  title?: string | null;
  summary?: string | null;
  risk_level?: string | null;
  created_at: string;
};

export type AnalysisPromptContext = {
  citizen: Citizen;
  diaryEntries: DiaryEntry[];
  adminNotes?: NoteLike[];
  attachments?: AttachmentLike[];
  previousAnalyses?: PreviousAnalysisLike[];
  periodStart?: string | null;
  periodEnd?: string | null;
  analysisType: string;
};

export const AI_ANALYSIS_PROMPT_VERSION = "favn360-analyse-v1";
const DEFAULT_MODEL = "gpt-4o-mini";

function cleanJsonValue(value: unknown) {
  if (value === undefined || value === "") return null;
  return value;
}

function entryForPrompt(entry: DiaryEntry) {
  const dbEntry = entry as DiaryEntry & Record<string, unknown>;
  return Object.fromEntries(
    [
      "entry_date",
      "status",
      "home_day",
      "home_day_description",
      "sleep",
      "sleep_description",
      "fatigue_wakeup",
      "fatigue_waking",
      "fatigue_getting_up",
      "fatigue_daytime",
      "fatigue_bedtime",
      "mental_wakeup",
      "mental_waking",
      "mental_getting_up",
      "mental_daytime",
      "mental_bedtime",
      "pain_level",
      "pain_level_daytime",
      "pain_limitations",
      "home_planned_tasks",
      "planned_home_tasks",
      "home_completed_tasks",
      "completed_home_tasks",
      "went_well_home",
      "what_went_well",
      "mentally_challenging",
      "psychological_challenges",
      "coping",
      "challenge_handling",
      "tomorrow_takeaway",
      "take_to_tomorrow",
      "personal_care",
      "important_comments",
      "other_important_comments",
      "was_practice_day",
      "had_practice_day",
      "actual_start_time",
      "actual_end_time",
      "total_work_minutes",
      "calculated_work_minutes",
      "absence",
      "absence_reason",
      "skipped_or_stopped_tasks",
      "pressured_tasks",
      "limited_tasks",
      "went_well_work",
      "work_went_well",
      "difficult_work",
      "work_difficulties",
      "workload_fit",
      "workload_suitable",
      "break_count",
      "break_length",
      "break_total_minutes",
      "break_description",
      "collaboration",
      "colleague_cooperation",
      "work_pressure",
      "pressure_level",
      "function_level",
      "functional_level",
      "work_notes"
    ].map((key) => [key, cleanJsonValue(dbEntry[key])])
  );
}

export function buildAiAnalysisPrompt(context: AnalysisPromptContext) {
  return JSON.stringify(
    {
      role: "Favn360 Analyse",
      outputLabelInDocuments: "Systemgenereret analyse",
      promptVersion: AI_ANALYSIS_PROMPT_VERSION,
      analysisType: context.analysisType,
      period: {
        start: context.periodStart,
        end: context.periodEnd
      },
      citizenProfile: {
        practiceStartDate: context.citizen.practice_start_date,
        practiceEndDate: context.citizen.practice_end_date,
        weeklyHours: context.citizen.weekly_hours,
        healthInformation: context.citizen.health_information
      },
      diaryEntries: context.diaryEntries.map(entryForPrompt),
      adminNotes: (context.adminNotes ?? []).map((note) => ({ body: note.body, createdAt: note.created_at })),
      attachmentsMetadata: (context.attachments ?? []).map((attachment) => ({
        mimeType: attachment.mime_type,
        fileSize: attachment.file_size,
        createdAt: attachment.created_at
      })),
      previousAnalyses: (context.previousAnalyses ?? []).map((analysis) => ({
        version: analysis.version_number,
        title: analysis.title,
        summary: analysis.summary,
        riskLevel: analysis.risk_level,
        createdAt: analysis.created_at
      })),
      requiredFunctionalThemes: FUNCTIONAL_THEMES,
      writingInstructions: [
        "Skriv på dansk i en socialfaglig/fagprofessionel, neutral og direkte stil.",
        "Brug formuleringer som: Borger beskriver..., Der ses..., Registreringerne peger på..., Funktionsniveauet fremstår..., Der er behov for opmærksomhed på...",
        "Opsummer neutralt, identificer mønstre, funktionelle temaer, belastning/stress, udvikling i arbejdspraksis, fremmøde/stabilitet, udtrætning, psykisk belastning, smerter, pres og funktionsniveau.",
        "Beskriv støttebehov og borgerrettede refleksions-/støtteforslag deskriptivt.",
        "Lav et udkast til funktionsevnebeskrivelse, der kan bearbejdes af fagperson.",
        "Hvis datagrundlaget er utilstrækkeligt, skal det fremgå tydeligt."
      ],
      forbiddenConclusions: [
        "Stil ikke diagnoser.",
        "Lav ikke juridiske konklusioner.",
        "Lav ikke endelig kommunal vurdering.",
        "Afgør ikke arbejdsevne.",
        "Anbefal ikke medicin eller behandling.",
        "Brug ikke dramatisk eller alarmistisk sprog."
      ],
      outputJsonSchema: {
        riskLevel: "green|yellow|red|neutral",
        title: "string",
        summary: "string",
        observations: ["string"],
        patterns: ["string"],
        functionalThemes: [{ theme: "string", description: "string", evidenceDates: ["YYYY-MM-DD"] }],
        supportNeeds: ["string"],
        criticalObservations: ["string"],
        citizenReflection: ["string"],
        functionalDescriptionDraft: "string"
      }
    },
    null,
    2
  );
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizeRiskLevel(value: unknown): AnalysisRiskLevel {
  return value === "green" || value === "yellow" || value === "red" || value === "neutral" ? value : "neutral";
}

export function normalizeAnalysisOutput(value: unknown): AiAnalysisOutput {
  const object = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const themes = Array.isArray(object.functionalThemes)
    ? object.functionalThemes.map((theme) => {
        const item = theme && typeof theme === "object" ? (theme as Record<string, unknown>) : {};
        return {
          theme: String(item.theme ?? "").trim(),
          description: String(item.description ?? "").trim(),
          evidenceDates: asStringArray(item.evidenceDates)
        };
      }).filter((theme) => theme.theme && theme.description)
    : [];

  return {
    riskLevel: normalizeRiskLevel(object.riskLevel),
    title: String(object.title ?? "Favn360 Analyse").trim() || "Favn360 Analyse",
    summary: String(object.summary ?? "").trim(),
    observations: asStringArray(object.observations),
    patterns: asStringArray(object.patterns),
    functionalThemes: themes,
    supportNeeds: asStringArray(object.supportNeeds),
    criticalObservations: asStringArray(object.criticalObservations),
    citizenReflection: asStringArray(object.citizenReflection),
    functionalDescriptionDraft: String(object.functionalDescriptionDraft ?? "").trim()
  };
}

export function fallbackAnalysisOutput(context: AnalysisPromptContext, reason?: string): AiAnalysisOutput {
  const dates = context.diaryEntries.map((entry) => entry.entry_date).sort();
  const dateText = dates.length ? dates.join(", ") : "ingen registrerede datoer";
  const missingKeyText = reason
    ? `Der er anvendt sikker placeholder, fordi ${reason}`
    : "Der er anvendt sikker placeholder, fordi systemet ikke kunne hente en systemgenereret analyse.";

  return {
    riskLevel: context.diaryEntries.length ? "neutral" : "neutral",
    title: "Favn360 Analyse",
    summary: `${missingKeyText}. Datagrundlaget omfatter ${context.diaryEntries.length} dagbogsregistrering(er): ${dateText}.`,
    observations: [
      `Borger beskriver registreringer i perioden ${context.periodStart ?? "ikke angivet"} til ${context.periodEnd ?? "ikke angivet"}.`,
      "Der er behov for faglig gennemgang, før teksten anvendes i dokumentation."
    ],
    patterns: ["Der er ikke udledt sikre mønstre, fordi analysen ikke er gennemført med aktiv AI-nøgle."],
    functionalThemes: FUNCTIONAL_THEMES.map((theme) => ({
      theme,
      description: "Datagrundlaget skal gennemgås fagligt, før der beskrives konkluderende mønstre for temaet.",
      evidenceDates: dates
    })),
    supportNeeds: ["Der er behov for opmærksomhed på struktur, pauser og tydelig faglig vurdering af registreringerne."],
    criticalObservations: ["Ingen kritiske observationer er systemgenereret på det foreliggende placeholder-grundlag."],
    citizenReflection: ["Borger kan bruge registreringerne som afsæt for dialog om belastning, pauser og støttebehov."],
    functionalDescriptionDraft:
      "Registreringerne peger på, at funktionsniveau, belastning og støttebehov bør beskrives med konkret henvisning til borgerens dagbogsdata. Datagrundlaget er ikke analyseret med aktiv AI-nøgle."
  };
}

export async function generateAiAnalysisOutput(context: AnalysisPromptContext) {
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  if (!process.env.OPENAI_API_KEY) {
    return {
      output: fallbackAnalysisOutput(context, "OPENAI_API_KEY mangler"),
      modelUsed: "placeholder",
      rawText: null,
      warning: "OPENAI_API_KEY mangler. Der vises en sikker placeholder-analyse."
    };
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  });
  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Du er Favn360 Analyse, en dansk socialfaglig dokumentationsassistent. Returner kun valid JSON. Du må ikke diagnosticere, lave juridiske konklusioner, afgøre arbejdsevne eller lave endelig kommunal vurdering."
      },
      {
        role: "user",
        content: buildAiAnalysisPrompt(context)
      }
    ]
  });

  const rawText = response.choices[0]?.message.content ?? "";

  try {
    return {
      output: normalizeAnalysisOutput(JSON.parse(rawText)),
      modelUsed: model,
      rawText: null,
      warning: null
    };
  } catch (error) {
    console.error("[favn360] AI response could not be parsed as JSON.", {
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    return {
      output: fallbackAnalysisOutput(context, "AI-svaret kunne ikke læses som JSON"),
      modelUsed: model,
      rawText: null,
      warning: "AI-svaret kunne ikke læses som JSON. Der er gemt en sikker fallback."
    };
  }
}

export function listFromJson(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  return [];
}

export function riskLabel(level: AnalysisRiskLevel | string | null | undefined) {
  if (level === "green") return "stabilt";
  if (level === "yellow") return "opmærksomhedspunkt";
  if (level === "red") return "markant belastning";
  return "utilstrækkeligt datagrundlag";
}
