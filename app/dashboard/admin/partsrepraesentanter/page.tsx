import { revalidatePath } from "next/cache";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function approveRepresentative(userId: string) {
  "use server";

  await requireUser("administrator");

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "admin_set_representative_state",
    {
      p_user_id: userId,
      p_approved: true,
      p_verified: null,
      p_suspended: null,
      p_public_profile: null,
      p_accepts_new_clients: null,
      p_promote_to_representative: false
    }
  );

  if (error) {
    console.error("[favn360] Failed to approve representative.", {
      code: error.code,
      message: error.message
    });

    return;
  }

  revalidatePath("/dashboard/admin/partsrepraesentanter");
}

async function revokeRepresentative(userId: string) {
  "use server";

  await requireUser("administrator");

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "admin_set_representative_state",
    {
      p_user_id: userId,
      p_approved: false,
      p_verified: null,
      p_suspended: null,
      p_public_profile: false,
      p_accepts_new_clients: false,
      p_promote_to_representative: false
    }
  );

  if (error) {
    console.error("[favn360] Failed to revoke representative.", {
      code: error.code,
      message: error.message
    });

    return;
  }

  revalidatePath("/dashboard/admin/partsrepraesentanter");
}

export default async function AdminRepresentativesPage() {
  const user = await requireUser("administrator");

  const supabase = await createClient();

  const { data: representatives } = await supabase
    .from("representative_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">
            Partsrepræsentanter
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Administration og godkendelse af partsrepræsentantprofiler.
          </p>
        </div>

        <Section title="Alle partsrepræsentanter">
          {representatives && representatives.length > 0 ? (
            <div className="grid gap-4">
              {representatives.map((rep: any) => (
                <article
                  key={rep.id}
                  className="rounded border border-funktion-line p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-funktion-blue">
                        {rep.display_name}
                      </h2>

                      <p className="mt-1 text-sm text-black/60">
                        {rep.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {rep.approved_by_admin ? (
                          <span className="rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            Godkendt
                          </span>
                        ) : (
                          <span className="rounded bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            Afventer godkendelse
                          </span>
                        )}

                        {rep.public_profile ? (
                          <span className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            Offentlig profil
                          </span>
                        ) : null}

                        {rep.accepts_new_clients ? (
                          <span className="rounded bg-black/10 px-3 py-1 text-xs font-semibold text-black/70">
                            Tager nye klienter
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!rep.approved_by_admin ? (
                        <form action={approveRepresentative.bind(null, rep.user_id)}>
                          <button
                            type="submit"
                            className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white"
                          >
                            Godkend
                          </button>
                        </form>
                      ) : (
                        <form action={revokeRepresentative.bind(null, rep.user_id)}>
                          <button
                            type="submit"
                            className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                          >
                            Fjern godkendelse
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <InfoRow
                      label="Telefon"
                      value={rep.phone ?? "Ikke angivet"}
                    />

                    <InfoRow
                      label="By"
                      value={rep.city ?? "Ikke angivet"}
                    />

                    <InfoRow
                      label="Firma"
                      value={rep.company_name ?? "Ikke angivet"}
                    />

                    <InfoRow
                      label="CVR"
                      value={rep.cvr ?? "Ikke angivet"}
                    />
                  </div>

                  {rep.profile_text ? (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-wide text-black/50">
                        Profiltekst
                      </p>

                      <p className="mt-2 leading-7 text-black/80">
                        {rep.profile_text}
                      </p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
              Ingen partsrepræsentanter endnu.
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded border border-funktion-line p-3">
      <p className="text-xs uppercase tracking-wide text-black/50">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-black/80">
        {value}
      </p>
    </div>
  );
}