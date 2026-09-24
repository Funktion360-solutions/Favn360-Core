"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import {
  CheckboxGroup,
  InputField,
  NumberField,
  RadioGroup,
  TextAreaField,
  TimeField
} from "@/components/FormControls";
import { Section } from "@/components/Section";
import { saveDiaryEntry, type SaveDiaryState } from "./actions";
import type { DiaryEntry } from "@/types/database";

const careOptions = ["Børste tænder", "Børste hår", "Kropsbad", "Hårvask", "Make-up", "Påklædning"];
const initialState: SaveDiaryState = { ok: false, message: null };

type DiaryFormProps = {
  entry?: DiaryEntry;
};

function entryValue(entry: DiaryEntry | undefined, ...keys: string[]) {
  if (!entry) {
    return null;
  }

  const dbEntry = entry as DiaryEntry & Record<string, any>;
  for (const key of keys) {
    const value = dbEntry[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return null;
}

function boolValue(entry: DiaryEntry | undefined, ...keys: string[]) {
  return entryValue(entry, ...keys) ? "true" : "false";
}

function personalCareValues(entry: DiaryEntry | undefined) {
  const personalCare = entryValue(entry, "personal_care");
  if (Array.isArray(personalCare)) {
    return personalCare;
  }

  const dbEntry = (entry ?? {}) as DiaryEntry & Record<string, any>;
  return [
    dbEntry.hygiene_brushed_teeth ? "Børste tænder" : null,
    dbEntry.hygiene_brushed_hair ? "Børste hår" : null,
    dbEntry.hygiene_body_wash ? "Kropsbad" : null,
    dbEntry.hygiene_hair_wash ? "Hårvask" : null,
    dbEntry.hygiene_makeup ? "Make-up" : null,
    dbEntry.hygiene_dressing ? "Påklædning" : null
  ].filter(Boolean) as string[];
}

export function DiaryForm({ entry }: DiaryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveDiaryEntry, initialState);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const draftKey = entry ? `favn360-diary-draft-${entry.id}` : "favn360-diary-draft";

  useEffect(() => {
    const form = formRef.current;
    const saved = localStorage.getItem(draftKey);

    if (form && saved) {
      const values = JSON.parse(saved) as Record<string, string>;
      Object.entries(values).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          field.value = value;
        }
      });
    }

    const handleInput = () => {
      if (!form) {
        return;
      }

      const data = new FormData(form);
      const values = Object.fromEntries(data.entries());
      localStorage.setItem(draftKey, JSON.stringify(values));
      setSavedAt(new Date().toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }));
    };

    form?.addEventListener("input", handleInput);
    return () => form?.removeEventListener("input", handleInput);
  }, [draftKey]);

  useEffect(() => {
    if (state.ok) {
      localStorage.removeItem(draftKey);
      setSavedAt("gemt på server");
    }
  }, [draftKey, state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-6"
    >
      {entry ? <input type="hidden" name="diary_entry_id" value={entry.id} /> : null}
      <Section title="Registrering" description="Der kan oprettes én daglig registrering pr. dato. Dagens registrering kan redigeres indtil midnat.">
        <div className="grid gap-4 md:grid-cols-3">
          <InputField label="Dato" name="entry_date" defaultValue={entry?.entry_date ?? today} required />
          <label className="grid gap-2">
            <span className="font-medium">Status</span>
            <select name="status" defaultValue={entry?.status ?? "draft"} className="focus-ring rounded border border-funktion-line px-4 py-3">
              <option value="draft">Kladde</option>
              <option value="completed">Færdig</option>
            </select>
          </label>
          <div className="rounded border border-funktion-line bg-funktion-pale px-4 py-3 text-sm leading-6">
            Autosave lokalt: {savedAt ?? "ikke ændret endnu"}
          </div>
        </div>
      </Section>

      <Section title="Sektion 1: Registrering og evaluering af dag hjemme">
        <TextAreaField label="Hvordan er det gået derhjemme?" name="home_day" defaultValue={entryValue(entry, "home_day", "home_day_description")} />
        <TextAreaField label="Hvordan var din nattesøvn? Evt. årsag til forstyrret nattesøvn." name="sleep" defaultValue={entryValue(entry, "sleep", "sleep_description")} />
        <RadioGroup legend="Gik du i seng igen efter at stå op?" name="went_back_to_bed" defaultValue={boolValue(entry, "went_back_to_bed")} />
        <div className="grid gap-4 md:grid-cols-4">
          <NumberField label="Træthed ved opvågning" name="fatigue_wakeup" defaultValue={entryValue(entry, "fatigue_wakeup", "fatigue_waking")} />
          <NumberField label="Træthed da jeg stod op" name="fatigue_getting_up" defaultValue={entryValue(entry, "fatigue_getting_up")} />
          <NumberField label="Træthed i løbet af dagen" name="fatigue_daytime" defaultValue={entryValue(entry, "fatigue_daytime")} />
          <NumberField label="Træthed ved sengetid" name="fatigue_bedtime" defaultValue={entryValue(entry, "fatigue_bedtime")} />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <NumberField label="Mentalt niveau/angst ved opvågning" name="mental_wakeup" defaultValue={entryValue(entry, "mental_wakeup", "mental_waking")} />
          <NumberField label="Mentalt niveau/angst da jeg stod op" name="mental_getting_up" defaultValue={entryValue(entry, "mental_getting_up")} />
          <NumberField label="Mentalt niveau/angst i løbet af dagen" name="mental_daytime" defaultValue={entryValue(entry, "mental_daytime")} />
          <NumberField label="Mentalt niveau/angst ved sengetid" name="mental_bedtime" defaultValue={entryValue(entry, "mental_bedtime")} />
        </div>
        <NumberField label="Smerteniveau i løbet af dagen" name="pain_level" defaultValue={entryValue(entry, "pain_level", "pain_level_daytime")} />
        <TextAreaField label="Smertebegrænsninger" name="pain_limitations" defaultValue={entryValue(entry, "pain_limitations")} />
        <TextAreaField label="Hvilke opgaver var på programmet derhjemme?" name="home_planned_tasks" defaultValue={entryValue(entry, "home_planned_tasks", "planned_home_tasks")} />
        <TextAreaField label="Hvilke opgaver blev udført?" name="home_completed_tasks" defaultValue={entryValue(entry, "home_completed_tasks", "completed_home_tasks")} />
        <TextAreaField label="Hvad gik godt i dag?" name="went_well_home" defaultValue={entryValue(entry, "went_well_home", "what_went_well")} />
        <TextAreaField label="Hvad var udfordrende psykisk?" name="mentally_challenging" defaultValue={entryValue(entry, "mentally_challenging", "psychological_challenges")} />
        <TextAreaField label="Hvordan håndterede borgeren udfordringerne?" name="coping" defaultValue={entryValue(entry, "coping", "challenge_handling")} />
        <TextAreaField label="Hvad vil borgeren tage med i morgen?" name="tomorrow_takeaway" defaultValue={entryValue(entry, "tomorrow_takeaway", "take_to_tomorrow")} />
        <CheckboxGroup legend="Personlig pleje" name="personal_care" options={careOptions} selected={personalCareValues(entry)} />
        <TextAreaField label="Andre vigtige kommentarer eller oplysninger" name="important_comments" defaultValue={entryValue(entry, "important_comments", "other_important_comments")} />
      </Section>

      <Section title="Sektion 2: Arbejdsdag/praktik">
        <RadioGroup legend="Har der været praktikdag i dag?" name="was_practice_day" defaultValue={boolValue(entry, "was_practice_day", "had_practice_day")} />
        <div className="grid gap-4 md:grid-cols-3">
          <TimeField label="Faktisk mødetid" name="actual_start_time" defaultValue={entryValue(entry, "actual_start_time")} />
          <TimeField label="Faktisk sluttid" name="actual_end_time" defaultValue={entryValue(entry, "actual_end_time")} />
          <RadioGroup legend="Fravær" name="absence" defaultValue={boolValue(entry, "absence")} />
        </div>
        <TextAreaField label="Fraværsårsag" name="absence_reason" defaultValue={entryValue(entry, "absence_reason")} />
        <TextAreaField label="Hvilke arbejdsopgaver har borgeren udført?" name="work_notes" defaultValue={entryValue(entry, "work_notes")} />
        <TextAreaField label="Hvilke opgaver måtte borgeren springe over eller stoppe?" name="skipped_or_stopped_tasks" defaultValue={entryValue(entry, "skipped_or_stopped_tasks")} />
        <TextAreaField label="Hvilke opgaver følte borgeren sig presset i?" name="pressured_tasks" defaultValue={entryValue(entry, "pressured_tasks")} />
        <TextAreaField label="Hvilke opgaver følte borgeren sig begrænset i?" name="limited_tasks" defaultValue={entryValue(entry, "limited_tasks")} />
        <TextAreaField label="Hvad er gået godt?" name="went_well_work" defaultValue={entryValue(entry, "went_well_work", "work_went_well")} />
        <TextAreaField label="Hvad har været svært?" name="difficult_work" defaultValue={entryValue(entry, "difficult_work", "work_difficulties")} />
        <InputField label="Har mængden af arbejdsopgaver været passende?" name="workload_fit" defaultValue={entryValue(entry, "workload_fit", "workload_suitable")} />
        <div className="grid gap-4 md:grid-cols-3">
          <NumberField label="Antal pauser" name="break_count" defaultValue={entryValue(entry, "break_count")} />
          <InputField label="Længde på pauser" name="break_length" defaultValue={entryValue(entry, "break_length", "break_total_minutes")} />
          <NumberField label="Belastning/pres 1-10" name="work_pressure" defaultValue={entryValue(entry, "work_pressure", "pressure_level")} />
        </div>
        <TextAreaField label="Beskrivelse af pauser" name="break_description" defaultValue={entryValue(entry, "break_description")} />
        <TextAreaField label="Hvordan er det gået i forhold til kollegaer og samarbejde?" name="collaboration" defaultValue={entryValue(entry, "collaboration", "colleague_cooperation")} />
        <NumberField label="Funktionsniveau 1-10" name="function_level" defaultValue={entryValue(entry, "function_level", "functional_level")} />
      </Section>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-funktion-line bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-2">
          <p className="text-sm text-black/70">Når dagbogen gemmes, opdateres Favn360 Analyse automatisk.</p>
          {state.message ? (
            <p
              className={`rounded border px-4 py-3 text-sm ${
                state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>
        <button
          disabled={isPending}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-funktion-blue px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {isPending ? "Gemmer..." : "Gem dagbog"}
        </button>
      </div>
    </form>
  );
}
