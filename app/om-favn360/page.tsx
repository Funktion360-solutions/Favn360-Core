import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

import {
  ArrowRight,
  ClipboardList,
  FileText,
  HeartHandshake,
  Lightbulb,
  Users
} from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";

export default function AboutFavn360Page() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />
      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Om Favn360
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              En digital platform udviklet med udgangspunkt i borgerens virkelighed
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Favn360 er en sags- og dokumentationsplatform for borgere
              og partsrepræsentanter med fokus på funktionsevne,
              praktikforløb, dokumentation og overblik.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Platformen er udviklet som et supplement og en hjælp til borgere,
              der står i pressede sociale eller kommunale forløb,
              hvor dokumentation og dagbogsregistreringer ofte spiller en central rolle.
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
                href="/for-borgere"
                className="rounded border border-funktion-line px-6 py-4 font-medium hover:bg-white"
              >
                For borgere
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
                <Lightbulb className="h-4 w-4" />
                Hvordan idéen opstod
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
                Favn360 begyndte med en telefonsamtale
              </h2>

              <div className="mt-6 space-y-6 leading-8 text-black/70">
                <p>
                  Favn360 blev udviklet af Aksel Slot,
                  socialrådgiverstuderende, med udgangspunkt i en konkret samtale
                  med en bekendt, der stod foran et jobafklaringsforløb.
                </p>

                <p>
                  Allerede inden forløbet begyndte, følte hun sig presset over
                  tanken om at skulle printe dagbogsskemaer ud,
                  udfylde dem med kuglepen og gemme papirerne gennem hele forløbet.
                </p>

                <p>
                  Samtalen skabte en refleksion over,
                  hvorfor denne type dokumentation stadig ofte håndteres analogt,
                  når mange borgere i forvejen befinder sig i en belastet situation.
                </p>

                <p>
                  Det blev startskuddet til Favn360 —
                  et digitalt værktøj, der skulle gøre dokumentation,
                  overblik og samarbejde mere tilgængeligt og overskueligt.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <FeatureCard
                icon={ClipboardList}
                title="Dagbog og funktionsevne"
                text="Registrering af hverdagsfunktion, belastning, praktik og progression."
              />

              <FeatureCard
                icon={FileText}
                title="Dokumentation samlet ét sted"
                text="Dokumenter, noter, beskeder og registreringer samlet digitalt."
              />

              <FeatureCard
                icon={Users}
                title="Samarbejde"
                text="Bedre overblik og samarbejde mellem borger og partsrepræsentant."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              <HeartHandshake className="h-4 w-4" />
              Borgerinddragelse
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
              Favn360 er udviklet med direkte borgerinput
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 er ikke udviklet isoleret som et rent teknologiprojekt.
              </p>

              <p>
                Platformen er udviklet i dialog med en socialt udsat borger,
                som selv stod i et kommunalt forløb og kunne beskrive,
                hvilke udfordringer der opleves i praksis.
              </p>

              <p>
                Mange af funktionerne i platformen udspringer direkte af disse input:
              </p>

              <ul className="grid gap-3 pl-6">
                <li className="list-disc">
                  behov for bedre overblik
                </li>

                <li className="list-disc">
                  mindre papirarbejde
                </li>

                <li className="list-disc">
                  lettere dokumentation i hverdagen
                </li>

                <li className="list-disc">
                  mulighed for løbende registrering
                </li>

                <li className="list-disc">
                  bedre støtte og samarbejde
                </li>

                <li className="list-disc">
                  følelsen af at blive taget alvorligt
                </li>
              </ul>

              <p>
                Målet har hele tiden været at skabe et værktøj,
                som tager udgangspunkt i borgerens faktiske situation
                og ikke kun i administrative behov.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Favn360 er et supplement — ikke en myndighed
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 er udviklet som et støtteværktøj
                til borgere og partsrepræsentanter.
              </p>

              <p>
                Platformen kan understøtte borgerens dokumentation
                overfor kommunen og skabe bedre overblik over forløb,
                praktik, funktionsevne og udvikling over tid.
              </p>

              <p>
                Favn360 er ikke en offentlig myndighed,
                et kommunalt system eller juridisk rådgivning.
              </p>

              <p>
                Systemet skal i stedet fungere som et praktisk værktøj,
                der kan hjælpe borgeren med struktur,
                dokumentation og samarbejde i komplekse forløb.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-funktion-blue">
                Platformen er stadig under udvikling
              </h2>

              <div className="mt-6 space-y-6 leading-8 text-black/70">
                <p>
                  Favn360 udvikles løbende,
                  og nye funktioner tilføjes over tid.
                </p>

                <p>
                  Første version af platformen henvender sig primært
                  til borgere i praktik- og jobafklaringsforløb
                  samt partsrepræsentanter.
                </p>

                <p>
                  Ambitionen er på sigt at udvikle Favn360
                  til et bredere digitalt værktøj for borgere
                  med tilknytning til kommunen.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-funktion-blue">
                Visionen for Favn360
              </h2>

              <div className="mt-6 space-y-6 leading-8 text-black/70">
                <p>
                  Visionen er at skabe bedre digitale værktøjer
                  til borgere i sociale og kommunale forløb.
                </p>

                <p>
                  På længere sigt ønsker Favn360 blandt andet:
                </p>

                <ul className="grid gap-3 pl-6">
                  <li className="list-disc">
                    flere målgrupper og forløbstyper
                  </li>

                  <li className="list-disc">
                    samarbejde med fagpersoner
                  </li>

                  <li className="list-disc">
                    bedre digital understøttelse af dokumentation
                  </li>

                  <li className="list-disc">
                    mere borgerinddragelse
                  </li>

                  <li className="list-disc">
                    indsigt og forskning i socialt udsatte borgeres liv
                  </li>
                </ul>

                <p>
                  Favn360 bygger på idéen om,
                  at teknologi også kan bruges til at skabe mere overblik,
                  tryghed og støtte i sociale forløb.
                </p>
              </div>
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