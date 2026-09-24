import Link from "next/link";
import { PenLine } from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { PdfExportModal } from "@/components/PdfExportModal";
import { PdfVersionHistory } from "@/components/PdfVersionHistory";
import { AiAnalysisPanel } from "@/components/AiAnalysisPanel";
import { demoNotes } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth";
import { fallbackSummary } from "@/lib/ai";
import { fetchCitizenDiaryEntries } from "@/lib/diary-data";
import { fetchPdfExportsForCitizen } from "@/lib/pdf-export-data";
import { fetchAnalysesForCitizen } from "@/lib/ai-analysis-data";
import type { DiaryEntry } from "@/types/database";
import { getCitizenByUserId } from "@/lib/citizens";
import { buildTrendData } from "@/lib/trend-data";
import { TrendCharts } from "@/components/TrendCharts";
import { createClient } from "@/lib/supabase/server";
import { copenhagenDateKey, copenhagenDateTimeToUtcIso, copenhagenTimeZone } from "@/app/kalender/time";
import { eventStatuses, eventTypes, type CalendarEvent, type CalendarEventStatus, type CalendarEventType } from "@/app/kalender/types";

async function shouldRedirectToCitizenOnboarding(citizenId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("citizen_onboarding")
    .select("onboarding_completed")
    .eq("citizen_id", citizenId)
    .maybeSingle();

  if (error) {
    console.error("[favn360] Borger-onboarding gate kunne ikke hentes.", error);
    return false;
  }

  return !data?.onboarding_completed;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

function eventTypeLabel(type: CalendarEventType) {
  return eventTypes.find((item) => item.value === type)?.label ?? type;
}

function eventStatusLabel(status: CalendarEventStatus) {
  return eventStatuses.find((item) => item.value === status)?.label ?? status;
}

function formatEventDateTime(event: CalendarEvent) {
  const start = new Date(event.start_time);

  if (event.all_day) {
    return start.toLocaleDateString("da-DK", {
      timeZone: copenhagenTimeZone,
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  return start.toLocaleString("da-DK", {
    timeZone: copenhagenTimeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function fetchDashboardCalendarEvents(citizenId: string | null) {
  if (!citizenId) {
    return {
      data: [] as CalendarEvent[],
      warning: null
    };
  }

  const supabase = await createClient();
  const todayKey = copenhagenDateKey(new Date());
  const rangeEndKey = addDaysToDateKey(todayKey, 8);
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id,citizen_id,title,description,location,event_type,status,visibility,start_time,end_time,all_day")
    .eq("citizen_id", citizenId)
    .gte("start_time", copenhagenDateTimeToUtcIso(todayKey, "00:00"))
    .lt("start_time", copenhagenDateTimeToUtcIso(rangeEndKey, "00:00"))
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[favn360] Dashboard-kalender kunne ikke hentes.", error);
    return {
      data: [] as CalendarEvent[],
      warning: "Kalenderaftaler kunne ikke hentes."
    };
  }

  return {
    data: ((data ?? []) as CalendarEvent[]).filter((event) => event.citizen_id === citizenId),
    warning: null
  };
}

export default async function CitizenDashboardPage() {
  const user = await requireUser("citizen");
  const { citizen, warning: citizenWarning } = await getCitizenByUserId(user.id);

  if (citizen && (await shouldRedirectToCitizenOnboarding(citizen.id))) {
    redirect("/onboarding/borger");
  }

  const { data: diaryEntries, warning } = await fetchCitizenDiaryEntries();
  const summary = fallbackSummary(diaryEntries, demoNotes);
  const trendData = buildTrendData(diaryEntries);
  const latestEntry = diaryEntries[0] ?? null;
  const citizenName = citizen?.citizen_name ?? user.fullName;
  const { data: pdfExports, warning: pdfWarning } = await fetchPdfExportsForCitizen(citizen?.id ?? null);
  const { data: analyses, warning: analysisWarning } = await fetchAnalysesForCitizen(citizen?.id ?? null);
  const { data: calendarEvents, warning: calendarWarning } = await fetchDashboardCalendarEvents(citizen?.id ?? null);

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-funktion-blue">Mit dashboard</h1>
            <p className="mt-2 max-w-3xl leading-7 text-black/70">
              Overblik for {citizenName}: dagens registrering, praktikplan, Favn360 Analyse og eksport.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dagbog"
              className="focus-ring inline-flex items-center gap-2 rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
            >
              <PenLine className="h-5 w-5" />
              Udfyld dagbog
            </Link>

            <PdfExportModal citizenId={citizen?.id} citizenName={citizenName} disabled={!citizen} />
          </div>
        </div>

        {warning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {warning}
          </div>
        ) : null}

        {citizenWarning && !warning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {citizenWarning}
          </div>
        ) : null}

        {pdfWarning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {pdfWarning}
          </div>
        ) : null}

        {analysisWarning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {analysisWarning}
          </div>
        ) : null}

        {calendarWarning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {calendarWarning}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Section title="Seneste dagbog">
            {latestEntry ? (
              <DiaryEntryCard entry={latestEntry} />
            ) : (
              <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
                Der er endnu ikke gemt dagbogsregistreringer.
              </p>
            )}
          </Section>

          <Section title="Noter">
            {demoNotes.map((note) => (
              <div key={note.id} className="rounded border border-funktion-line p-4">
                <p className="text-sm font-semibold text-funktion-blue">
                  {note.author_role === "administrator" || note.author_role === "admin"
                    ? "Administrator"
                    : "Borger"}{" "}
                  · {new Date(note.created_at).toLocaleString("da-DK")}
                </p>

                <p className="mt-2 leading-7">{note.body}</p>
              </div>
            ))}
          </Section>
        </div>

        <Section title="Tidligere dagbøger">
          {diaryEntries.length > 0 ? (
            <div className="grid gap-4">
              {diaryEntries.map((entry) => (
                <DiaryEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
              Når du gemmer en dagbog, vises den her efter opdatering af siden.
            </p>
          )}
        </Section>

        <Section title="Favn360 Analyse">
          <AiAnalysisPanel
            citizenId={citizen?.id}
            analyses={analyses}
            mode="citizen"
            defaultPeriodStart={diaryEntries.at(-30)?.entry_date ?? diaryEntries.at(-1)?.entry_date ?? null}
            defaultPeriodEnd={diaryEntries[0]?.entry_date ?? null}
          />
        </Section>

        <Section title="Dokumentationsopsummering" description="Foreløbig lokal opsummering, hvis Favn360 Analyse ikke er genereret endnu.">
          <div className="grid gap-4 md:grid-cols-2">
            <SummaryBlock title="Objektive observationer" items={summary.objectiveObservations} />
            <SummaryBlock title="Borgerens egne beskrivelser" items={summary.citizenDescriptions} />
            <SummaryBlock title="Mønstre over tid" items={summary.patternsOverTime} />
            <SummaryBlock title="Skånebehov" items={summary.supportNeeds} />
          </div>
        </Section>

        <Section title="PDF-versioner">
          <PdfVersionHistory exports={pdfExports} />
        </Section>

        <Section
          title="Udvikling og trends"
          description="Visualisering af registreret udvikling over tid."
          >
            <TrendCharts data={trendData} />
            </Section>
        <Section title="Kalender" description="Dine nærmeste aftaler fra kalenderen.">
          <DashboardCalendar events={calendarEvents} />
        </Section>
      </div>
    </AppShell>
  );
}

function DashboardCalendar({ events }: { events: CalendarEvent[] }) {
  const todayKey = copenhagenDateKey(new Date());
  const now = Date.now();
  const todayEvents = events.filter((event) => copenhagenDateKey(event.start_time) === todayKey);
  const upcomingEvents = events.filter((event) => new Date(event.start_time).getTime() >= now);
  const nextEvent = upcomingEvents[0] ?? null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-funktion-blue">Overblik</h3>
          <p className="mt-1 text-sm text-black/65">Dagens aftaler, næste aftale og de kommende 7 dage.</p>
        </div>

        <Link
          href="/kalender"
          className="focus-ring inline-flex w-fit rounded border border-funktion-line px-4 py-2 text-sm font-semibold text-funktion-blue hover:bg-funktion-pale"
        >
          Åbn kalender
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 rounded border border-funktion-line p-4">
          <h3 className="font-semibold text-funktion-blue">Dagens aftaler</h3>
          {todayEvents.length > 0 ? (
            <div className="grid gap-3">
              {todayEvents.map((event) => (
                <DashboardCalendarEvent key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="rounded border border-dashed border-funktion-line p-4 text-sm leading-6 text-black/70">
              Ingen aftaler i dag
            </p>
          )}
        </div>

        <div className="grid gap-3 rounded border border-funktion-line p-4">
          <h3 className="font-semibold text-funktion-blue">Næste aftale</h3>
          {nextEvent ? (
            <DashboardCalendarEvent event={nextEvent} />
          ) : (
            <p className="rounded border border-dashed border-funktion-line p-4 text-sm leading-6 text-black/70">
              Ingen kommende aftaler
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded border border-funktion-line p-4">
        <h3 className="font-semibold text-funktion-blue">Kommende 7 dage</h3>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <DashboardCalendarEvent key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="rounded border border-dashed border-funktion-line p-4 text-sm leading-6 text-black/70">
            Ingen kommende aftaler
          </p>
        )}
      </div>
    </div>
  );
}

function DashboardCalendarEvent({ event }: { event: CalendarEvent }) {
  const isPractice = event.event_type === "practice";

  return (
    <article className="rounded border border-funktion-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-3 py-1 text-xs font-semibold ${isPractice ? "bg-blue-50 text-blue-800" : "bg-funktion-pale text-funktion-blue"}`}>
          {eventTypeLabel(event.event_type)}
        </span>
        <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/65">
          {eventStatusLabel(event.status)}
        </span>
      </div>

      <h4 className="mt-3 font-semibold text-funktion-blue">{event.title}</h4>
      <p className="mt-1 text-sm leading-6 text-black/70">{formatEventDateTime(event)}</p>
      {event.location ? <p className="mt-1 text-sm leading-6 text-black/70">Sted: {event.location}</p> : null}
    </article>
  );
}

function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const dbEntry = entry as DiaryEntry & Record<string, any>;

  const text =
    dbEntry.home_day_description ||
    dbEntry.home_day ||
    dbEntry.work_notes ||
    dbEntry.what_went_well ||
    "Ingen tekst registreret.";

  const hadPracticeDay = dbEntry.had_practice_day ?? dbEntry.was_practice_day;
  const workMinutes = dbEntry.calculated_work_minutes ?? dbEntry.total_work_minutes;

  return (
    <Link href={`/dagbog/${entry.id}`} className="focus-ring grid gap-3 rounded border border-funktion-line p-4 hover:bg-funktion-pale">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString("da-DK")}
        </h2>

        <StatusBadge status={entry.status ?? "draft"} />
      </div>

      <p className="leading-7 text-black/75">{text}</p>

      <p className="text-sm text-black/65">
        Praktik: {hadPracticeDay ? "ja" : "nej"} · Arbejdstid:{" "}
        {workMinutes !== null && workMinutes !== undefined
          ? `${workMinutes} minutter`
          : "ikke registreret"}
      </p>
    </Link>
  );
}

function SummaryBlock({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded border border-funktion-line p-4">
      <h3 className="font-semibold text-funktion-blue">{title}</h3>

      <ul className="mt-3 grid gap-2 text-sm leading-6 text-black/75">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
