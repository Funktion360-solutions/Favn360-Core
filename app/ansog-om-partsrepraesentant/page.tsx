import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ApplicationForm } from "./ApplicationForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RepresentativeApplicationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/ansog-om-partsrepraesentant");
  }

  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Ansøg om adgang
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Ansøg om oprettelse som professionel bruger
            </h1>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Professionelle brugere, partsrepræsentanter, privatpraktiserende
              socialrådgivere, bisiddere og rådgivere skal ansøge om adgang til
              Favn360.
            </p>

            <p className="mt-6 leading-8 text-black/70">
              Ansøgninger gennemgås manuelt for at sikre tryghed, kvalitet og
              korrekt adgang til platformens professionelle funktioner.
            </p>

            <div className="mt-8 rounded border border-funktion-line bg-white p-6">
              <h2 className="text-xl font-semibold text-funktion-blue">
                Hvorfor manuel godkendelse?
              </h2>

              <p className="mt-3 leading-7 text-black/70">
                Favn360 arbejder med borgere, dokumentation,
                funktionsevne, beskeder og forløbsoplysninger. Derfor skal
                professionelle brugere godkendes, før de får adgang som
                partsrepræsentant.
              </p>

              <Link
                href="/for-partsrepraesentanter"
                className="mt-5 inline-flex rounded border border-funktion-line px-5 py-3 font-semibold hover:bg-funktion-pale"
              >
                Læs om Favn360 for professionelle
              </Link>
            </div>
          </div>

          <ApplicationForm />
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}