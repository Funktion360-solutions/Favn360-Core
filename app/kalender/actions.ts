"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { copenhagenLocalInputToUtcIso } from "./time";
import { eventStatuses, eventTypes, type CalendarEventStatus, type CalendarEventType } from "./types";

function asText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function asRequiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asEventType(value: FormDataEntryValue | null): CalendarEventType {
  const selected = String(value ?? "other");
  return eventTypes.some((type) => type.value === selected) ? (selected as CalendarEventType) : "other";
}

function asEventStatus(value: FormDataEntryValue | null): CalendarEventStatus {
  const selected = String(value ?? "planned");
  return eventStatuses.some((status) => status.value === selected) ? (selected as CalendarEventStatus) : "planned";
}

function asDateTime(value: FormDataEntryValue | null) {
  const text = asRequiredText(value);

  if (!text) {
    return null;
  }

  return copenhagenLocalInputToUtcIso(text);
}

function actionRedirect(params: { error?: string; status?: string }): never {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  redirect(`/kalender?${searchParams.toString()}`);
}

export async function getCitizenIdForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("citizens").select("id").eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("[favn360] Kalender kunne ikke hente borger.", error);
    return { citizenId: null, warning: "Borgeroplysninger kunne ikke hentes. Prøv igen om lidt." };
  }

  if (!data?.id) {
    return { citizenId: null, warning: "Der er ikke oprettet en borgerprofil til din bruger endnu." };
  }

  return { citizenId: data.id as string, warning: null };
}

export async function createCalendarEvent(formData: FormData) {
  const user = await requireUser();

  if (user.role !== "citizen") {
    actionRedirect({ error: "Kun borgere kan oprette egne kalenderbegivenheder i fase 1." });
  }

  if (!hasSupabaseEnv()) {
    actionRedirect({ error: "Supabase er ikke konfigureret. Kalenderen kan ikke gemmes endnu." });
  }

  const { citizenId, warning } = await getCitizenIdForUser(user.id);

  if (!citizenId) {
    actionRedirect({ error: warning ?? "Borgerprofilen blev ikke fundet." });
  }

  const title = asRequiredText(formData.get("title"));
  const startTime = asDateTime(formData.get("start_time"));
  const endTime = asDateTime(formData.get("end_time"));

  if (!title || !startTime || !endTime) {
    actionRedirect({ error: "Titel, dato, starttid og sluttid skal udfyldes." });
  }

  if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
    actionRedirect({ error: "Sluttidspunktet skal ligge efter starttidspunktet." });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").insert({
    citizen_id: citizenId,
    created_by: user.id,
    title,
    event_type: asEventType(formData.get("event_type")),
    status: asEventStatus(formData.get("status")),
    start_time: startTime,
    end_time: endTime,
    all_day: formData.get("all_day") === "on",
    location: asText(formData.get("location")),
    description: asText(formData.get("description")),
    visibility: asText(formData.get("visibility")) ?? "private"
  });

  if (error) {
    console.error("[favn360] Kalenderbegivenhed kunne ikke oprettes.", error);
    actionRedirect({ error: "Begivenheden kunne ikke oprettes. Prøv igen." });
  }

  revalidatePath("/kalender");
  actionRedirect({ status: "Aftalen er oprettet." });
}

export async function updateCalendarEvent(formData: FormData) {
  const user = await requireUser();

  if (user.role !== "citizen") {
    actionRedirect({ error: "Kun borgere kan redigere egne kalenderbegivenheder i fase 1." });
  }

  const { citizenId, warning } = await getCitizenIdForUser(user.id);

  if (!citizenId) {
    actionRedirect({ error: warning ?? "Borgerprofilen blev ikke fundet." });
  }

  const eventId = asRequiredText(formData.get("event_id"));
  const title = asRequiredText(formData.get("title"));
  const startTime = asDateTime(formData.get("start_time"));
  const endTime = asDateTime(formData.get("end_time"));

  if (!eventId || !title || !startTime || !endTime) {
    actionRedirect({ error: "Aftalen mangler titel, dato, starttid eller sluttid." });
  }

  if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
    actionRedirect({ error: "Sluttidspunktet skal ligge efter starttidspunktet." });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_events")
    .update({
      title,
      description: asText(formData.get("description")),
      location: asText(formData.get("location")),
      event_type: asEventType(formData.get("event_type")),
      status: asEventStatus(formData.get("status")),
      start_time: startTime,
      end_time: endTime,
      all_day: formData.get("all_day") === "on"
    })
    .eq("id", eventId)
    .eq("citizen_id", citizenId);

  if (error) {
    console.error("[favn360] Kalenderbegivenhed kunne ikke opdateres.", error);
    actionRedirect({ error: "Aftalen kunne ikke opdateres. Prøv igen." });
  }

  revalidatePath("/kalender");
  actionRedirect({ status: "Aftalen er opdateret." });
}

export async function updateCalendarEventStatus(formData: FormData) {
  const user = await requireUser();

  if (user.role !== "citizen") {
    actionRedirect({ error: "Kun borgere kan ændre egne kalenderbegivenheder i fase 1." });
  }

  const { citizenId, warning } = await getCitizenIdForUser(user.id);

  if (!citizenId) {
    actionRedirect({ error: warning ?? "Borgerprofilen blev ikke fundet." });
  }

  const eventId = asRequiredText(formData.get("event_id"));
  const status = asEventStatus(formData.get("status"));

  if (!eventId) {
    actionRedirect({ error: "Aftalen blev ikke fundet." });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_events")
    .update({ status })
    .eq("id", eventId)
    .eq("citizen_id", citizenId);

  if (error) {
    console.error("[favn360] Kalenderstatus kunne ikke opdateres.", error);
    actionRedirect({ error: "Aftalens status kunne ikke opdateres. Prøv igen." });
  }

  revalidatePath("/kalender");
  actionRedirect({ status: status === "completed" ? "Aftalen er markeret som gennemført." : "Aftalen er markeret som aflyst." });
}

export async function deleteCalendarEvent(formData: FormData) {
  const user = await requireUser();

  if (user.role !== "citizen") {
    actionRedirect({ error: "Kun borgere kan slette egne kalenderbegivenheder i fase 1." });
  }

  const { citizenId, warning } = await getCitizenIdForUser(user.id);

  if (!citizenId) {
    actionRedirect({ error: warning ?? "Borgerprofilen blev ikke fundet." });
  }

  const eventId = asRequiredText(formData.get("event_id"));

  if (!eventId) {
    actionRedirect({ error: "Aftalen blev ikke fundet." });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId).eq("citizen_id", citizenId);

  if (error) {
    console.error("[favn360] Kalenderbegivenhed kunne ikke slettes.", error);
    actionRedirect({ error: "Aftalen kunne ikke slettes. Prøv igen." });
  }

  revalidatePath("/kalender");
  actionRedirect({ status: "Aftalen er slettet." });
}
