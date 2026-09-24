import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileText,
  MessageCircle,
  Sparkles,
  Users
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function ForPartsrepraesentanterPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              For partsrepræsentanter
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Et professionelt arbejdsredskab til private partsrepræsentanter
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Favn360 er udviklet til private partsrepræsentanter,
              selvstændige socialrådgivere, bisiddere, rådgivere og faglige
              støttepersoner, der ønsker bedre overblik, dokumentation og
              samarbejde med borgeren.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Platformen samler klientoverblik, dagbogsdata, dokumenter,
              journalnoter, beskeder, praktikregistreringer og analyser i ét
              samlet digitalt arbejdsrum.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded bg-funktion-blue px-6 py-4 font-semibold text-white"
              >
                Ansøg og opret dig som partsrepræsentant
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/om-favn360"
                className="rounded border border-funktion-line px-6 py-4 font-medium hover:bg-white"
              >
                Læs om Favn360
              </Link>
            </div>
          </div>

          <div className="rounded border border-funktion-line bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-black/50">
              Beta
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-funktion-blue">
              Gratis i beta-perioden
            </h2>

            <p className="mt-4 leading-7 text-black/70">
              Favn360 videreudvikles løbende. I beta-perioden kan
              partsrepræsentanter anvende platformen gratis.
            </p>

            <div className="mt-6 rounded bg-funktion-pale/60 p-5">
              <p className="text-sm text-black/60">
                Forventet pris efter beta
              </p>

              <p className="mt-2 text-4xl font-semibold text-funktion-blue">
                200 kr./md.
              </p>

              <p className="mt-2 text-sm text-black/60">
                Borgeren anvender platformen gratis.
              </p>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-black/70">
              <li>• Klientoverblik</li>
              <li>• Beskeder og dokumentarkiv</li>
              <li>• Journalnoter og timeline</li>
              <li>• Praktikdata og funktionsudvikling</li>
              <li>• Flere funktioner under udvikling</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Mindre administrativ belastning. Mere samlet overblik.
            </h2>

            <p className="mt-6 leading-8 text-black/70">
              Som privat partsrepræsentant eller socialfaglig rådgiver kan det
              være vanskeligt at holde styr på dokumenter, beskeder,
              observationer, praktikoplysninger og borgerens løbende
              registreringer. Favn360 samler det hele ét sted.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              icon={Users}
              title="Klientoverblik"
              text="Se tilknyttede borgere, status, praktikoplysninger og seneste aktivitet."
            />

            <FeatureCard
              icon={ClipboardList}
              title="Journalnoter"
              text="Opret mødenoter, observationer, aftaler, telefonnoter og opfølgninger."
            />

            <FeatureCard
              icon={FileText}
              title="Dokumentarkiv"
              text="Saml dokumenter, bilag, afgørelser, praktikpapirer og relevant materiale."
            />

            <FeatureCard
              icon={MessageCircle}
              title="Beskeder"
              text="Kommunikér direkte med borgeren i et samlet beskedsystem."
            />

            <FeatureCard
              icon={BarChart3}
              title="Praktikoverblik"
              text="Følg fremmøde, fravær, belastning, funktionsniveau og arbejdstid."
            />

            <FeatureCard
              icon={Sparkles}
              title="AI som hjælpeværktøj"
              text="Brug AI-understøttede analyser som støtte til overblik og struktur — ikke som erstatning for faglighed."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Hvem kan bruge Favn360?
            </h2>

            <p className="mt-6 leading-8 text-black/70">
              Favn360 henvender sig til private aktører, der arbejder tæt
              sammen med borgere i kommunale eller socialfaglige forløb.
            </p>
          </div>

          <div className="grid gap-4">
            <InfoItem text="Private partsrepræsentanter" />
            <InfoItem text="Privatpraktiserende socialrådgivere" />
            <InfoItem text="Bisiddere og rådgivere" />
            <InfoItem text="Faglige støttepersoner" />
            <InfoItem text="Aktører der hjælper borgere med dokumentation og overblik" />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Udviklet med socialfaglig forståelse
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 er udviklet med blik for de udfordringer, der ofte
                opstår, når borgere skal dokumentere funktionsevne, belastning
                og udvikling over tid.
              </p>

              <p>
                Systemet er ikke tænkt som et myndighedssystem, men som et
                støtte- og arbejdsredskab, der kan styrke samarbejdet mellem
                borger og partsrepræsentant.
              </p>

              <p>
                Målet er at skabe mere struktur, bedre dokumentation og et
                mere samlet billede af borgerens forløb.
              </p>
            </div>
          </div>

          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h3 className="text-2xl font-semibold text-funktion-blue">
              AI som moderne hjælpeværktøj
            </h3>

            <p className="mt-5 leading-8 text-black/70">
              Favn360 kan anvende AI til at skabe overblik over mønstre,
              analyser og udvikling. AI skal understøtte den faglige vurdering
              — ikke erstatte den.
            </p>

            <p className="mt-5 leading-8 text-black/70">
              Partsrepræsentanten bevarer den faglige rolle, mens teknologien
              hjælper med struktur, opsummering og overblik.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Roadmap: mod et komplet praksissystem
            </h2>

            <p className="mt-6 leading-8 text-black/70">
              Favn360 er stadig under udvikling, men ambitionen er at
              udvikle platformen til et bredere praksissystem for private
              partsrepræsentanter og socialfaglige aktører.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <RoadmapCard
              icon={BriefcaseBusiness}
              title="Økonomi og fakturering"
              text="Ydelsesregistrering, klientbetalinger, fakturaoverblik og økonomistyring for privatpraktiserende."
            />

            <RoadmapCard
              icon={CalendarDays}
              title="Kalender og møder"
              text="Booking, mødehistorik, aftaler, opfølgninger og opgavestyring."
            />

            <RoadmapCard
              icon={Users}
              title="Klientstyring"
              text="Flere klienttyper, porteføljeoverblik, teamfunktioner og organisationskonti."
            />

            <RoadmapCard
              icon={FileText}
              title="Rapporter og eksport"
              text="Udvidede sagsrapporter, PDF-eksport, mødepakker og dokumentationspakker."
            />

            <RoadmapCard
              icon={BarChart3}
              title="Statistik og indsigter"
              text="Bedre overblik over mønstre, udvikling, fremmøde og funktion over tid."
            />

            <RoadmapCard
              icon={Sparkles}
              title="Flere hjælpeværktøjer"
              text="Nye socialfaglige værktøjer, workflows og digitale redskaber til arbejdet med borgeren."
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded border border-funktion-line bg-funktion-blue p-10 text-white">
            <h2 className="text-3xl font-semibold">
              Klar til at prøve Favn360?
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-white/80">
              Opret dig som partsrepræsentant og få adgang til en platform,
              der samler dokumentation, kommunikation og klientoverblik ét sted.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="rounded bg-white px-6 py-4 font-semibold text-funktion-blue"
              >
                Ansøg og opret dig
              </Link>

              <Link
                href="/kontakt"
                className="rounded border border-white/30 px-6 py-4 font-semibold text-white"
              >
                Kontakt
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

      <p className="mt-3 leading-7 text-black/70">
        {text}
      </p>
    </div>
  );
}

function RoadmapCard({
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
      <Icon className="h-6 w-6 text-funktion-blue" />

      <h3 className="mt-4 text-lg font-semibold text-funktion-blue">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-black/70">
        {text}
      </p>
    </div>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <div className="rounded border border-funktion-line bg-white px-5 py-4">
      <p className="font-medium text-black/80">
        {text}
      </p>
    </div>
  );
}