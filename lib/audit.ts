import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import type { AuditAction } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditInput = {
  action: AuditAction;
  actorId?: string | null;
  citizenId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  const supabase = createAdminClient();

  if (!supabase) {
    console.warn("[favn360] Audit-log is unavailable because server credentials are not configured.");
    return;
  }

  const headerStore = await headers();
  const includeNetworkMetadata = process.env.AUDIT_LOG_NETWORK_METADATA === "true";
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const hashKey = process.env.AUDIT_IP_HASH_KEY;
  const ipHash = includeNetworkMetadata && forwardedFor && hashKey
    ? createHmac("sha256", hashKey).update(forwardedFor).digest("hex")
    : null;

  await supabase.from("audit_logs").insert({
    action: input.action,
    actor_id: input.actorId ?? null,
    citizen_id: input.citizenId ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: ipHash,
    user_agent: includeNetworkMetadata ? headerStore.get("user-agent")?.slice(0, 256) ?? null : null
  });
}
