import { Activity, Bug, ClipboardList, FlaskConical, MessageSquare, Rocket } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBugFromFeedback, updateBugStatus, updateFeedbackStatus } from "./actions";

type ProductOperationsPageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: string;
    filter?: string;
  }>;
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

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
  profile?: Profile | null;
};

type BetaUser = {
  id: string;
  user_id: string;
  beta_group: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
};

type BugItem = {
  id: string;
  feedback_id: string | null;
  title: string;
  description: string;
  severity: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityItem = {
  id: string;
  type: "feedback" | "bug" | "beta";
  title: string;
  description: string;
  date: string;
};

const feedbackStatuses = [
  { value: "all", label: "Alle" },
  { value: "new", label: "Nye" },
  { value: "in_progress", label: "Under behandling" },
  { value: "planned", label: "Planlagte" },
  { value: "resolved", label: "Løste" },
  { value: "closed", label: "Lukkede" },
  { value: "rejected", label: "Afviste" }
];

const bugStatuses = [
  { value: "open", label: "Åben" },
  { value: "in_progress", label: "Under behandling" },
  { value: "resolved", label: "Løst" },
  { value: "closed", label: "Lukket" }
];

function statusLabel(status: string | null | undefined) {
  return [...feedbackStatuses, ...bugStatuses].find((item) => item.value === status)?.label ?? status ?? "Ukendt";
}

function typeLabel(type: string | null | undefined) {
  if (type === "bug") return "Fejlrapport";
  if (type === "feedback") return "Feedback";
  return type ?? "Ukendt";
}

function severityLabel(severity: string | null | undefined) {
  if (severity === "low") return "Lav";
  if (severity === "medium") return "Mellem";
  if (severity === "high") return "Høj";
  if (severity === "critical") return "Kritisk";
  return "Ikke angivet";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Ikke angivet";

  return new Date(value).toLocaleString("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function userLabel(profile: Profile | null | undefined) {
  if (!profile) return "Profil ikke fundet";
  return profile.full_name ? `${profile.full_name} · ${profile.email}` : profile.email;
}

function releaseLabel() {
  return process.env.NEXT_PUBLIC_APP_VERSION ?? "Platform-core beta";
}

export default async function ProductOperationsPage({ searchParams }: ProductOperationsPageProps) {
  const user = await requireUser("administrator");
  const params = await searchParams;
  const filter = feedbackStatuses.some((item) => item.value === params?.filter) ? params?.filter ?? "all" : "all";
  const supabaseAdmin = createAdminClient();

  let feedbackItems: FeedbackItem[] = [];
  let betaUsers: BetaUser[] = [];
  let bugs: BugItem[] = [];
  let warning: string | null = null;

  if (!supabaseAdmin) {
    warning = "Serveren mangler Supabase service role-konfiguration.";
  } else {
    const [{ data: feedbackRows, error: feedbackError }, { data: betaRows, error: betaError }, { data: bugRows, error: bugError }] =
      await Promise.all([
        supabaseAdmin
          .from("feedback_items")
          .select("id,user_id,type,title,description,status,severity,screenshot_url,created_at,updated_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("beta_users")
          .select("id,user_id,beta_group,status,created_at,updated_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("bugs")
          .select("id,feedback_id,title,description,severity,status,assigned_to,created_at,updated_at")
          .order("created_at", { ascending: false })
      ]);

    if (feedbackError) {
      console.error("[favn360] Feedback kunne ikke hentes.", feedbackError);
      warning = "Feedback kunne ikke hentes. Kontrollér feedback_items-tabellen.";
    }

    if (betaError) {
      console.error("[favn360] Beta-brugere kunne ikke hentes.", betaError);
      warning = warning ?? "Beta-brugere kunne ikke hentes. Kontrollér beta_users-tabellen.";
    }

    if (bugError) {
      console.error("[favn360] Bugs kunne ikke hentes.", bugError);
      warning = warning ?? "Bugs kunne ikke hentes. Kontrollér bugs-tabellen.";
    }

    const profileIds = [
      ...((feedbackRows ?? []) as FeedbackItem[]).map((item) => item.user_id),
      ...((betaRows ?? []) as BetaUser[]).map((item) => item.user_id)
    ].filter(Boolean);

    const uniqueProfileIds = Array.from(new Set(profileIds));
    const { data: profiles } =
      uniqueProfileIds.length > 0
        ? await supabaseAdmin.from("profiles").select("id,email,full_name,role").in("id", uniqueProfileIds)
        : { data: [] };

    feedbackItems = ((feedbackRows ?? []) as FeedbackItem[]).map((item) => ({
      ...item,
      profile: profiles?.find((profile: Profile) => profile.id === item.user_id) ?? null
    }));

    betaUsers = ((betaRows ?? []) as BetaUser[]).map((item) => ({
      ...item,
      profile: profiles?.find((profile: Profile) => profile.id === item.user_id) ?? null
    }));

    bugs = (bugRows ?? []) as BugItem[];
  }

  const filteredFeedback = filter === "all" ? feedbackItems : feedbackItems.filter((item) => item.status === filter);
  const activeBetaUsers = betaUsers.filter((item) => item.status === "active").length;
  const newFeedbacks = feedbackItems.filter((item) => item.status === "new").length;
  const openFeedbacks = feedbackItems.filter((item) => !["closed", "rejected", "resolved"].includes(item.status)).length;
  const openBugs = bugs.filter((item) => !["closed", "resolved"].includes(item.status)).length;
  const activePilotProjects = new Set(betaUsers.filter((item) => item.status === "active").map((item) => item.beta_group).filter(Boolean)).size;

  const activityItems: ActivityItem[] = [
    ...feedbackItems.map((item) => ({
      id: `feedback-${item.id}`,
      type: item.type === "bug" ? ("bug" as const) : ("feedback" as const),
      title: item.type === "bug" ? "Fejlrapport oprettet" : "Feedback oprettet",
      description: `${item.title} · ${userLabel(item.profile)}`,
      date: item.created_at
    })),
    ...betaUsers.map((item) => ({
      id: `beta-${item.id}`,
      type: "beta" as const,
      title: "Beta-bruger oprettet",
      description: `${userLabel(item.profile)} · ${item.beta_group ?? "Ingen gruppe"}`,
      date: item.created_at
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Product Operations</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Triage af feedback, fejlrapporter, beta-aktivitet og pilotspor.
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard title="Aktive beta-brugere" value={activeBetaUsers} icon={<FlaskConical className="h-5 w-5" />} />
          <KpiCard title="Nye feedbacks" value={newFeedbacks} icon={<MessageSquare className="h-5 w-5" />} />
          <KpiCard title="Åbne feedbacks" value={openFeedbacks} icon={<ClipboardList className="h-5 w-5" />} />
          <KpiCard title="Åbne bugs" value={openBugs} icon={<Bug className="h-5 w-5" />} />
          <KpiCard title="Aktive pilotprojekter" value={activePilotProjects} icon={<Activity className="h-5 w-5" />} />
          <KpiCard title="Seneste release" value={releaseLabel()} icon={<Rocket className="h-5 w-5" />} />
        </div>

        <Section title="Aktivitetsfeed" description="Seneste 50 hændelser fra feedback, fejlrapporter og beta-brugere.">
          {activityItems.length > 0 ? (
            <div className="grid gap-3">
              {activityItems.map((item) => (
                <article key={item.id} className="rounded border border-funktion-line p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span className={activityBadge(item.type)}>{item.title}</span>
                      <p className="mt-2 text-sm leading-6 text-black/75">{item.description}</p>
                    </div>
                    <p className="text-xs text-black/50">{formatDateTime(item.date)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="Ingen aktivitet endnu." />
          )}
        </Section>

        <Section title="Feedback-modul">
          <div className="mb-5 flex gap-2 overflow-x-auto">
            {feedbackStatuses.map((item) => (
              <a
                key={item.value}
                href={`/dashboard/admin/product-operations?filter=${item.value}`}
                className={`focus-ring inline-flex min-w-fit rounded px-4 py-2 text-sm font-semibold ${
                  filter === item.value ? "bg-funktion-blue text-white" : "border border-funktion-line text-funktion-blue hover:bg-funktion-pale"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {filteredFeedback.length > 0 ? (
            <div className="grid gap-4">
              {filteredFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState text="Ingen feedback matcher filteret." />
          )}
        </Section>

        <Section title="Bugoversigt">
          {bugs.length > 0 ? (
            <div className="grid gap-4">
              {bugs.map((bug) => (
                <BugCard key={bug.id} bug={bug} />
              ))}
            </div>
          ) : (
            <EmptyState text="Ingen bugs er oprettet endnu." />
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded border border-funktion-line bg-white p-5 shadow-calm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-black/60">{title}</p>
        <span className="text-funktion-blue">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-funktion-blue">{value}</p>
    </div>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <article className="rounded border border-funktion-line p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-funktion-pale px-3 py-1 text-xs font-semibold text-funktion-blue">{typeLabel(item.type)}</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{severityLabel(item.severity)}</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{statusLabel(item.status)}</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-funktion-blue">{item.title}</h2>
          <dl className="mt-3 grid gap-2 text-sm text-black/70 md:grid-cols-2">
            <Info label="Bruger" value={userLabel(item.profile)} />
            <Info label="Oprettet" value={formatDateTime(item.created_at)} />
          </dl>
          <p className="mt-4 leading-7 text-black/75">{item.description}</p>
          {item.screenshot_url ? (
            <a href={item.screenshot_url} className="mt-3 inline-flex text-sm font-semibold text-funktion-blue underline">
              Åbn screenshot
            </a>
          ) : null}
        </div>

        <div className="grid gap-3">
          <form action={updateFeedbackStatus} className="grid gap-3 rounded border border-funktion-line p-4">
            <input type="hidden" name="feedback_id" value={item.id} />
            <label className="grid gap-2">
              <span className="text-sm font-medium">Status</span>
              <select name="status" defaultValue={item.status} className="focus-ring rounded border border-funktion-line px-4 py-3">
                {feedbackStatuses.filter((status) => status.value !== "all").map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white">
              Ændr status
            </button>
          </form>

          <details className="rounded border border-funktion-line p-4">
            <summary className="cursor-pointer font-semibold text-funktion-blue">Opret bug</summary>
            <form action={createBugFromFeedback} className="mt-4 grid gap-3">
              <input type="hidden" name="feedback_id" value={item.id} />
              <input type="hidden" name="title" value={item.title} />
              <input type="hidden" name="description" value={item.description} />
              <input type="hidden" name="severity" value={item.severity ?? "medium"} />
              <input type="hidden" name="status" value="open" />
              <p className="text-sm leading-6 text-black/70">Opretter en bug med samme titel, beskrivelse og severity.</p>
              <button type="submit" className="rounded border border-funktion-line px-4 py-2 text-sm font-semibold text-funktion-blue">
                Opret bug
              </button>
            </form>
          </details>
        </div>
      </div>
    </article>
  );
}

function BugCard({ bug }: { bug: BugItem }) {
  return (
    <article className="rounded border border-funktion-line p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">Bug</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{severityLabel(bug.severity)}</span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">{statusLabel(bug.status)}</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-funktion-blue">{bug.title}</h2>
          <p className="mt-3 leading-7 text-black/75">{bug.description}</p>
          <p className="mt-3 text-xs text-black/50">Oprettet: {formatDateTime(bug.created_at)}</p>
        </div>

        <form action={updateBugStatus} className="grid gap-3 rounded border border-funktion-line p-4">
          <input type="hidden" name="bug_id" value={bug.id} />
          <label className="grid gap-2">
            <span className="text-sm font-medium">Status</span>
            <select name="status" defaultValue={bug.status} className="focus-ring rounded border border-funktion-line px-4 py-3">
              {bugStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white">
            Opdater bug
          </button>
        </form>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-black">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">{text}</div>;
}

function activityBadge(type: ActivityItem["type"]) {
  if (type === "bug") return "rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-800";
  if (type === "beta") return "rounded bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800";
  return "rounded bg-funktion-pale px-3 py-1 text-xs font-semibold text-funktion-blue";
}
