import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { CalendarExperience } from "./CalendarExperience";
import { getCitizenIdForUser } from "./actions";
import type { CalendarEvent } from "./types";

type CalendarPageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  if (user.role !== "citizen") {
    return (
      <AppShell user={user}>
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-funktion-blue">Kalender</h1>
            <p className="mt-2 max-w-3xl leading-7 text-black/70">
              Borgerkalenderen er klar i fase 1. Kalender for partsrepræsentanter og fælles aftaler kommer senere.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!hasSupabaseEnv()) {
    return (
      <AppShell user={user}>
        <CalendarExperience
          events={[]}
          citizenReady={false}
          statusMessage={params?.status}
          errorMessage={params?.error ?? "Supabase er ikke konfigureret. Kalenderen kan ikke hente eller gemme aftaler endnu."}
        />
      </AppShell>
    );
  }

  const { citizenId, warning } = await getCitizenIdForUser(user.id);
  const supabase = await createClient();
  const { data: events, error } = citizenId
    ? await supabase
        .from("calendar_events")
        .select("id,citizen_id,title,description,location,event_type,status,visibility,start_time,end_time,all_day")
        .eq("citizen_id", citizenId)
        .order("start_time", { ascending: true })
    : { data: [], error: null };

  if (error) {
    console.error("[favn360] Kalenderbegivenheder kunne ikke hentes.", error);
  }

  const calendarEvents = ((events ?? []) as CalendarEvent[]).filter((event) => event.citizen_id === citizenId);

  return (
    <AppShell user={user}>
      <CalendarExperience
        events={calendarEvents}
        citizenReady={Boolean(citizenId)}
        statusMessage={params?.status}
        errorMessage={params?.error ?? warning ?? (error ? "Kalenderaftalerne kunne ikke hentes. Prøv igen om lidt." : undefined)}
      />
    </AppShell>
  );
}
