import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { friendlyDatabaseError, type DataResult } from "@/lib/database-errors";
import { getCurrentUser } from "@/lib/auth";
import { getCitizenByUserId } from "@/lib/citizens";
import type { PdfExport } from "@/types/database";

export const documentTypes = [
  "Daglig funktionsregistrering",
  "Ugentlig funktions- og belastningsopsummering",
  "Månedlig statusrapport",
  "Funktionsevnebeskrivelse",
  "Samlet praktik- og funktionsrapport",
  "Favn360 Analyse"
] as const;

export const defaultDocumentType = "Samlet praktik- og funktionsrapport";

export const periodTypes = [
  "Bestemt dag",
  "Fra/til dato",
  "Seneste 7 dage",
  "Seneste 30 dage",
  "Hele praktikperioden"
] as const;

export type PdfExportOptions = {
  includeCitizenEntries: boolean;
  includeAdminNotes: boolean;
  includeAiSummary: boolean;
  includeAttachments: boolean;
  includeSignature: boolean;
  includeWatermark: boolean;
  includeVersion: boolean;
  includeCharts: boolean;
};

export async function fetchPdfExportsForCitizen(citizenId: string | null): Promise<DataResult<PdfExport[]>> {
  if (!citizenId) {
    return { data: [], warning: null };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pdf_exports")
      .select("*")
      .eq("citizen_id", citizenId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        data: [],
        warning: friendlyDatabaseError(error, "PDF-versioner kunne ikke hentes.")
      };
    }

    return {
      data: (data ?? []) as PdfExport[],
      warning: null
    };
  } catch (error) {
    return {
      data: [],
      warning: friendlyDatabaseError(error, "PDF-versioner kunne ikke hentes.")
    };
  }
}

export async function resolveExportCitizenId(requestedCitizenId?: string | null) {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, citizenId: null, error: "Du er ikke logget ind." };
  }

  if (user.role === "administrator") {
    if (!requestedCitizenId) {
      return { user, citizenId: null, error: "Vælg en borger før eksport." };
    }

    return { user, citizenId: requestedCitizenId, error: null };
  }

  if (user.role !== "citizen") {
    return { user, citizenId: null, error: "Din rolle har ikke adgang til PDF-eksport." };
  }

  const { citizen, warning } = await getCitizenByUserId(user.id);

  if (!citizen) {
    return { user, citizenId: null, error: warning ?? "Borgeroplysninger kunne ikke findes." };
  }

  if (requestedCitizenId && requestedCitizenId !== citizen.id) {
    return { user, citizenId: null, error: "Du kan kun eksportere PDF for din egen borgerprofil." };
  }

  return { user, citizenId: citizen.id, error: null };
}

export async function deletePdfExport(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  const exportId = String(formData.get("exportId") ?? "");
  const citizenId = String(formData.get("citizenId") ?? "");

  if (!user || user.role !== "administrator" || !exportId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pdf_exports").delete().eq("id", exportId);

  if (error) {
    console.warn(friendlyDatabaseError(error, "PDF-versionen kunne ikke slettes."));
  }

  revalidatePath("/dashboard/admin");
  if (citizenId) {
    revalidatePath(`/dashboard/admin?citizenId=${citizenId}`);
  }
}
