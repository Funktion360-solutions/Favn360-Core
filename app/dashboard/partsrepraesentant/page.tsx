import Link from "next/link";
import { revalidatePath } from "next/cache";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { copenhagenTimeZone } from "@/app/kalender/time";
import { eventStatuses, eventTypes, type CalendarEventStatus, type CalendarEventType } from "@/app/kalender/types";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function acceptRequest(requestId: string) {
  "use server";

  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!representative) return;

  const { data: request } = await supabase
    .from("representative_requests")
    .select("id,citizen_id,representative_id,status")
    .eq("id", requestId)
    .eq("representative_id", representative.id)
    .eq("status", "pending")
    .single();

  if (!request) return;

  await supabase.from("citizen_representative_links").insert({
    citizen_id: request.citizen_id,
    representative_id: request.representative_id,
    status: "active",
    requested_by: user.id,
    approved_by: user.id,
    started_at: new Date().toISOString()
  });

  await supabase
    .from("representative_requests")
    .update({
      status: "accepted",
      handled_at: new Date().toISOString()
    })
    .eq("id", request.id);

  revalidatePath("/dashboard/partsrepraesentant");
}

async function rejectRequest(requestId: string) {
  "use server";

  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!representative) return;

  await supabase
    .from("representative_requests")
    .update({
      status: "rejected",
      handled_at: new Date().toISOString()
    })
    .eq("id", requestId)
    .eq("representative_id", representative.id);

  revalidatePath("/dashboard/partsrepraesentant");
}

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
    hour: "2-digit",
    minute: "2-digit"
  });
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

