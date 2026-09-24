import { hasSupabaseEnv, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { friendlyDatabaseError, type DataResult } from "@/lib/database-errors";
import { demoDiaryEntries } from "@/lib/demo-data";
import type { Citizen, DiaryEntry } from "@/types/database";
import { getCitizenByUserId } from "@/lib/citizens";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isDiaryLocked(entry: DiaryEntry) {
  return entry.status === "locked" || entry.entry_date < todayIsoDate();
}

export async function fetchCitizenDiaryEntries(): Promise<DataResult<DiaryEntry[]>> {
  if (!hasSupabaseEnv()) {
    if (!isDemoMode()) return { data: [], warning: "Databasen er ikke konfigureret." };
    return {
      data: demoDiaryEntries,
      warning: "Supabase er ikke konfigureret. Der vises demodata, og nye dagbøger gemmes ikke permanent."
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        data: [],
        warning: "Du er ikke logget ind. Log ind igen for at se dagbogsregistreringer."
      };
    }

    const { citizen, warning: citizenWarning } = await getCitizenByUserId(userData.user.id);

    if (!citizen) {
      return {
        data: [],
        warning: citizenWarning ?? "Der er ikke oprettet en borger-række til den aktuelle bruger endnu."
      };
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("citizen_id", citizen.id)
      .order("entry_date", { ascending: false });

    if (error) {
      return {
        data: [],
        warning: friendlyDatabaseError(error, "Dagbøgerne kunne ikke hentes. Prøv igen senere.")
      };
    }

    return {
      data: (data ?? []) as DiaryEntry[],
      warning: null
    };
  } catch (error) {
    return {
      data: [],
      warning: friendlyDatabaseError(error, "Dagbøgerne kunne ikke hentes. Prøv igen senere.")
    };
  }
}

export async function fetchDiaryEntryById(entryId: string): Promise<DataResult<DiaryEntry | null>> {
  if (!hasSupabaseEnv()) {
    if (!isDemoMode()) return { data: null, warning: "Databasen er ikke konfigureret." };
    return {
      data: demoDiaryEntries.find((entry) => entry.id === entryId) ?? null,
      warning: "Supabase er ikke konfigureret. Der vises demodata."
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("id", entryId)
      .maybeSingle();

    if (error) {
      return {
        data: null,
        warning: friendlyDatabaseError(error, "Dagbogen kunne ikke hentes. Prøv igen senere.")
      };
    }

    return {
      data: (data ?? null) as DiaryEntry | null,
      warning: null
    };
  } catch (error) {
    return {
      data: null,
      warning: friendlyDatabaseError(error, "Dagbogen kunne ikke hentes. Prøv igen senere.")
    };
  }
}

export async function fetchCitizensForAdmin(): Promise<DataResult<Citizen[]>> {
  if (!hasSupabaseEnv()) {
    if (!isDemoMode()) return { data: [], warning: "Databasen er ikke konfigureret." };
    return {
      data: [
        {
          id: "demo-citizen",
          user_id: "demo-citizen",
          citizen_name: "Demo Borger",
          birth_year: null,
          practice_place: "Demo praktiksted",
          contact_person: null,
          administrator_name: "Demo Administrator",
          practice_start_date: "2026-06-10",
          practice_end_date: null,
          weekly_hours: 7.5,
          health_information: null,
          created_at: "2026-06-10T00:00:00Z",
          updated_at: null
        }
      ],
      warning: "Supabase er ikke konfigureret. Der vises demodata."
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("citizens")
      .select(
        "id,user_id,citizen_name,birth_year,practice_place,contact_person,administrator_name,practice_start_date,practice_end_date,weekly_hours,health_information,created_at,updated_at"
      )
      .order("citizen_name", { ascending: true });

    if (error) {
      return {
        data: [],
        warning: friendlyDatabaseError(error, "Borgerlisten kunne ikke hentes. Prøv igen senere.")
      };
    }

    return {
      data: (data ?? []) as Citizen[],
      warning: null
    };
  } catch (error) {
    return {
      data: [],
      warning: friendlyDatabaseError(error, "Borgerlisten kunne ikke hentes. Prøv igen senere.")
    };
  }
}

export async function fetchDiaryEntriesForCitizen(citizenId: string): Promise<DataResult<DiaryEntry[]>> {
  if (!hasSupabaseEnv()) {
    if (!isDemoMode()) return { data: [], warning: "Databasen er ikke konfigureret." };
    return {
      data: citizenId === "demo-citizen" ? demoDiaryEntries : [],
      warning: "Supabase er ikke konfigureret. Der vises demodata."
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("citizen_id", citizenId)
      .order("entry_date", { ascending: false });

    if (error) {
      return {
        data: [],
        warning: friendlyDatabaseError(error, "Dagbøgerne kunne ikke hentes. Prøv igen senere.")
      };
    }

    return {
      data: (data ?? []) as DiaryEntry[],
      warning: null
    };
  } catch (error) {
    return {
      data: [],
      warning: friendlyDatabaseError(error, "Dagbøgerne kunne ikke hentes. Prøv igen senere.")
    };
  }
}
