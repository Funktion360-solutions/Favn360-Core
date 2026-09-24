import { AlertTriangle, Bug, ClipboardList, MessageSquarePlus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { submitFeedbackItem } from "./actions";

type FeedbackTab = "overview" | "send" | "bug" | "mine";

type FeedbackItem = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  severity: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
};

type FeedbackBetaPageProps = {
  searchParams?: Promise<{
    tab?: string;
    error?: string;
    status?: string;
  }>;
};

const tabs: Array<{ id: FeedbackTab; label: string }> = [
  { id: "overview", label: "Oversigt" },
  { id: "send", label: "Send feedback" },
  { id: "bug", label: "Rapporter fejl" },
  { id: "mine", label: "Mine indsendelser" }
];

const severityOptions = [
  { value: "low", label: "Lav" },
  { value: "medium", label: "Mellem" },
  { value: "high", label: "Høj" },
  { value: "critical", label: "Kritisk" }
];

function activeTab(value: string | undefined): FeedbackTab {
  return tabs.some((tab) => tab.id === value) ? (value as FeedbackTab) : "overview";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function typeLabel(type: string) {
  if (type === "bug") return "Fejlrapport";
  if (type === "feedback") return "Feedback";
  return type;
}

function statusLabel(status: string) {
  if (status === "new") return "Ny";
  if (status === "triaged") return "Vurderet";
  if (status === "planned") return "Planlagt";
  if (status === "closed") return "Lukket";
  return status;
}

function severityLabel(severity: string | null) {
  if (severity === "low") return "Lav";
  if (severity === "medium") return "Mellem";
  if (severity === "high") return "Høj";
  if (severity === "critical") return "Kritisk";
  return "Ikke angivet";
}

export default async function FeedbackBetaPage({ searchParams }: FeedbackBetaPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const tab = activeTab(params?.tab);

  let feedbackItems: FeedbackItem[] = [];
  let warning: string | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feedback_items")
      .select("id,user_id,type,title,description,status,severity,screenshot_url,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[favn360] Feedback kunne ikke hentes.", error);
      warning = "Feedback kunne ikke hentes. Kontrollér at feedback_items-tabellen findes.";
    } else {
      feedbackItems = ((data ?? []) as FeedbackItem[]).filter((item) => item.user_id === user.id);
    }
  } else {
    warning = "Supabase er ikke konfigureret. Feedback kan ikke gemmes endnu.";
  }

  const feedbackCount = feedbackItems.filter((item) => item.type === "feedback").length;
  const bugCount = feedbackItems.filter((item) => item.type === "bug").length;
  const openCount = feedbackItems.filter((item) => item.status !== "closed").length;

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Feedback & Beta</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Hjælp Favn360 med at prioritere forbedringer, fejlrettelser og beta-erfaringer.
          </p>
        </div>

        {params?.status ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
            {params.status}
          </div>
        ) : null}

        {params?.error || warning ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {params?.error ?? warning}
          </div>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto rounded border border-funktion-line bg-white p-2">
          {tabs.map((item) => (
            <a
              key={item.id}
              href={`/feedback-beta?tab=${item.id}`}
              className={`focus-ring inline-flex min-w-fit rounded px-4 py-2 text-sm font-semibold ${
                tab === item.id ? "bg-funktion-blue text-white" : "text-funktion-blue hover:bg-funktion-pale"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {tab === "overview" ? (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard title="Feedback" value={feedbackCount} icon={<MessageSquarePlus className="h-5 w-5" />} />
              <MetricCard title="Fejlrapporter" value={bugCount} icon={<Bug className="h-5 w-5" />} />
              <MetricCard title="Åbne indsendelser" value={openCount} icon={<ClipboardList className="h-5 w-5" />} />
            </div>

            <Section title="Produktoperationer">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded border border-funktion-line p-4">
                  <h2 className="font-semibold text-funktion-blue">Klar til Product Operations Center</h2>
                  <p className="mt-2 leading-7 text-black/70">
                    Feedback gemmes struktureret med type, status, alvorlighed og screenshot-link, så det senere kan kobles på prioritering, triage og release-spor.
                  </p>
                </div>
                <div className="rounded border border-funktion-line p-4">
                  <h2 className="font-semibold text-funktion-blue">Dine indsendelser</h2>
                  <p className="mt-2 leading-7 text-black/70">
                    Du kan følge dine egne indsendelser under fanen Mine indsendelser. Administratorvisning for alle feedbacks er forberedt til en senere fase.
                  </p>
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {tab === "send" ? (
          <Section title="Send feedback" description="Fortæl hvad der virker, hvad der mangler, eller hvad der kan gøres mere brugervenligt.">
            <FeedbackForm type="feedback" submitLabel="Send feedback" />
          </Section>
        ) : null}

        {tab === "bug" ? (
          <Section title="Rapporter fejl" description="Beskriv hvad der gik galt, hvor det skete, og hvad du forventede.">
            <FeedbackForm type="bug" submitLabel="Send fejlrapport" isBug />
          </Section>
        ) : null}

        {tab === "mine" ? (
          <Section title="Mine indsendelser">
            {feedbackItems.length > 0 ? (
              <div className="grid gap-4">
                {feedbackItems.map((item) => (
                  <FeedbackCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
                Du har endnu ikke sendt feedback eller fejlrapporter.
              </div>
            )}
          </Section>
        ) : null}
      </div>
    </AppShell>
  );
}

function FeedbackForm({
  type,
  submitLabel,
  isBug = false
}: {
  type: "feedback" | "bug";
  submitLabel: string;
  isBug?: boolean;
}) {
  return (
    <form action={submitFeedbackItem} className="grid gap-5">
      <input type="hidden" name="type" value={type} />

      <label className="grid gap-2">
        <span className="font-medium text-black">Titel</span>
        <input
          name="title"
          required
          placeholder={isBug ? "Fx Kalender viser forkert tidspunkt" : "Fx Gør dashboardet nemmere at scanne"}
          className="focus-ring rounded border border-funktion-line px-4 py-3"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-medium text-black">Beskrivelse</span>
        <textarea
          name="description"
          required
          rows={7}
          placeholder={isBug ? "Hvad skete der, og hvordan kan fejlen genskabes?" : "Skriv din feedback så konkret som muligt."}
          className="focus-ring rounded border border-funktion-line px-4 py-3 leading-7"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-medium text-black">Alvorlighed</span>
          <select name="severity" defaultValue={isBug ? "high" : "medium"} className="focus-ring rounded border border-funktion-line px-4 py-3">
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="font-medium text-black">Screenshot-link</span>
          <input
            name="screenshot_url"
            type="url"
            placeholder="https://..."
            className="focus-ring rounded border border-funktion-line px-4 py-3"
          />
        </label>
      </div>

      <button type="submit" className="focus-ring inline-flex w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
        {submitLabel}
      </button>
    </form>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded border border-funktion-line bg-white p-5 shadow-calm">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-funktion-blue">{title}</p>
        <span className="text-funktion-blue">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-black">{value}</p>
    </div>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <article className="rounded border border-funktion-line p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-funktion-pale px-3 py-1 text-xs font-semibold text-funktion-blue">{typeLabel(item.type)}</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{statusLabel(item.status)}</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{severityLabel(item.severity)}</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-funktion-blue">{item.title}</h2>
          <p className="mt-2 leading-7 text-black/75">{item.description}</p>
          {item.screenshot_url ? (
            <a href={item.screenshot_url} className="mt-3 inline-flex text-sm font-semibold text-funktion-blue underline">
              Åbn screenshot
            </a>
          ) : null}
        </div>

        <p className="text-sm text-black/55">{formatDateTime(item.created_at)}</p>
      </div>
    </article>
  );
}
