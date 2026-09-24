import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { TrendCharts } from "@/components/TrendCharts";
import { DocumentUpload } from "@/components/DocumentUpload";

import { copenhagenDateKey, copenhagenDateTimeToUtcIso, copenhagenTimeZone } from "@/app/kalender/time";
import { eventStatuses, eventTypes, type CalendarEventStatus, type CalendarEventType } from "@/app/kalender/types";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildTrendData } from "@/lib/trend-data";

const DOCUMENT_BUCKET = process.env.DOCUMENT_BUCKET_NAME ?? "favn360-documents";

function formatDate(value: string | null | undefined) {
  if (!value) return "Ikke angivet";

  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("da-DK", {
    timeZone: copenhagenTimeZone
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Ikke angivet";

  return new Date(value).toLocaleString("da-DK", {
    timeZone: copenhagenTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function eventTypeLabel(type: CalendarEventType | string | null | undefined) {
  return eventTypes.find((item) => item.value === type)?.label ?? "Aftale";
}

function eventStatusLabel(status: CalendarEventStatus | string | null | undefined) {
  return eventStatuses.find((item) => item.value === status)?.label ?? "Ukendt";
}

function yesNo(value: boolean | null | undefined) {
  return value ? "Ja" : "Nej";
}

async function createCaseNote(citizenId: string, formData: FormData) {
  "use server";

  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!representative) return;

  const { data: relation } = await supabase
    .from("citizen_representative_links")
    .select("id")
    .eq("representative_id", representative.id)
    .eq("citizen_id", citizenId)
    .eq("status", "active")
    .maybeSingle();

  if (!relation) return;

  const note_type = String(formData.get("note_type") ?? "other");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return;

  await supabase.from("citizen_case_notes").insert({
    citizen_id: citizenId,
    representative_id: representative.id,
    author_id: user.id,
    note_type,
    title: title.length > 0 ? title : null,
    body
  });

  revalidatePath(`/dashboard/partsrepraesentant/klient/${citizenId}`);
}

async function deleteDocument(citizenId: string, documentId: string) {
  "use server";

  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!representative) return;

  const { data: relation } = await supabase
    .from("citizen_representative_links")
    .select("id")
    .eq("representative_id", representative.id)
    .eq("citizen_id", citizenId)
    .eq("status", "active")
    .maybeSingle();

  if (!relation) return;

  const { data: document } = await supabase
    .from("documents")
    .select("id,file_path")
    .eq("id", documentId)
    .eq("citizen_id", citizenId)
    .maybeSingle();

  if (!document?.file_path || !document.file_path.startsWith(`${citizenId}/`)) return;

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id)
    .eq("citizen_id", citizenId);

  if (!deleteError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([document.file_path]);
  }

  revalidatePath(`/dashboard/partsrepraesentant/klient/${citizenId}`);
}

export default async function RepresentativeClientPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();
  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!representative) notFound();

  const { data: relation } = await supabase
    .from("citizen_representative_links")
    .select("id,status,started_at")
    .eq("representative_id", representative.id)
    .eq("citizen_id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!relation) notFound();

  const { data: citizen } = await supabase.from("citizens").select("*").eq("id", id).single();

  if (!citizen) notFound();

  const { data: diaryEntries } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("entry_date", { ascending: false })
    .limit(30);

  const { data: analyses } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("created_at", { ascending: false });

  const { data: caseNotes } = await supabase
    .from("citizen_case_notes")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("created_at", { ascending: false });

  const { data: employment } = await supabase
    .from("citizen_employment")
    .select("*")
    .eq("citizen_id", citizen.id)
    .maybeSingle();

  const { data: onboarding } = await supabase
    .from("citizen_onboarding")
    .select("onboarding_completed,current_step,completed_at,updated_at")
    .eq("citizen_id", citizen.id)
    .maybeSingle();

  const { data: functionProfile } = await supabase
    .from("citizen_function_profile")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("category", { ascending: true });

  const { data: goals } = await supabase
    .from("citizen_goals")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("created_at", { ascending: false });

  const { data: consents } = await supabase
    .from("citizen_consents")
    .select("*")
    .eq("citizen_id", citizen.id)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const todayKey = copenhagenDateKey(new Date());
  const weekEndKey = addDaysToDateKey(todayKey, 8);

  const { data: calendarEvents } = await supabase
    .from("calendar_events")
    .select("id,citizen_id,title,description,location,event_type,status,visibility,start_time,end_time,all_day,source")
    .eq("citizen_id", citizen.id)
    .order("start_time", { ascending: true });

  const trendData = buildTrendData(diaryEntries ?? []);
  const sortedCalendarEvents = (calendarEvents ?? []).sort(
    (a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const todayEvents = sortedCalendarEvents.filter((event: any) => copenhagenDateKey(event.start_time) === todayKey);
  const upcomingWeekEvents = sortedCalendarEvents.filter(
    (event: any) =>
      new Date(event.start_time).getTime() >= new Date(copenhagenDateTimeToUtcIso(todayKey, "00:00")).getTime() &&
      new Date(event.start_time).getTime() < new Date(copenhagenDateTimeToUtcIso(weekEndKey, "00:00")).getTime()
  );
  const nextEvent = upcomingWeekEvents[0] ?? sortedCalendarEvents.find((event: any) => new Date(event.start_time).getTime() >= Date.now()) ?? null;
  const practiceCalendarEvents = sortedCalendarEvents.filter((event: any) => event.event_type === "practice");
  const absenceVacationEvents = sortedCalendarEvents.filter((event: any) => event.event_type === "absence" || event.event_type === "vacation");

  const timelineItems = [
    ...(diaryEntries ?? []).map((entry: any) => ({
      id: `diary-${entry.id}`,
      type: "diary",
      title: "Dagbogsregistrering",
      description:
        entry.home_day_description ??
        entry.work_went_well ??
        entry.went_well_work ??
        "Dagbogsregistrering oprettet",
      date: entry.entry_date
    })),
    ...(analyses ?? []).map((analysis: any) => ({
      id: `analysis-${analysis.id}`,
      type: "analysis",
      title: analysis.title ?? "Favn360 Analyse",
      description: analysis.summary ?? "Analyse genereret",
      date: analysis.created_at
    })),
    ...(caseNotes ?? []).map((note: any) => ({
      id: `note-${note.id}`,
      type: "note",
      title: note.title ?? noteTypeLabel(note.note_type),
      description: note.body ?? "Journalnote oprettet",
      date: note.created_at
    })),
    ...(documents ?? []).map((document: any) => ({
      id: `document-${document.id}`,
      type: "document",
      title: document.title ?? document.file_name,
      description: `${documentCategoryLabel(document.category)} · ${document.file_name}`,
      date: document.created_at
    })),
    ...sortedCalendarEvents.map((event: any) => ({
      id: `calendar-${event.id}`,
      type: "calendar",
      title: event.title,
      description: `${eventTypeLabel(event.event_type)} · ${event.location ?? "Sted ikke angivet"} · ${eventStatusLabel(event.status)}`,
      date: event.start_time
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const practiceEntries =
    diaryEntries?.filter(
      (entry: any) =>
        entry.had_practice_day ||
        entry.was_practice_day ||
        entry.actual_start_time ||
        entry.calculated_work_minutes ||
        entry.total_work_minutes ||
        entry.absence
    ) ?? [];

  const completedPracticeDays = practiceEntries.filter((entry: any) => !entry.absence);
  const absenceDays = practiceEntries.filter((entry: any) => entry.absence);

  const totalWorkedMinutes = completedPracticeDays.reduce(
    (sum: number, entry: any) => sum + (entry.calculated_work_minutes ?? entry.total_work_minutes ?? 0),
    0
  );

  const averageFunctionLevel =
    completedPracticeDays.length > 0
      ? (
          completedPracticeDays.reduce(
            (sum: number, entry: any) => sum + (entry.functional_level ?? entry.function_level ?? 0),
            0
          ) / completedPracticeDays.length
        ).toFixed(1)
      : null;

  const averagePressure =
    completedPracticeDays.length > 0
      ? (
          completedPracticeDays.reduce(
            (sum: number, entry: any) => sum + (entry.pressure_level ?? entry.work_pressure ?? 0),
            0
          ) / completedPracticeDays.length
        ).toFixed(1)
      : null;

  const attendanceRate =
    practiceEntries.length > 0
      ? Math.round((completedPracticeDays.length / practiceEntries.length) * 100)
      : null;

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">{citizen.citizen_name}</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Klientoverblik for partsrepræsentant.
          </p>
        </div>

        <Section title="Borgeroplysninger">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoCard label="Fødselsår" value={citizen.birth_year ?? "Ikke angivet"} />
            <InfoCard label="Kommune" value={citizen.municipality ?? "Ikke angivet"} />
            <InfoCard label="Relation" value={relation.status ?? "Ikke angivet"} />
            <InfoCard label="Tilknyttet" value={formatDate(relation.started_at)} />
            <InfoCard
              label="Onboarding"
              value={onboarding?.onboarding_completed ? "Gennemført" : `Trin ${onboarding?.current_step ?? "ikke angivet"}`}
            />
            <InfoCard label="Onboarding afsluttet" value={formatDateTime(onboarding?.completed_at)} />
          </div>
        </Section>

        <Section title="Beskæftigelse og praktik">
          {employment ? (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="I praktik" value={yesNo(employment.in_practice)} />
                <InfoCard label="Praktiksted" value={employment.practice_company ?? "Ikke angivet"} />
                <InfoCard
                  label="Praktikperiode"
                  value={`${formatDate(employment.practice_start_date)} - ${formatDate(employment.practice_end_date)}`}
                />
                <InfoCard label="Timer pr. uge" value={employment.practice_hours_per_week ?? "Ikke angivet"} />
                <InfoCard label="Kontaktperson" value={employment.practice_contact_person ?? "Ikke angivet"} />
                <InfoCard label="Praktikdage" value={formatPracticeWeekdays(employment.practice_weekdays)} />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <StatusPill label="Jobafklaring" active={employment.job_clarification} />
                <StatusPill label="Ressourceforløb" active={employment.resource_program} />
                <StatusPill label="Sygemeldt" active={employment.sick_leave} />
                <StatusPill label="Kontanthjælp" active={employment.cash_benefits} />
                <StatusPill label="Sygedagpenge" active={employment.sickness_benefits} />
                <StatusPill label="Førtidspension" active={employment.disability_pension} />
              </div>
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Borgeren har endnu ikke udfyldt beskæftigelsesoplysninger.
            </div>
          )}
        </Section>

        <Section title="Kalenderoverblik">
          <CalendarOverview
            todayEvents={todayEvents}
            upcomingWeekEvents={upcomingWeekEvents}
            nextEvent={nextEvent}
            practiceEvents={practiceCalendarEvents}
            absenceVacationEvents={absenceVacationEvents}
          />
        </Section>

        <Section title="Funktionsprofil">
          {functionProfile && functionProfile.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {functionProfile.map((item: any) => (
                <article key={item.id} className="rounded border border-funktion-line p-4">
                  <p className="text-xs uppercase tracking-wide text-black/50">{item.category}</p>
                  <h2 className="mt-2 font-semibold text-funktion-blue">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-black/70">{severityLabel(item.severity)}</p>
                  {item.description ? <p className="mt-3 leading-7 text-black/75">{item.description}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Borgeren har endnu ikke udfyldt funktionsprofil.
            </div>
          )}
        </Section>

        <Section title="Mål">
          {goals && goals.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {goals.map((goal: any) => (
                <article key={goal.id} className="rounded border border-funktion-line p-4">
                  <h2 className="font-semibold text-funktion-blue">{goal.custom_goal ?? goal.goal_type ?? "Mål"}</h2>
                  <p className="mt-1 text-sm text-black/65">Aktivt: {yesNo(goal.active)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Borgeren har endnu ikke angivet mål.
            </div>
          )}
        </Section>

        <Section title="Samtykker">
          {consents ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <InfoCard label="Databehandling" value={yesNo(consents.data_processing)} />
              <InfoCard label="Deling med partsrepræsentant" value={yesNo(consents.representative_sharing)} />
              <InfoCard label="Favn360 Analyse" value={yesNo(consents.ai_analysis)} />
              <InfoCard label="Notifikationer" value={yesNo(consents.notifications)} />
              <InfoCard label="Accepteret" value={formatDateTime(consents.accepted_at)} />
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Der er endnu ikke registreret samtykker.
            </div>
          )}
        </Section>

        <Section title="Dokumentarkiv" description="Upload og oversigt over dokumenter knyttet til borgerens forløb.">
          <DocumentUpload citizenId={citizen.id} />

          <div className="mt-6 grid gap-4">
            {documents && documents.length > 0 ? (
              documents.map((document: any) => (
                <article key={document.id} className="rounded border border-funktion-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-funktion-blue">
                        {document.title ?? document.file_name}
                      </h2>

                      <p className="mt-1 text-sm text-black/60">
                        {documentCategoryLabel(document.category)} · {document.file_name}
                      </p>

                      <p className="mt-1 text-xs text-black/50">
                        Uploadet {new Date(document.created_at).toLocaleString("da-DK")}
                      </p>

                      {document.file_size ? (
                        <p className="mt-1 text-xs text-black/50">
                          Størrelse: {(document.file_size / 1024 / 1024).toFixed(2).replace(".", ",")} MB
                        </p>
                      ) : null}
                    </div>

                    <form action={deleteDocument.bind(null, citizen.id, document.id)}>
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Slet
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
                Der er endnu ikke uploadet dokumenter.
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Praktikoverblik"
          description="Overblik fra beskæftigelsesdata, kalender og dagbogsregistreringer."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PracticeCard title="I praktik" value={employment ? yesNo(employment.in_practice) : "Ingen data"} />
            <PracticeCard title="Planlagte praktik-events" value={practiceCalendarEvents.length} />
            <PracticeCard title="Registrerede praktikdage" value={practiceEntries.length} />
            <PracticeCard title="Fremmøde" value={attendanceRate !== null ? `${attendanceRate}%` : "Ingen data"} />
            <PracticeCard title="Gennemførte timer" value={`${(totalWorkedMinutes / 60).toFixed(1).replace(".", ",")} timer`} />
            <PracticeCard title="Fravær" value={absenceDays.length} />
            <PracticeCard title="Gns. funktionsniveau" value={averageFunctionLevel?.replace(".", ",") ?? "Ingen data"} />
            <PracticeCard title="Gns. belastning" value={averagePressure?.replace(".", ",") ?? "Ingen data"} />
          </div>
        </Section>

        <Section title="Forløbstimeline" description="Samlet tidslinje over registreringer, analyser, journalnoter og dokumenter.">
          {timelineItems.length > 0 ? (
            <div className="relative border-l border-funktion-line pl-6">
              {timelineItems.map((item) => (
                <article key={item.id} className="relative mb-6">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-funktion-blue" />
                  <div className="rounded border border-funktion-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={timelineBadge(item.type)}>{timelineLabel(item.type)}</span>
                          <h3 className="font-semibold text-funktion-blue">{item.title}</h3>
                        </div>
                        <p className="mt-2 leading-7 text-black/80">{truncateTimelineText(item.description)}</p>
                      </div>
                      <p className="text-xs text-black/50">{formatDateTime(item.date)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Ingen hændelser i timeline endnu.
            </div>
          )}
        </Section>

        <Section title="Klientjournalnoter">
          <form action={createCaseNote.bind(null, citizen.id)} className="mb-6 grid gap-4 rounded border border-funktion-line p-4">
            <select name="note_type" className="rounded border border-funktion-line px-4 py-3" defaultValue="observation">
              <option value="meeting">Møde</option>
              <option value="phone">Telefon</option>
              <option value="observation">Observation</option>
              <option value="agreement">Aftale</option>
              <option value="follow_up">Opfølgning</option>
              <option value="other">Andet</option>
            </select>

            <input name="title" className="rounded border border-funktion-line px-4 py-3" placeholder="Titel" />

            <textarea
              name="body"
              rows={6}
              required
              className="rounded border border-funktion-line px-4 py-3"
              placeholder="Skriv partsrepræsentantens journalnote her."
            />

            <button type="submit" className="w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
              Gem journalnote
            </button>
          </form>

          {caseNotes && caseNotes.length > 0 ? (
            <div className="grid gap-4">
              {caseNotes.map((note: any) => (
                <article key={note.id} className="rounded border border-funktion-line p-4">
                  <h2 className="font-semibold text-funktion-blue">{note.title ?? "Journalnote"}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-black/50">{noteTypeLabel(note.note_type)}</p>
                  <p className="mt-3 leading-7 text-black/80">{note.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Der er endnu ikke oprettet journalnoter.
            </div>
          )}
        </Section>

        <Section title="Funktionstrends">
          <TrendCharts data={trendData} />
        </Section>

        <Section title="Seneste AI-analyser">
          {analyses && analyses.length > 0 ? (
            <div className="grid gap-4">
              {analyses.map((analysis: any) => (
                <article key={analysis.id} className="rounded border border-funktion-line p-5">
                  <h2 className="text-lg font-semibold text-funktion-blue">
                    {analysis.title ?? "Favn360 Analyse"}
                  </h2>
                  {analysis.summary ? <p className="mt-4 leading-7 text-black/80">{analysis.summary}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">Ingen analyser endnu.</div>
          )}
        </Section>

        <Section title="Seneste dagbogsregistreringer">
          {diaryEntries && diaryEntries.length > 0 ? (
            <div className="grid gap-4">
              {diaryEntries.map((entry: any) => (
                <article key={entry.id} className="rounded border border-funktion-line p-5">
                  <h2 className="text-lg font-semibold text-funktion-blue">
                    {formatDate(entry.entry_date)}
                  </h2>

                  {entry.home_day_description ? (
                    <p className="mt-3 leading-7 text-black/80">{entry.home_day_description}</p>
                  ) : null}

                  <a href={`/dagbog/${entry.id}`} className="mt-4 inline-flex rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white">
                    Åbn dagbog
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Ingen dagbogsregistreringer endnu.
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-funktion-line p-4">
      <p className="text-xs uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function PracticeCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded border border-funktion-line p-4">
      <p className="text-xs uppercase tracking-wide text-black/50">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-funktion-blue">{value}</p>
    </div>
  );
}

function documentCategoryLabel(category: string) {
  if (category === "laege") return "Lægedokument";
  if (category === "jobcenter") return "Jobcenter";
  if (category === "praktik") return "Praktik";
  if (category === "moede") return "Møde";
  if (category === "afgoerelse") return "Afgørelse";
  return "Andet";
}

function noteTypeLabel(type: string) {
  if (type === "meeting") return "Møde";
  if (type === "phone") return "Telefon";
  if (type === "observation") return "Observation";
  if (type === "agreement") return "Aftale";
  if (type === "follow_up") return "Opfølgning";
  return "Andet";
}

function timelineLabel(type: string) {
  if (type === "diary") return "Dagbog";
  if (type === "analysis") return "Analyse";
  if (type === "note") return "Journalnote";
  if (type === "document") return "Dokument";
  if (type === "calendar") return "Kalender";
  return "Hændelse";
}

function timelineBadge(type: string) {
  if (type === "diary") return "rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800";
  if (type === "analysis") return "rounded bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800";
  if (type === "note") return "rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800";
  if (type === "document") return "rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800";
  if (type === "calendar") return "rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800";
  return "rounded bg-black/10 px-2 py-1 text-xs font-semibold text-black/70";
}

function truncateTimelineText(text: string) {
  if (text.length <= 240) return text;
  return `${text.slice(0, 240)}...`;
}

function severityLabel(value: string | null | undefined) {
  if (value === "light") return "Let";
  if (value === "moderate") return "Moderat";
  if (value === "severe") return "Svær";
  if (value === "very_severe") return "Meget svær";
  return "Ikke angivet";
}

function formatPracticeWeekdays(values: string[] | null | undefined) {
  if (!values || values.length === 0) return "Ikke angivet";

  const labels: Record<string, string> = {
    monday: "Mandag",
    tuesday: "Tirsdag",
    wednesday: "Onsdag",
    thursday: "Torsdag",
    friday: "Fredag",
    saturday: "Lørdag",
    sunday: "Søndag"
  };

  return values.map((value) => labels[value] ?? value).join(", ");
}

function CalendarOverview({
  todayEvents,
  upcomingWeekEvents,
  nextEvent,
  practiceEvents,
  absenceVacationEvents
}: {
  todayEvents: any[];
  upcomingWeekEvents: any[];
  nextEvent: any | null;
  practiceEvents: any[];
  absenceVacationEvents: any[];
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 rounded border border-funktion-line p-4">
          <h3 className="font-semibold text-funktion-blue">Dagens aftaler</h3>
          {todayEvents.length > 0 ? (
            <div className="grid gap-3">
              {todayEvents.map((event) => (
                <CalendarEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="rounded border border-dashed border-funktion-line p-4 text-sm text-black/70">Ingen aftaler i dag</p>
          )}
        </div>

        <div className="grid gap-3 rounded border border-funktion-line p-4">
          <h3 className="font-semibold text-funktion-blue">Næste aftale</h3>
          {nextEvent ? (
            <CalendarEventCard event={nextEvent} />
          ) : (
            <p className="rounded border border-dashed border-funktion-line p-4 text-sm text-black/70">Ingen kommende aftaler</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <CalendarEventList title="Kommende 7 dage" events={upcomingWeekEvents} emptyText="Ingen kommende aftaler" />
        <CalendarEventList title="Praktik-events" events={practiceEvents.slice(0, 8)} emptyText="Ingen praktik-events" />
        <CalendarEventList title="Fravær og ferie" events={absenceVacationEvents.slice(0, 8)} emptyText="Ingen fravær eller ferie" />
      </div>
    </div>
  );
}

function CalendarEventList({ title, events, emptyText }: { title: string; events: any[]; emptyText: string }) {
  return (
    <div className="grid gap-3 rounded border border-funktion-line p-4">
      <h3 className="font-semibold text-funktion-blue">{title}</h3>
      {events.length > 0 ? (
        <div className="grid gap-3">
          {events.map((event) => (
            <CalendarEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded border border-dashed border-funktion-line p-4 text-sm text-black/70">{emptyText}</p>
      )}
    </div>
  );
}

function CalendarEventCard({ event }: { event: any }) {
  return (
    <article className="rounded border border-funktion-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-funktion-pale px-3 py-1 text-xs font-semibold text-funktion-blue">
          {eventTypeLabel(event.event_type)}
        </span>
        <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/65">
          {eventStatusLabel(event.status)}
        </span>
      </div>
      <h4 className="mt-3 font-semibold text-funktion-blue">{event.title}</h4>
      <p className="mt-1 text-sm text-black/70">{formatDateTime(event.start_time)}</p>
      {event.location ? <p className="mt-1 text-sm text-black/70">Sted: {event.location}</p> : null}
    </article>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean | null | undefined }) {
  return (
    <div className={`rounded border px-4 py-3 text-sm font-semibold ${active ? "border-green-200 bg-green-50 text-green-800" : "border-funktion-line bg-white text-black/60"}`}>
      {label}: {yesNo(active)}
    </div>
  );
}
