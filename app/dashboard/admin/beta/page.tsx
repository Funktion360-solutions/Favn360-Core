import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createBetaUser,
  markExistingUserAsBeta,
  removeBetaMarking,
  updateBetaUser
} from "./actions";

type BetaPageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: string;
  }>;
};

const betaStatuses = [
  { value: "invited", label: "Inviteret" },
  { value: "active", label: "Aktiv" },
  { value: "completed", label: "Afsluttet" },
  { value: "suspended", label: "Suspenderet" }
];

const roles = [
  { value: "citizen", label: "Borger" },
  { value: "representative", label: "Partsrepræsentant" }
];

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Ikke angivet";

  return new Date(value).toLocaleString("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function roleLabel(role: string | null | undefined) {
  if (role === "citizen") return "Borger";
  if (role === "representative") return "Partsrepræsentant";
  if (role === "administrator") return "Administrator";
  return role ?? "Ukendt";
}

function statusLabel(status: string | null | undefined) {
  return betaStatuses.find((item) => item.value === status)?.label ?? status ?? "Ukendt";
}

export default async function AdminBetaPage({ searchParams }: BetaPageProps) {
  const user = await requireUser("administrator");
  const params = await searchParams;
  const supabaseAdmin = createAdminClient();

  const { data: betaRows, error } = supabaseAdmin
    ? await supabaseAdmin.from("beta_users").select("*").order("created_at", { ascending: false })
    : { data: [], error: { message: "Serveren mangler Supabase service role-konfiguration." } };

  if (error) {
    console.error("[favn360] Beta-brugere kunne ikke hentes.", error);
  }

  const userIds = betaRows?.map((row: any) => row.user_id).filter(Boolean) ?? [];
  const { data: profiles } =
    supabaseAdmin && userIds.length > 0
      ? await supabaseAdmin.from("profiles").select("id,email,full_name,role").in("id", userIds)
      : { data: [] };

  const betaUsers =
    betaRows?.map((row: any) => ({
      ...row,
      profile: profiles?.find((profile: any) => profile.id === row.user_id) ?? null
    })) ?? [];

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Beta-center</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Opret testbrugere, markér eksisterende brugere som beta-brugere og følg intern status.
          </p>
        </div>

        {params?.status ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
            {params.status}
          </div>
        ) : null}

        {params?.error || error ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {params?.error ?? "Beta-brugere kunne ikke hentes. Kontrollér at beta_users-tabellen findes."}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Opret testbruger">
            <form action={createBetaUser} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Fulde navn" name="full_name" required />
                <Input label="Email" name="email" type="email" required />
                <Input label="Telefon" name="phone" />
                <Input label="Midlertidig adgangskode" name="temporary_password" type="password" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select label="Rolle" name="role" options={roles} defaultValue="citizen" />
                <Input label="Beta-gruppe" name="beta_group" placeholder="Fx beta-hold-1" />
              </div>

              <TextArea label="Intern note" name="internal_note" />

              <button type="submit" className="focus-ring w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
                Opret testbruger
              </button>
            </form>
          </Section>

          <Section title="Markér eksisterende bruger">
            <form action={markExistingUserAsBeta} className="grid gap-4">
              <Input label="Brugerens email" name="email" type="email" required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Beta-gruppe" name="beta_group" placeholder="Fx beta-hold-1" />
                <Select label="Status" name="status" options={betaStatuses} defaultValue="active" />
              </div>
              <TextArea label="Intern note" name="internal_note" />

              <button type="submit" className="focus-ring w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
                Markér som beta-bruger
              </button>
            </form>
          </Section>
        </div>

        <Section title="Test- og beta-brugere">
          {betaUsers.length > 0 ? (
            <div className="grid gap-4">
              {betaUsers.map((betaUser: any) => (
                <article key={betaUser.id} className="rounded border border-funktion-line p-5">
                  <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                    <div>
                      <h2 className="text-lg font-semibold text-funktion-blue">
                        {betaUser.profile?.full_name ?? "Profil ikke fundet"}
                      </h2>
                      <dl className="mt-3 grid gap-3 text-sm text-black/70 md:grid-cols-2">
                        <Info label="Email" value={betaUser.profile?.email ?? "Profil ikke fundet"} />
                        <Info label="Rolle" value={roleLabel(betaUser.profile?.role ?? betaUser.role_at_beta_start)} />
                        <Info label="Beta-gruppe" value={betaUser.beta_group ?? "Ikke angivet"} />
                        <Info label="Status" value={statusLabel(betaUser.status)} />
                        <Info label="Oprettet" value={formatDateTime(betaUser.created_at)} />
                        <Info label="Opdateret" value={formatDateTime(betaUser.updated_at)} />
                      </dl>
                      {betaUser.internal_note ? (
                        <p className="mt-4 rounded border border-funktion-line bg-funktion-pale/40 p-4 text-sm leading-6 text-black/75">
                          {betaUser.internal_note}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-3">
                      <form action={updateBetaUser} className="grid gap-3 rounded border border-funktion-line p-4">
                        <input type="hidden" name="beta_user_id" value={betaUser.id} />
                        <Select label="Status" name="status" options={betaStatuses} defaultValue={betaUser.status ?? "active"} />
                        <TextArea label="Intern note" name="internal_note" defaultValue={betaUser.internal_note} rows={4} />
                        <button type="submit" className="focus-ring rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white">
                          Opdater
                        </button>
                      </form>

                      <form action={removeBetaMarking}>
                        <input type="hidden" name="beta_user_id" value={betaUser.id} />
                        <button type="submit" className="focus-ring rounded border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
                          Fjern beta-markering
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
              Der er endnu ikke markeret test- eller beta-brugere.
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function Input({
  label,
  name,
  type = "text",
  required = false,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="focus-ring rounded border border-funktion-line px-4 py-3"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 5
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="focus-ring rounded border border-funktion-line px-4 py-3"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="focus-ring rounded border border-funktion-line px-4 py-3"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
