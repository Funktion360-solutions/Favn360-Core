"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { writeAuditLog } from "@/lib/audit";

export type AdministratorCommentState = {
  ok: boolean;
  message: string | null;
};

export async function updateAiAnalysisAdministratorComment(
  _previousState: AdministratorCommentState,
  formData: FormData
): Promise<AdministratorCommentState> {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) {
    return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
  }

  const analysisId = String(formData.get("analysisId") ?? "");
  const citizenId = String(formData.get("citizenId") ?? "");
  const administratorComment = String(formData.get("administratorComment") ?? "").trim();

  if (!analysisId || !citizenId) {
    return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
  }

  try {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "administrator") {
      return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
    }

    const { data: analysis, error: analysisError } = await supabase
      .from("ai_analyses")
      .select("id,citizen_id")
      .eq("id", analysisId)
      .eq("citizen_id", citizenId)
      .single();

    if (analysisError || !analysis) {
      return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
    }

    const { error: updateError } = await supabase
      .from("ai_analyses")
      .update({
        administrator_comment: administratorComment || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", analysisId)
      .eq("citizen_id", citizenId);

    if (updateError) {
      console.warn(friendlyDatabaseError(updateError, "Administratorbemærkningen kunne ikke gemmes."));
      return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
    }

    try {
      await writeAuditLog({
        action: "ai_analysis_administrator_comment_updated",
        actorId: user.id,
        citizenId,
        entityType: "ai_analysis",
        entityId: analysisId,
        metadata: { analysisId, citizenId }
      });
    } catch (auditError) {
      console.warn(friendlyDatabaseError(auditError, "Audit-log kunne ikke gemmes."));
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/borger");
    revalidatePath("/dashboard/admin");

    return { ok: true, message: "Bemærkningen er gemt." };
  } catch (error) {
    console.warn(friendlyDatabaseError(error, "Administratorbemærkningen kunne ikke gemmes."));
    return { ok: false, message: "Bemærkningen kunne ikke gemmes." };
  }
}
