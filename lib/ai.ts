import OpenAI from "openai";
import type { DiaryEntry, DiaryNote } from "@/types/database";

export type AiSummary = {
  objectiveObservations: string[];
  citizenDescriptions: string[];
  patternsOverTime: string[];
  supportNeeds: string[];
  development: string[];
  functionalDescriptionSuggestions: string[];
};

export function fallbackSummary(entries: DiaryEntry[], notes: DiaryNote[] = []): AiSummary {
  const dated = entries.map((entry) => entry.entry_date).join(", ") || "ingen datoer";
  const noteCount = notes.length;

  return {
    objectiveObservations: [`Der foreligger ${entries.length} dagbogsregistrering(er) for perioden: ${dated}.`],
    citizenDescriptions: entries
      .filter((entry) => entry.home_day || entry.work_notes)
      .map((entry) => `${entry.entry_date}: ${entry.home_day ?? entry.work_notes}`),
    patternsOverTime: ["Der skal indsamles flere registreringer, før mønstre over tid kan beskrives sikkert."],
    supportNeeds: ["Foreløbigt ses behov for tydelig struktur, pauser og afgrænsede opgaver."],
    development: [`Der er ${noteCount} supplerende note(r), som bør indgå i den socialfaglige gennemgang.`],
    functionalDescriptionSuggestions: [
      "Borger beskriver varierende energi og behov for skånsom optrapning med mulighed for pauser."
    ]
  };
}

export async function generateAiSummary(entries: DiaryEntry[], notes: DiaryNote[] = []) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSummary(entries, notes);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Du er en neutral dansk socialfaglig dokumentationsassistent. Undgå diagnoser, juridiske konklusioner og endelige myndighedsvurderinger. Marker tydeligt borgeroplysninger, administratornoter og AI-genereret tekst."
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction:
              "Lav en kort AI-opsummering opdelt i JSON-nøglerne objectiveObservations, citizenDescriptions, patternsOverTime, supportNeeds, development og functionalDescriptionSuggestions. Citér konkrete datoer hvor relevant.",
            diaryEntries: entries,
            notes
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return fallbackSummary(entries, notes);
    }

    return JSON.parse(content) as AiSummary;
  } catch {
    return fallbackSummary(entries, notes);
  }
}
