import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { fetchDiaryEntryById, isDiaryLocked } from "@/lib/diary-data";
import type { DiaryEntry } from "@/types/database";

type DiaryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function value(entry: DiaryEntry, ...keys: string[]) {
  const dbEntry = entry as DiaryEntry & Record<string, any>;
  for (const key of keys) {
    const current = dbEntry[key];
    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }

  return null;
}

function boolText(current: unknown) {
  return current ? "Ja" : "Nej";
}

function displayValue(current: unknown) {
  if (current === null || current === undefined || current === "") {
    return "Ikke registreret";
  }

  if (typeof current === "boolean") {
    return boolText(current);
  }

  if (Array.isArray(current)) {
    return current.length > 0 ? current.join(", ") : "Ikke registreret";
  }

  return String(current);
}

function personalCareValue(entry: DiaryEntry) {
  const personalCare = value(entry, "personal_care");
  if (personalCare) {
    return personalCare;
  }

  const dbEntry = entry as DiaryEntry & Record<string, any>;
  return [
    dbEntry.hygiene_brushed_teeth ? "Børste tænder" : null,
    dbEntry.hygiene_brushed_hair ? "Børste hår" : null,
    dbEntry.hygiene_body_wash ? "Kropsbad" : null,
    dbEntry.hygiene_hair_wash ? "Hårvask" : null,
    dbEntry.hygiene_makeup ? "Make-up" : null,
    dbEntry.hygiene_dressing ? "Påklædning" : null
  ].filter(Boolean);
}

function DetailGrid({ items }: { items: Array<[string, unknown]> }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {items.map(([label, current]) => (
        <div key={label} className="rounded border border-funktion-line p-4">
          <dt className="text-sm font-semibold text-funktion-blue">{label}</dt>
          <dd className="mt-2 leading-7 text-black/75">{displayValue(current)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { data: entry, warning } = await fetchDiaryEntryById(id);

  if (!entry) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);
  const canEdit = user.role === "citizen" && entry.entry_date === today && !isDiaryLocked(entry);

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-funktion-blue">Dagbog</h1>
              <StatusBadge status={entry.status} />
            </div>
            <p className="mt-2 max-w-3xl leading-7 text-black/70">
              Registrering for {new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString("da-DK")}.
            </p>
          </div>

          {canEdit ? (
            <Link
              href={`/dagbog/${entry.id}/rediger`}
              className="focus-ring inline-flex items-center gap-2 rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
            >
              <PenLine className="h-5 w-5" />
              Rediger dagbog
            </Link>
          ) : null}
        </div>

        {warning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {warning}
          </div>
        ) : null}

        <Section title="Hjemmefunktion">
          <DetailGrid
            items={[
              ["Hvordan er det gået derhjemme?", value(entry, "home_day", "home_day_description")],
              ["Planlagte opgaver", value(entry, "home_planned_tasks", "planned_home_tasks")],
              ["Udførte opgaver", value(entry, "home_completed_tasks", "completed_home_tasks")],
              ["Hvad gik godt?", value(entry, "went_well_home", "what_went_well")],
              ["Psykiske udfordringer", value(entry, "mentally_challenging", "psychological_challenges")],
              ["Håndtering", value(entry, "coping", "challenge_handling")],
              ["Med til i morgen", value(entry, "tomorrow_takeaway", "take_to_tomorrow")],
              ["Personlig pleje", personalCareValue(entry)]
            ]}
          />
        </Section>

        <Section title="Søvn">
          <DetailGrid
            items={[
              ["Nattesøvn", value(entry, "sleep", "sleep_description")],
              ["Gik i seng igen", value(entry, "went_back_to_bed")]
            ]}
          />
        </Section>

        <Section title="Træthed">
          <DetailGrid
            items={[
              ["Ved opvågning", value(entry, "fatigue_wakeup", "fatigue_waking")],
              ["Da jeg stod op", value(entry, "fatigue_getting_up")],
              ["I løbet af dagen", value(entry, "fatigue_daytime")],
              ["Ved sengetid", value(entry, "fatigue_bedtime")]
            ]}
          />
        </Section>

        <Section title="Mentalt niveau">
          <DetailGrid
            items={[
              ["Ved opvågning", value(entry, "mental_wakeup", "mental_waking")],
              ["Da jeg stod op", value(entry, "mental_getting_up")],
              ["I løbet af dagen", value(entry, "mental_daytime")],
              ["Ved sengetid", value(entry, "mental_bedtime")]
            ]}
          />
        </Section>

        <Section title="Smerter">
          <DetailGrid
            items={[
              ["Smerteniveau", value(entry, "pain_level", "pain_level_daytime")],
              ["Smertebegrænsninger", value(entry, "pain_limitations")]
            ]}
          />
        </Section>

        <Section title="Praktik">
          <DetailGrid
            items={[
              ["Praktikdag", value(entry, "was_practice_day", "had_practice_day")],
              ["Mødetid", value(entry, "actual_start_time")],
              ["Sluttid", value(entry, "actual_end_time")],
              ["Arbejdstid", value(entry, "total_work_minutes", "calculated_work_minutes")],
              ["Fravær", value(entry, "absence")],
              ["Fraværsårsag", value(entry, "absence_reason")]
            ]}
          />
        </Section>

        <Section title="Pauser">
          <DetailGrid
            items={[
              ["Antal pauser", value(entry, "break_count")],
              ["Længde på pauser", value(entry, "break_length", "break_total_minutes")],
              ["Beskrivelse af pauser", value(entry, "break_description")]
            ]}
          />
        </Section>

        <Section title="Arbejdsfunktion">
          <DetailGrid
            items={[
              ["Arbejdsopgaver", value(entry, "work_notes")],
              ["Sprunget over eller stoppet", value(entry, "skipped_or_stopped_tasks")],
              ["Pressede opgaver", value(entry, "pressured_tasks")],
              ["Begrænsede opgaver", value(entry, "limited_tasks")],
              ["Hvad gik godt?", value(entry, "went_well_work", "work_went_well")],
              ["Hvad var svært?", value(entry, "difficult_work", "work_difficulties")],
              ["Passende arbejdsmængde", value(entry, "workload_fit", "workload_suitable")],
              ["Belastning/pres", value(entry, "work_pressure", "pressure_level")],
              ["Kollegaer og samarbejde", value(entry, "collaboration", "colleague_cooperation")],
              ["Funktionsniveau", value(entry, "function_level", "functional_level")]
            ]}
          />
        </Section>

        <Section title="Kommentarer">
          <DetailGrid items={[["Andre vigtige kommentarer", value(entry, "important_comments", "other_important_comments")]]} />
        </Section>
      </div>
    </AppShell>
  );
}
