import { createClient } from "@/lib/supabase/server";
import { friendlyDatabaseError } from "@/lib/database-errors";
import type { CurrentUser } from "@/lib/auth";

export type CitizenRecord = {
  id: string;
  user_id: string;
  citizen_name: string;
  birth_year: number | null;
  practice_place: string | null;
  contact_person: string | null;
  administrator_name: string | null;
  practice_start_date: string | null;
  practice_end_date: string | null;
  weekly_hours: number | null;
  health_information: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CitizenResult = {
  citizen: CitizenRecord | null;
  warning: string | null;
};

export async function getCitizenByUserId(userId: string): Promise<CitizenResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("citizens")
      .select(
        "id,user_id,citizen_name,birth_year,practice_place,contact_person,administrator_name,practice_start_date,practice_end_date,weekly_hours,health_information,created_at,updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return {
        citizen: null,
        warning: friendlyDatabaseError(error, "Borgeroplysningerne kunne ikke hentes.")
      };
    }

    return {
      citizen: (data ?? null) as CitizenRecord | null,
      warning: null
    };
  } catch (error) {
    return {
      citizen: null,
      warning: friendlyDatabaseError(error, "Borgeroplysningerne kunne ikke hentes.")
    };
  }
}

export async function getOrCreateCitizenForUser(user: CurrentUser): Promise<CitizenResult> {
  const existing = await getCitizenByUserId(user.id);

  if (existing.citizen || existing.warning) {
    return existing;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("citizens")
      .insert({
        user_id: user.id,
        citizen_name: user.fullName || user.email
      })
      .select(
        "id,user_id,citizen_name,birth_year,practice_place,contact_person,administrator_name,practice_start_date,practice_end_date,weekly_hours,health_information,created_at,updated_at"
      )
      .single();

    if (error) {
      return {
        citizen: null,
        warning: friendlyDatabaseError(error, "Borgeroplysningerne kunne ikke oprettes.")
      };
    }

    return {
      citizen: data as CitizenRecord,
      warning: null
    };
  } catch (error) {
    return {
      citizen: null,
      warning: friendlyDatabaseError(error, "Borgeroplysningerne kunne ikke oprettes.")
    };
  }
}
