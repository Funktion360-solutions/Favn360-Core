import type { AuditAction } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

type AuditInput = {
  action: AuditAction;
  actorId?: string | null;
  citizenId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("write_audit_log", {
    p_action: input.action,
    p_citizen_id: input.citizenId ?? null,
    p_table_name: input.entityType ?? null,
    p_record_id: input.entityId ?? null,
    p_metadata: input.metadata ?? {}
  });

  if (error) {
    console.error("[favn360] Failed to write audit log:", error);
  }
}
