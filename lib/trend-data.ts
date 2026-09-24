import type { DiaryEntry } from "@/types/database";

export type TrendPoint = {
  date: string;
  fatigue: number | null;
  mental: number | null;
  pain: number | null;
  pressure: number | null;
  functionLevel: number | null;
  workMinutes: number | null;
};

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((v): v is number => typeof v === "number");
  if (valid.length === 0) return null;

  return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1));
}

function value(entry: DiaryEntry, key: string) {
  return (entry as DiaryEntry & Record<string, any>)[key];
}

export function buildTrendData(entries: DiaryEntry[]): TrendPoint[] {
  return [...entries]
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map((entry) => ({
      date: new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString("da-DK"),

      fatigue: average([
        value(entry, "fatigue_waking") ?? value(entry, "fatigue_wakeup"),
        value(entry, "fatigue_getting_up"),
        value(entry, "fatigue_daytime"),
        value(entry, "fatigue_bedtime"),
      ]),

      mental: average([
        value(entry, "mental_waking") ?? value(entry, "mental_wakeup"),
        value(entry, "mental_getting_up"),
        value(entry, "mental_daytime"),
        value(entry, "mental_bedtime"),
      ]),

      pain: value(entry, "pain_level_daytime") ?? value(entry, "pain_level") ?? null,
      pressure: value(entry, "pressure_level") ?? value(entry, "work_pressure") ?? null,
      functionLevel: value(entry, "functional_level") ?? value(entry, "function_level") ?? null,
      workMinutes: value(entry, "calculated_work_minutes") ?? value(entry, "total_work_minutes") ?? null,
    }));
}