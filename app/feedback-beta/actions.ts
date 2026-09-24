"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const feedbackPath = "/feedback-beta";
const allowedTypes = ["feedback", "bug"] as const;
const allowedSeverities = ["low", "medium", "high", "critical"] as const;

type FeedbackType = (typeof allowedTypes)[number];
type FeedbackSeverity = (typeof allowedSeverities)[number];

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function asRequiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asFeedbackType(value: FormDataEntryValue | null): FeedbackType {
  const selected = String(value ?? "feedback");
  return allowedTypes.includes(selected as FeedbackType) ? (selected as FeedbackType) : "feedback";
}

function asSeverity(value: FormDataEntryValue | null): FeedbackSeverity {
  const selected = String(value ?? "medium");
  return allowedSeverities.includes(selected as FeedbackSeverity) ? (selected as FeedbackSeverity) : "medium";
}

function done(params: { error?: string; status?: string; tab?: string }): never {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.tab) {
    searchParams.set("tab", params.tab);
  }

  redirect(`${feedbackPath}?${searchParams.toString()}`);
}

export async function submitFeedbackItem(formData: FormData) {
  const user = await requireUser();

  if (!hasSupabaseEnv()) {
    done({ error: "Supabase er ikke konfigureret. Feedback kan ikke gemmes endnu.", tab: "send" });
  }

  const type = asFeedbackType(formData.get("type"));
  const title = asRequiredText(formData.get("title"));
  const description = asRequiredText(formData.get("description"));
  const severity = asSeverity(formData.get("severity"));
  const screenshotUrl = asText(formData.get("screenshot_url"));

  if (!title || !description) {
    done({ error: "Titel og beskrivelse skal udfyldes.", tab: type === "bug" ? "bug" : "send" });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_items").insert({
    user_id: user.id,
    type,
    title,
    description,
    status: "new",
    severity,
    screenshot_url: screenshotUrl
  });

  if (error) {
    console.error("[favn360] Feedback kunne ikke gemmes.", error);
    done({
      error: "Feedback kunne ikke gemmes. Kontrollér at feedback_items-tabellen findes.",
      tab: type === "bug" ? "bug" : "send"
    });
  }

  revalidatePath(feedbackPath);
  done({ status: type === "bug" ? "Fejlrapporten er sendt." : "Feedback er sendt.", tab: "mine" });
}
