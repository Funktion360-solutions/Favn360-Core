import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PublicFooter } from "@/components/PublicFooter";

export default async function RepresentativeProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: representative, error } = await supabase
    .from("representative_profiles")
    .select("*")
    .eq("id", id)
    .eq("approved_by_admin", true)
    .eq("public_profile", true)
    .eq("suspended", false)
    .single();

  if (error || !representative) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-funktion-line bg-funktion-blue px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Favn360
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {representative.display_name}
          </h1>

          {representative.company_name ? (
            <p className="mt-3 text-lg text-white/85">
              {representative.company_name}
            </p>
          ) : null}

          <p className="mt-4 text-white/80">
            {[representative.city, representative.area]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-10">
        <div className="rounded border border-funktion-line bg-white p-6">
          <h2 className="text-xl font-semibold text-funktion-blue">
            Om partsrepræsentanten
          </h2>

          <div className="mt-5 grid gap-5">
            {representative.profile_text ? (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                  Profiltekst
                </h3>

                <p className="mt-2 leading-7 text-black/80">
                  {representative.profile_text}
                </p>
              </div>
            ) : null}

            {representative.specialties?.length ? (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                  Specialer
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {representative.specialties.map((specialty: string) => (
                    <span
                      key={specialty}
                      className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-medium text-funktion-blue"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {representative.price_text ? (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                  Pris/oplysninger
                </h3>

                <p className="mt-2 leading-7 text-black/80">
                  {representative.price_text}
                </p>
              </div>
            ) : null}

            {representative.website ? (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                  Hjemmeside
                </h3>

                <a
                  href={representative.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-funktion-blue underline"
                >
                  {representative.website}
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded border border-funktion-line bg-white p-6">
          <h2 className="text-xl font-semibold text-funktion-blue">
            Kontakt og tilknytning
          </h2>

          <div className="mt-5 grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-black/60">
                Status
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {representative.verified ? (
                  <span className="rounded bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                    Godkendt profil
                  </span>
                ) : null}

                {representative.accepts_new_clients ? (
                  <span className="rounded bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                    Tager imod nye klienter
                  </span>
                ) : null}
              </div>
            </div>

            {user ? (
              <Link
                href={`/find-partsrepraesentant/${representative.id}/anmod`}
                className="inline-flex w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Anmod om tilknytning
              </Link>
            ) : (
              <Link
                href={`/auth/login?next=/find-partsrepraesentant/${representative.id}`}
                className="inline-flex w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Log ind for at anmode om tilknytning
              </Link>
            )}

            <Link
              href="/find-partsrepraesentant"
              className="inline-flex w-fit rounded border border-funktion-line px-5 py-3 font-semibold"
            >
              Tilbage til oversigt
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}