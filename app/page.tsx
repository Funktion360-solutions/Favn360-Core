import Link from "next/link";

import {
  ArrowRight,
  ClipboardList,
  FileText,
  MessageCircle,
  ShieldCheck,
  Users
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Funktionsevne · Praktik · Dokumentation
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Ét samlet overblik over borgerens forløb
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              Favn360 samler dagbogsregistreringer,
              praktikoverblik, dokumenter, journalnoter,
              beskeder og funktionsudvikling i én samlet platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded bg-funktion-blue px-6 py-4 font-semibold text-white"
              >
                Kom i gang
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/for-borgere"
                className="rounded border border-funktion-line px-6 py-4 font-medium hover:bg-white"
              >
                For borgere
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <FeatureCard
              icon={ClipboardList}
              title="Dagbog og funktion"
              text="Registrér hverdagsfunktion, belastning, praktik og trivsel."
            />

            <FeatureCard
              icon={FileText}
              title="Dokumentarkiv"
              text="Upload dokumenter, afgørelser, praktikpapirer og bilag."
            />

            <FeatureCard
              icon={MessageCircle}
              title="Beskeder"
              text="Kommunikation mellem borger og partsrepræsentant."
            />

            <FeatureCard
              icon={Users}
              title="Partsrepræsentanter"
              text="Klientoverblik, journalnoter og samlet sagsforløb."
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Designet til dokumentation af funktionsevne og praktikforløb
            </h2>

            <p className="mt-6 leading-8 text-black/70">
              Favn360 er udviklet til at skabe struktur,
              overblik og sammenhæng i længerevarende forløb,
              hvor dokumentation, praktik, funktionsevne
              og kommunikation spiller en central rolle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              title="For borgere"
              text="Dagbogsregistreringer, dokumenter, beskeder og overblik over eget forløb."
              href="/for-borgere"
            />

            <InfoCard
              title="For partsrepræsentanter"
              text="Klientoverblik, journalnoter, timeline og dokumentation."
              href="/for-partsrepraesentanter"
            />

            <InfoCard
              title="Find partsrepræsentant"
              text="Find offentlige godkendte partsrepræsentanter."
              href="/find-partsrepraesentant"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                <ShieldCheck className="h-4 w-4" />
                Sikkerhed og adgangsstyring
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
                Rollebaseret adgang til data og dokumentation
              </h2>

              <p className="mt-6 leading-8 text-black/70">
                Favn360 arbejder med relationel adgang,
                hvor kun tilknyttede brugere kan få adgang
                til borgerens dokumentation, beskeder
                og sagsforløb.
              </p>
            </div>

            <div className="grid gap-4">
              <SecurityItem text="Borgerstyring af relationer" />
              <SecurityItem text="Adgang kun for tilknyttet partsrepræsentant" />
              <SecurityItem text="Private dokumenter og beskeder" />
              <SecurityItem text="Rollebaseret adgangsstyring" />
              <SecurityItem text="Dokumentation og historik samlet ét sted" />
            </div>
          </div>
        </div>
      </section>

    <PublicFooter />
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded border border-funktion-line bg-white p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded bg-funktion-blue/10">
        <Icon className="h-6 w-6 text-funktion-blue" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-funktion-blue">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-black/70">
        {text}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  text,
  href
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded border border-funktion-line p-6 transition hover:border-funktion-blue hover:bg-funktion-pale/30"
    >
      <h3 className="text-xl font-semibold text-funktion-blue">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-black/70">
        {text}
      </p>
    </Link>
  );
}

function SecurityItem({ text }: { text: string }) {
  return (
    <div className="rounded border border-funktion-line bg-white px-5 py-4">
      <p className="font-medium text-black/80">
        {text}
      </p>
    </div>
  );
}