import Link from "next/link";

import {
  ArrowRight,
  ClipboardList,
  FileText,
  HeartHandshake,
  MessageCircle,
  ShieldCheck
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function ForBorgerePage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              For borgere
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Få overblik over din dagbog, praktik og dokumentation
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Favn360 er lavet til borgere, der har brug for en mere
              overskuelig måde at dokumentere funktionsevne, belastning,
              praktik og hverdagsfunktion på.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              I stedet for papirskemaer, mapper og løse noter kan du samle dine
              registreringer ét sted og løbende følge dit eget forløb.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded bg-funktion-blue px-6 py-4 font-semibold text-white"
              >
                Opret konto
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/find-partsrepraesentant"
                className="rounded border border-funktion-line px-6 py-4 font-medium hover:bg-white"
              >
                Find partsrepræsentant
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Når det er svært at overskue dokumentationen
            </h2>

            <p className="mt-6 leading-8 text-black/70">
              I praktik-, jobafklarings- eller andre kommunale forløb kan der
              ofte være behov for at beskrive, hvordan hverdagen fungerer. Det
              kan handle om energi, søvn, smerter, pauser, fremmøde,
              opgaver, belastning og funktionsniveau.
            </p>

            <p className="mt-6 leading-8 text-black/70">
              Favn360 hjælper med at gøre den dokumentation mere
              tilgængelig, så du ikke skal holde styr på papirskemaer eller
              huske det hele til sidst.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              icon={ClipboardList}
              title="Digital dagbog"
              text="Udfyld dine registreringer digitalt og gem dem samlet ét sted."
            />

            <FeatureCard
              icon={FileText}
              title="Dokumentarkiv"
              text="Gem dokumenter, bilag, praktikpapirer og relevante oplysninger."
            />

            <FeatureCard
              icon={MessageCircle}
              title="Beskeder"
              text="Kommunikér med en tilknyttet partsrepræsentant direkte i platformen."
            />

            <FeatureCard
              icon={HeartHandshake}
              title="Samarbejde"
              text="Del overblik og dokumentation med din partsrepræsentant."
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Adgangskontrol"
              text="Kun tilknyttede brugere kan få adgang til dit forløb."
            />

            <FeatureCard
              icon={ArrowRight}
              title="Overblik over tid"
              text="Se udvikling, praktikregistreringer, noter og dokumenter samlet."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-funktion-blue">
                Hvad kan du registrere?
              </h2>

              <p className="mt-6 leading-8 text-black/70">
                Favn360 er bygget til at kunne rumme både korte
                hverdagsnoter og mere detaljerede beskrivelser af funktion,
                praktik og belastning.
              </p>
            </div>

            <div className="grid gap-4">
              <InfoItem text="Hvordan dagen er gået derhjemme" />
              <InfoItem text="Søvn, træthed, smerter og mentalt niveau" />
              <InfoItem text="Praktikdag, fremmøde og faktisk arbejdstid" />
              <InfoItem text="Opgaver, pauser, pres og samarbejde" />
              <InfoItem text="Hvad der fungerede, og hvad der var svært" />
              <InfoItem text="Dokumenter og bilag knyttet til forløbet" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Et supplement til dit forløb
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 er ikke en myndighed og erstatter ikke kommunen,
                jobcenteret eller andre fagpersoner.
              </p>

              <p>
                Platformen kan bruges som et supplement, der hjælper dig med at
                skabe struktur og dokumentation, som kan understøtte dialogen
                med kommunen.
              </p>

              <p>
                Målet er, at det bliver lettere at vise udvikling, belastning,
                funktionsevne og behov over tid.
              </p>
            </div>
          </div>

          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h3 className="text-2xl font-semibold text-funktion-blue">
              Du kan bruge Favn360 alene eller sammen med en partsrepræsentant
            </h3>

            <p className="mt-5 leading-8 text-black/70">
              Som borger kan du oprette dig og bruge systemet selv. Du kan også
              vælge at tilknytte en godkendt partsrepræsentant, som kan hjælpe
              med overblik, journalnoter, dokumenter og kommunikation.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Opret dig som borger
              </Link>

              <Link
                href="/find-partsrepraesentant"
                className="rounded border border-funktion-line bg-white px-5 py-3 font-semibold"
              >
                Find partsrepræsentant
              </Link>
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

      <p className="mt-3 leading-7 text-black/70">{text}</p>
    </div>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <div className="rounded border border-funktion-line bg-white px-5 py-4">
      <p className="font-medium text-black/80">{text}</p>
    </div>
  );
}