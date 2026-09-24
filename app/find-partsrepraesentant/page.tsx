import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicFooter } from "@/components/PublicFooter";

export default async function FindRepresentativePage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const query = resolvedSearchParams?.q?.trim() ?? "";

  let request = supabase
    .from("representative_profiles")
    .select(
      "id, display_name, company_name, city, area, profile_text, specialties, price_text, website, accepts_new_clients, public_profile, approved_by_admin, verified"
    )
    .eq("public_profile", true)
    .eq("accepts_new_clients", true)
    .eq("approved_by_admin", true)
    .eq("suspended", false)
    .order("display_name");

  if (query.length > 0) {
    request = request.or(
      `display_name.ilike.%${query}%,company_name.ilike.%${query}%,city.ilike.%${query}%,area.ilike.%${query}%`
    );
  }

  const { data: representatives, error } = await request;

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-funktion-line bg-funktion-blue px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Favn360
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Find partsrepræsentant
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/85">
            Søg efter godkendte partsrepræsentanter, der aktivt har valgt at
            være synlige i Favn360.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded border border-white/30 px-4 py-2 text-sm font-semibold text-white"
            >
              Til forsiden
            </Link>

            <Link
              href="/auth/login"
              className="rounded bg-white px-4 py-2 text-sm font-semibold text-funktion-blue"
            >
              Log ind
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
        <form className="rounded border border-funktion-line bg-white p-5">
          <label className="text-sm font-medium text-black">
            Søg efter navn, firma, by eller område
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              name="q"
              defaultValue={query}
              className="flex-1 rounded border border-funktion-line px-4 py-3"
              placeholder="Fx Aalborg, ADHD, fleksjob"
            />

            <button
              type="submit"
              className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
            >
              Søg
            </button>
          </div>
        </form>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Partsrepræsentanter kunne ikke indlæses.
          </div>
        ) : null}

        {!error && representatives?.length === 0 ? (
          <div className="rounded border border-funktion-line p-5 text-black/70">
            Der blev ikke fundet godkendte partsrepræsentanter.
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {representatives?.map((rep) => (
            <article
              key={rep.id}
              className="rounded border border-funktion-line bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-funktion-blue">
                    {rep.display_name}
                  </h2>

                  {rep.company_name ? (
                    <p className="mt-1 text-sm text-black/70">
                      {rep.company_name}
                    </p>
                  ) : null}
                </div>

                {rep.verified ? (
                  <span className="rounded bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                    Godkendt
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-black/70">
                {[rep.city, rep.area].filter(Boolean).join(" · ") ||
                  "Område ikke angivet"}
              </p>

              {rep.profile_text ? (
                <p className="mt-4 leading-7 text-black/80">
                  {rep.profile_text}
                </p>
              ) : null}

              {rep.specialties?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {rep.specialties.map((specialty: string) => (
                    <span
                      key={specialty}
                      className="rounded bg-funktion-blue/10 px-3 py-1 text-xs font-medium text-funktion-blue"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : null}

              {rep.price_text ? (
                <p className="mt-4 text-sm text-black/70">
                  <span className="font-semibold">Pris/oplysninger:</span>{" "}
                  {rep.price_text}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/find-partsrepraesentant/${rep.id}`}
                  className="rounded border border-funktion-line px-4 py-2 text-sm font-semibold"
                >
                  Se profil
                </Link>

                <Link
                  href={`/auth/login?next=/find-partsrepraesentant/${rep.id}`}
                  className="rounded bg-funktion-blue px-4 py-2 text-sm font-semibold text-white"
                >
                  Anmod om tilknytning
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}