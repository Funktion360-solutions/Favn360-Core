import Link from "next/link";

import { Mail, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Kontakt
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Kontakt Favn360
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Har du spørgsmål til Favn360, ønsker du adgang som
              partsrepræsentant, eller vil du høre mere om platformen, kan du
              kontakte os direkte.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="grid gap-6">
            <ContactCard
              icon={Mail}
              title="E-mail"
              text="Skriv til Favn360"
              value="kontakt@favn360.dk"
              href="mailto:kontakt@favn360.dk"
            />

            <ContactCard
              icon={UserRound}
              title="Udviklet af"
              text="Favn360 er udviklet af Aksel Slot"
              value="Socialrådgiverstuderende og initiativtager"
            />

            <ContactCard
              icon={ShieldCheck}
              title="Sikkerhed og data"
              text="Læs mere om adgang, roller og databehandling"
              value="Sikkerhed og data"
              href="/sikkerhed-og-data"
            />
          </div>

          <div className="rounded border border-funktion-line bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              <MessageCircle className="h-4 w-4" />
              Henvendelser
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
              Hvad kan du kontakte os om?
            </h2>

            <div className="mt-6 grid gap-4">
              <InfoItem text="Spørgsmål fra borgere, der ønsker at bruge Favn360" />
              <InfoItem text="Partsrepræsentanter, der ønsker adgang til platformen" />
              <InfoItem text="Input, fejl, forslag eller idéer til videreudvikling" />
              <InfoItem text="Samarbejde med fagpersoner eller organisationer" />
              <InfoItem text="Spørgsmål om dokumentation, funktionsevne og forløbsstruktur" />
            </div>

            <div className="mt-8 rounded bg-funktion-pale/50 p-5">
              <p className="font-semibold text-funktion-blue">
                Bemærk
              </p>

              <p className="mt-3 leading-7 text-black/70">
                Favn360 er ikke en myndighed og kan ikke træffe afgørelser
                i kommunale sager. Platformen er et digitalt støtte- og
                dokumentationsværktøj.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="mailto:kontakt@favn360.dk"
                className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Send e-mail
              </Link>

              <Link
                href="/om-favn360"
                className="rounded border border-funktion-line px-5 py-3 font-semibold"
              >
                Læs om Favn360
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function ContactCard({
  icon: Icon,
  title,
  text,
  value,
  href
}: {
  icon: any;
  title: string;
  text: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded border border-funktion-line bg-white p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded bg-funktion-blue/10">
        <Icon className="h-6 w-6 text-funktion-blue" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-funktion-blue">
        {title}
      </h2>

      <p className="mt-2 text-sm text-black/60">
        {text}
      </p>

      <p className="mt-4 font-medium text-black/80">
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

function InfoItem({ text }: { text: string }) {
  return (
    <div className="rounded border border-funktion-line bg-funktion-pale/30 px-5 py-4">
      <p className="font-medium text-black/80">{text}</p>
    </div>
  );
}
