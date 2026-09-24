"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const productOperationsPath = "/dashboard/admin/product-operations";
const feedbackStatuses = ["new", "in_progress", "planned", "resolved", "closed", "rejected"] as const;
const bugStatuses = ["open", "in_progress", "resolved", "closed"] as const;

type FeedbackStatus = (typeof feedbackStatuses)[number];
type BugStatus = (typeof bugStatuses)[number];

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function asRequiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asFeedbackStatus(value: FormDataEntryValue | null): FeedbackStatus {
  const selected = String(value ?? "new");
  return feedbackStatuses.includes(selected as FeedbackStatus) ? (selected as FeedbackStatus) : "new";
}

function asBugStatus(value: FormDataEntryValue | null): BugStatus {
  const selected = String(value ?? "open");
  return bugStatuses.includes(selected as BugStatus) ? (selected as BugStatus) : "open";
}

function done(params: { error?: string; status?: string; filter?: string }): never {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.filter) {
    searchParams.set("filter", params.filter);
  }

  redirect(`${productOperationsPath}?${searchParams.toString()}`);
}

async function requireAdminSupabase() {
  await requireUser("administrator");
  const supabaseAdmin = createAdminClient();

  if (!supabaseAdmin) {
    done({ error: "Serveren mangler Supabase service role-konfiguration." });
  }

  return supabaseAdmin;
}

export async function updateFeedbackStatus(formData: FormData) {
  const supabaseAdmin = await requireAdminSupabase();
  const feedbackId = asRequiredText(formData.get("feedback_id"));
  const status = asFeedbackStatus(formData.get("status"));

  if (!feedbackId) {
    done({ error: "Feedback blev ikke fundet." });
  }

  const { error } = await supabaseAdmin
    .from("feedback_items")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", feedbackId);

  if (error) {
    console.error("[favn360] Feedbackstatus kunne ikke opdateres.", error);
    done({ error: "Feedbackstatus kunne ikke opdateres." });
  }

  revalidatePath(productOperationsPath);
  done({ status: "Feedbackstatus er opdateret.", filter: status });
}

export async function createBugFromFeedback(formData: FormData) {
  const supabaseAdmin = await requireAdminSupabase();
  const feedbackId = asRequiredText(formData.get("feedback_id"));
  const title = asRequiredText(formData.get("title"));
  const description = asRequiredText(formData.get("description"));
  const severity = asText(formData.get("severity")) ?? "medium";
  const status = asBugStatus(formData.get("status"));

  if (!feedbackId || !title || !description) {
    done({ error: "Feedback, titel og beskrivelse skal udfyldes." });
  }

  const { error: bugError } = await supabaseAdmin.from("bugs").insert({
    feedback_id: feedbackId,
    title,
    description,
    severity,
    status
  });

  if (bugError) {
    console.error("[favn360] Bug kunne ikke oprettes.", bugError);
    done({ error: "Bug kunne ikke oprettes. Kontrollér at bugs-tabellen findes." });
  }

  await supabaseAdmin
    .from("feedback_items")
    .update({
      status: "in_progress",
      updated_at: new Date().toISOString()
    })
    .eq("id", feedbackId);

  revalidatePath(productOperationsPath);
  done({ status: "Bug er oprettet fra feedback.", filter: "in_progress" });
}

export async function updateBugStatus(formData: FormData) {
  const supabaseAdmin = await requireAdminSupabase();
  const bugId = asRequiredText(formData.get("bug_id"));
  const status = asBugStatus(formData.get("status"));

  if (!bugId) {
    done({ error: "Bug blev ikke fundet." });
  }

  const { error } = await supabaseAdmin
    .from("bugs")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", bugId);

  if (error) {
    console.error("[favn360] Bugstatus kunne ikke opdateres.", error);
    done({ error: "Bugstatus kunne ikke opdateres." });
  }

  revalidatePath(productOperationsPath);
  done({ status: "Bugstatus er opdateret." });
}
