import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Opret konto
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Opret dig som borger i Favn360
            </h1>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Som borger kan du bruge Favn360 gratis til dagbog,
              dokumentation, praktikoverblik, beskeder og funktionsevne.
            </p>

            <p className="mt-6 leading-8 text-black/70">
              Du skal ikke indtaste CPR-nummer ved oprettelse. Flere oplysninger
              kan udfyldes senere i onboarding.
            </p>

            <div className="mt-8 rounded border border-funktion-line bg-white p-6">
              <h2 className="text-xl font-semibold text-funktion-blue">
                Er du professionel eller partsrepræsentant?
              </h2>

              <p className="mt-3 leading-7 text-black/70">
                Professionelle brugere, privatpraktiserende socialrådgivere,
                bisiddere og partsrepræsentanter skal ansøge om adgang.
              </p>

              <Link
                href="/ansog-om-partsrepraesentant"
                className="mt-5 inline-flex rounded border border-funktion-line px-5 py-3 font-semibold hover:bg-funktion-pale"
              >
                Ansøg om oprettelse
              </Link>
            </div>
          </div>

          <SignupForm />
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}