import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  approveApplication,
  reactivateApplication,
  rejectApplication,
  reopenApplication,
  suspendApplication
} from "./actions";

type ApplicationStatus = "pending" | "approved" | "rejected" | "suspended";

type RepresentativeApplication = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role_title: string | null;
  company_name: string | null;
  cvr: string | null;
  city_area: string | null;
  website: string | null;
  profile_text: string | null;
  reason: string | null;
  status: ApplicationStatus | string | null;
  admin_note: string | null;
  created_at: string | null;
  decided_at: string | null;
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Afventer",
  approved: "Godkendt",
  rejected: "Afvist",
  suspended: "Suspenderet"
};

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-slate-200 text-slate-800"
};

export default async function AdminApplicationsPage() {
  const user = await requireUser("administrator");
  const supabase = await createClient();

  const { data: applications, error } = await supabase
    .from("representative_applications")
    .select(
      "id,name,email,phone,role_title,company_name,cvr,city_area,website,profile_text,reason,status,admin_note,created_at,decided_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const rows = (applications ?? []) as RepresentativeApplication[];
  const counts = {
    pending: rows.filter((application) => application.status === "pending").length,
    approved: rows.filter((application) => application.status === "approved").length,
    rejected: rows.filter((application) => application.status === "rejected").length,
    suspended: rows.filter((application) => application.status === "suspended").length
  };

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">
            Professionelle ansøgninger
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Behandl ansøgninger, styr onboarding-adgang og skriv interne noter.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard label="Afventer" value={counts.pending} />
          <StatusCard label="Godkendt" value={counts.approved} />
          <StatusCard label="Afvist" value={counts.rejected} />
          <StatusCard label="Suspenderet" value={counts.suspended} />
        </div>

        <div className="rounded border border-funktion-line bg-funktion-pale px-5 py-4 text-sm leading-6 text-black/70">
          Mailudsendelse til ansøger tilføjes senere.
        </div>

        <Section title="Ansøgninger">
          {rows.length > 0 ? (
            <div className="grid gap-4">
              {rows.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          ) : (
            <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
              Der er endnu ingen professionelle ansøgninger.
            </p>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function StatusCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-funktion-line bg-white p-5 shadow-calm">
      <p className="text-sm font-medium text-black/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-funktion-blue">{value}</p>
    </div>
  );
}

function ApplicationCard({
  application
}: {
  application: RepresentativeApplication;
}) {
  const status = normalizeStatus(application.status);

  return (
    <article className="rounded border border-funktion-line p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-funktion-blue">
              {application.name ?? "Navn mangler"}
            </h2>
            <StatusBadge status={status} />
          </div>

          <p className="mt-1 text-sm text-black/60">
            {application.email ?? "Email mangler"}
          </p>
        </div>

        <div className="text-sm text-black/60 lg:text-right">
          <p>Oprettet: {formatDate(application.created_at)}</p>
          <p>Afgjort: {formatDate(application.decided_at)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <InfoRow label="Telefon" value={application.phone} />
        <InfoRow label="Rolle/funktion" value={application.role_title} />
        <InfoRow label="Firma / organisation" value={application.company_name} />
        <InfoRow label="CVR" value={application.cvr} />
        <InfoRow label="By/område" value={application.city_area} />
        <InfoRow label="Hjemmeside" value={application.website} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TextBlock label="Profiltekst" value={application.profile_text} />
        <TextBlock label="Begrundelse" value={application.reason} />
      </div>

      {application.admin_note ? (
        <TextBlock
          className="mt-5"
          label="Intern admin-note"
          value={application.admin_note}
        />
      ) : null}

      <form className="mt-5 grid gap-4">
        <input type="hidden" name="application_id" value={application.id} />

        <label className="grid gap-2">
          <span className="text-sm font-medium">Admin-note</span>
          <textarea
            name="admin_note"
            rows={3}
            defaultValue={application.admin_note ?? ""}
            className="focus-ring rounded border border-funktion-line px-4 py-3 leading-7"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            formAction={approveApplication}
            type="submit"
            className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Godkend
          </button>

          <button
            formAction={rejectApplication}
            type="submit"
            className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Afvis
          </button>

          <button
            formAction={suspendApplication}
            type="submit"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Suspender
          </button>

          <button
            formAction={reopenApplication}
            type="submit"
            className="rounded border border-funktion-line px-4 py-2 text-sm font-semibold text-black/70"
          >
            Genåbn
          </button>

          {status === "suspended" ? (
            <button
              formAction={reactivateApplication}
              type="submit"
              className="rounded border border-green-300 px-4 py-2 text-sm font-semibold text-green-800"
            >
              Genaktiver godkendt
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`rounded px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded border border-funktion-line p-3">
      <p className="text-xs uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-1 text-sm font-medium text-black/80">
        {value && value.length > 0 ? value : "Ikke angivet"}
      </p>
    </div>
  );
}

function TextBlock({
  label,
  value,
  className = ""
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-black/80">
        {value && value.length > 0 ? value : "Ikke angivet"}
      </p>
    </div>
  );
}

function normalizeStatus(status: RepresentativeApplication["status"]) {
  if (
    status === "approved" ||
    status === "rejected" ||
    status === "suspended"
  ) {
    return status;
  }

  return "pending";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Ikke angivet";
  }

  return new Date(value).toLocaleString("da-DK");
}
