export type DataResult<T> = {
  data: T;
  warning: string | null;
};

export function friendlyDatabaseError(error: unknown, fallback = "Der opstod en databasefejl. Prøv igen senere.") {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("Missing environment variable") || message.includes("Supabase er ikke konfigureret")) {
    return "Supabase er ikke konfigureret. Tilføj miljøvariablerne og genstart appen.";
  }

  if (message.includes("relation") && message.includes("does not exist")) {
    return "Databasen mangler en nødvendig tabel. Kontrollér de private, versionsstyrede migrationer og prøv igen.";
  }

  if (message.includes("diary_entries")) {
    return "Dagbogsdata mangler eller kan ikke tilgås. Kontrollér migrationer, grants og Row Level Security.";
  }

  if (message.includes("profiles")) {
    return "Profilen mangler eller kan ikke tilgås. Kontrollér migrationer og Row Level Security, og log ind igen.";
  }

  if (message.includes("foreign key") || message.includes("violates foreign key constraint")) {
    return "Brugerens profil mangler i databasen. Log ud og ind igen, eller kontroller profiles-tabellen.";
  }

  if (message.includes("permission denied") || message.includes("row-level security")) {
    return "Du har ikke adgang til de ønskede data. Kontroller brugerens rolle og Row Level Security.";
  }

  if (message.includes("Failed to fetch") || message.includes("fetch failed")) {
    return "Der kunne ikke oprettes forbindelse til databasen. Kontroller Supabase-forbindelsen.";
  }

  return fallback;
}