export default async function RepresentativeDashboardPage() {
  const user = await requireUser("partsrepraesentant");
  const supabase = await createClient();

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!representative) {
    return (
      <AppShell user={user}>
        <Section title="Opret partsrepræsentantprofil">
          <p className="leading-7 text-black/70">Du har endnu ikke oprettet en partsrepræsentantprofil.</p>

          <Link
            href="/onboarding/partsrepraesentant"
            className="mt-4 inline-flex w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
          >
            Opret profil
          </Link>
        </Section>
      </AppShell>
    );
  }

  const { data: requestRows } = await supabase
    .from("representative_requests")
    .select("id,message,status,created_at,citizen_id")
    .eq("representative_id", representative.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const requestCitizenIds = requestRows?.map((request: any) => request.citizen_id) ?? [];

  const { data: requestCitizens } =
    requestCitizenIds.length > 0
      ? await supabase.from("citizens").select("id,citizen_name,municipality").in("id", requestCitizenIds)
      : { data: [] };

  const requests =
    requestRows?.map((request: any) => ({
      ...request,
      citizen: requestCitizens?.find((citizen: any) => citizen.id === request.citizen_id) ?? null
    })) ?? [];

  const { data: clientLinks } = await supabase
    .from("citizen_representative_links")
    .select("id,status,started_at,citizen_id")
    .eq("representative_id", representative.id)
    .eq("status", "active")
    .order("started_at", { ascending: false });

  const clientCitizenIds = clientLinks?.map((client: any) => client.citizen_id) ?? [];

  const { data: clientCitizens } =
    clientCitizenIds.length > 0
      ? await supabase.from("citizens").select("id,citizen_name,municipality,birth_year").in("id", clientCitizenIds)
      : { data: [] };

  const { data: employments } =
    clientCitizenIds.length > 0
      ? await supabase.from("citizen_employment").select("*").in("citizen_id", clientCitizenIds)
      : { data: [] };

  const now = new Date().toISOString();
  const { data: upcomingCalendarEvents } =
    clientCitizenIds.length > 0
      ? await supabase
          .from("calendar_events")
          .select("id,citizen_id,title,event_type,status,location,start_time,end_time,all_day")
          .in("citizen_id", clientCitizenIds)
          .gte("start_time", now)
          .order("start_time", { ascending: true })
      : { data: [] };

  const { data: latestDiaryEntries } =
    clientCitizenIds.length > 0
      ? await supabase
          .from("diary_entries")
          .select("id,citizen_id,entry_date,status,home_day_description,work_notes")
          .in("citizen_id", clientCitizenIds)
          .order("entry_date", { ascending: false })
      : { data: [] };

  const clients =
    clientLinks?.map((link: any) => {
      const citizen = clientCitizens?.find((item: any) => item.id === link.citizen_id) ?? null;
      const employment = employments?.find((item: any) => item.citizen_id === link.citizen_id) ?? null;
      const nextEvent = upcomingCalendarEvents?.find((event: any) => event.citizen_id === link.citizen_id) ?? null;
      const latestDiary = latestDiaryEntries?.find((entry: any) => entry.citizen_id === link.citizen_id) ?? null;

      return {
        ...link,
        citizen,
        employment,
        nextEvent,
        latestDiary
      };
    }) ?? [];

  const clientsInPractice = clients.filter((client: any) => client.employment?.in_practice);

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Partsrepræsentant-dashboard</h1>

          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Overblik over klienter, anmodninger, praktikforløb og kommende aftaler.
          </p>
        </div>

        {!representative.approved_by_admin ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Din profil afventer administratorgodkendelse og vises derfor ikke offentligt endnu.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard title="Aktive klienter" value={clients.length} />
          <StatusCard title="Nye anmodninger" value={requests.length} />
          <StatusCard title="Kommende aftaler" value={upcomingCalendarEvents?.length ?? 0} />
          <StatusCard title="Klienter i praktik" value={clientsInPractice.length} />
        </div>

        <Section title="Nye anmodninger">
          {requests.length > 0 ? (
            <div className="grid gap-4">
              {requests.map((request: any) => (
                <article key={request.id} className="rounded border border-funktion-line p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-funktion-blue">
                        {request.citizen?.citizen_name ?? "Ukendt borger"}
                      </h2>
                      <p className="mt-1 text-sm text-black/60">
                        {request.citizen?.municipality ? `Kommune: ${request.citizen.municipality}` : "Kommune ikke angivet"}
                      </p>
                      <p className="mt-2 text-xs text-black/50">Modtaget: {formatDateTime(request.created_at)}</p>
                      {request.message ? (
                        <p className="mt-4 leading-7 text-black/80">{request.message}</p>
                      ) : (
                        <p className="mt-4 text-sm text-black/60">Borgeren har ikke skrevet en besked.</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <form action={acceptRequest.bind(null, request.id)}>
                        <button type="submit" className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white">
                          Accepter
                        </button>
                      </form>

                      <form action={rejectRequest.bind(null, request.id)}>
                        <button type="submit" className="rounded border border-funktion-line px-4 py-2 text-sm font-semibold">
                          Afvis
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="Ingen nye anmodninger." />
          )}
        </Section>

        <Section title="Mine klienter">
          {clients.length > 0 ? (
            <div className="grid gap-4">
              {clients.map((client: any) => (
                <article key={client.id} className="rounded border border-funktion-line p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-funktion-blue">
                        {client.citizen?.citizen_name ?? "Ukendt borger"}
                      </h2>
                      <p className="mt-1 text-sm text-black/65">
                        {client.citizen?.municipality ? `Kommune: ${client.citizen.municipality}` : "Kommune ikke angivet"}
                      </p>
                      <p className="mt-1 text-xs text-black/50">Tilknyttet: {formatDate(client.started_at)}</p>
                    </div>

                    <Link
                      href={`/dashboard/partsrepraesentant/klient/${client.citizen_id}`}
                      className="focus-ring inline-flex w-fit rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white"
                    >
                      Åbn klient
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBlock label="Praktik" value={yesNo(client.employment?.in_practice)} />
                    <InfoBlock label="Praktiksted" value={client.employment?.practice_company ?? "Ikke angivet"} />
                    <InfoBlock
                      label="Praktikperiode"
                      value={`${formatDate(client.employment?.practice_start_date)} - ${formatDate(client.employment?.practice_end_date)}`}
                    />
                    <InfoBlock
                      label="Ugentlige timer"
                      value={client.employment?.practice_hours_per_week ?? "Ikke angivet"}
                    />
                    <InfoBlock
                      label="Næste aftale"
                      value={
                        client.nextEvent
                          ? `${eventTypeLabel(client.nextEvent.event_type)} · ${formatDateTime(client.nextEvent.start_time)}`
                          : "Ingen kommende aftaler"
                      }
                    />
                    <InfoBlock
                      label="Seneste dagbog"
                      value={client.latestDiary ? formatDate(client.latestDiary.entry_date) : "Ingen dagbog endnu"}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="Der er endnu ikke tilknyttet klienter." />
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function StatusCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded border border-funktion-line bg-white p-5 shadow-calm">
      <p className="text-sm font-medium text-black/60">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-funktion-blue">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-funktion-line bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-2 text-sm font-semibold text-black">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-funktion-line p-4 text-sm text-black/70">{text}</div>;
}
