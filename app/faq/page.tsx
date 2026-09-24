import Link from "next/link";

import {
  Brain,
  CreditCard,
  FileText,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Users
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";

const sections = [
  {
    title: "For borgere",
    icon: Users,
    questions: [
      {
        q: "Hvad kan jeg bruge Favn360 til som borger?",
        a: "Du kan bruge Favn360 til at samle dagbogsregistreringer, praktikoplysninger, dokumenter, beskeder og overblik over dit forløb ét sted."
      },
      {
        q: "Er Favn360 et kommunalt system?",
        a: "Nej. Favn360 er ikke en myndighed og er ikke et kommunalt afgørelsessystem. Platformen kan bruges som støtte til dokumentation og overblik i forløb, hvor du har kontakt med kommunen."
      },
      {
        q: "Kan jeg bruge Favn360 uden partsrepræsentant?",
        a: "Ja. Du kan bruge Favn360 selv som borger. Du kan også vælge at tilknytte en godkendt partsrepræsentant, hvis du ønsker hjælp til overblik og dokumentation."
      },
      {
        q: "Er Favn360 gratis for borgere?",
        a: "Ja. Borgeren kan bruge Favn360 gratis."
      }
    ]
  },
  {
    title: "For partsrepræsentanter",
    icon: FileText,
    questions: [
      {
        q: "Hvem kan oprette sig som partsrepræsentant?",
        a: "Favn360 henvender sig blandt andet til private partsrepræsentanter, privatpraktiserende socialrådgivere, bisiddere, rådgivere og faglige støttepersoner."
      },
      {
        q: "Hvad får jeg adgang til som partsrepræsentant?",
        a: "Når en borger er tilknyttet dig, kan du se klientoverblik, dagbogsregistreringer, dokumenter, beskeder, journalnoter, timeline, praktikoverblik og relevante analyser."
      },
      {
        q: "Kan jeg se alle borgere i systemet?",
        a: "Nej. Du kan kun se borgere, hvor der er en aktiv tilknytning mellem dig og borgeren."
      },
      {
        q: "Skal partsrepræsentanter godkendes?",
        a: "Ja. Offentlige partsrepræsentantprofiler skal godkendes, før de kan vises offentligt i Favn360."
      }
    ]
  },
  {
    title: "Pris og beta",
    icon: CreditCard,
    questions: [
      {
        q: "Hvad koster Favn360?",
        a: "Favn360 er gratis i beta-perioden for partsrepræsentanter. Den forventede pris efter beta er 200 kr. pr. måned. Borgeren bruger platformen gratis."
      },
      {
        q: "Hvorfor er Favn360 gratis i beta-perioden?",
        a: "Platformen er stadig under udvikling. Beta-perioden bruges til at teste, forbedre og videreudvikle Favn360 med input fra brugere."
      },
      {
        q: "Kommer der flere funktioner?",
        a: "Ja. Favn360 videreudvikles løbende med flere værktøjer til dokumentation, samarbejde, økonomi, rapporter, kalender, klientstyring og praksisdrift."
      }
    ]
  },
  {
    title: "Sikkerhed og data",
    icon: ShieldCheck,
    questions: [
      {
        q: "Hvem kan se mine oplysninger?",
        a: "Oplysninger er knyttet til borgerens profil og relationer. Borgeren kan se egne oplysninger, og en tilknyttet partsrepræsentant kan se oplysninger, når der er en aktiv relation."
      },
      {
        q: "Er mine dokumenter og beskeder private?",
        a: "Ja. Dokumenter og beskeder er ikke offentlige. De er kun synlige for borgeren og relevante tilknyttede relationer."
      },
      {
        q: "Hvor opbevares data?",
        a: "Den konkrete produktionsregion og eventuelle overførsler skal fremgå af privatlivspolitikken. EU-region og dokumenterede overførselskontroller er et krav før produktionsdrift."
      },
      {
        q: "Kan jeg anmode om indsigt eller sletning?",
        a: "Ja. Du kan kontakte Favn360, hvis du ønsker indsigt, rettelse eller sletning af oplysninger, når det er relevant og muligt efter gældende regler."
      }
    ]
  },
  {
    title: "AI og analyser",
    icon: Brain,
    questions: [
      {
        q: "Bruger Favn360 AI?",
        a: "AI er slået fra som standard. Funktionen kan efter særskilt vurdering og et registreret valg anvendes til opsummeringer, struktur, analyser og overblik."
      },
      {
        q: "Træffer AI afgørelser?",
        a: "Nej. Favn360 træffer ikke automatiske afgørelser. AI-analyser er vejledende og må ikke stå alene."
      },
      {
        q: "Er AI en erstatning for faglig vurdering?",
        a: "Nej. AI er et hjælpeværktøj og erstatter ikke faglige, juridiske, sundhedsfaglige eller kommunale vurderinger."
      }
    ]
  },
  {
    title: "Dokumenter og beskeder",
    icon: MessageCircle,
    questions: [
      {
        q: "Kan jeg uploade dokumenter?",
        a: "Ja. Borgere og tilknyttede partsrepræsentanter kan uploade dokumenter til borgerens dokumentarkiv."
      },
      {
        q: "Hvilke dokumenter kan gemmes?",
        a: "Det kan eksempelvis være praktikpapirer, afgørelser, mødenotater, bilag, jobcenterdokumenter eller andre relevante dokumenter."
      },
      {
        q: "Kan borger og partsrepræsentant skrive sammen?",
        a: "Ja. Favn360 har et internt beskedsystem, hvor borger og tilknyttet partsrepræsentant kan kommunikere."
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              FAQ
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Spørgsmål og svar om Favn360
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Her finder du svar på de mest almindelige spørgsmål om
              Favn360, borgeradgang, partsrepræsentanter, data,
              sikkerhed, AI, dokumenter og priser.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:px-8">
          {sections.map((section) => (
            <FaqSection
              key={section.title}
              title={section.title}
              icon={section.icon}
              questions={section.questions}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white">
              <LockKeyhole className="h-4 w-4" />
              Mangler du svar?
            </div>

            <h2 className="mt-6 text-3xl font-semibold">
              Kontakt Favn360
            </h2>

            <p className="mt-5 leading-8 text-white/80">
              Har du spørgsmål om adgang, data, sikkerhed, oprettelse,
              partsrepræsentanter eller brugen af Favn360, kan du kontakte
              os direkte.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/kontakt"
                className="rounded bg-white px-5 py-3 font-semibold text-funktion-blue"
              >
                Gå til kontakt
              </Link>

              <Link
                href="/sikkerhed-og-data"
                className="rounded border border-white/30 px-5 py-3 font-semibold text-white"
              >
                Læs om sikkerhed og data
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-black/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-funktion-blue">Favn360</p>
            <p className="mt-1">Digital dagbog og funktionsdokumentation</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <Link href="/" className="hover:text-funktion-blue">
              Forside
            </Link>

            <Link href="/sikkerhed-og-data" className="hover:text-funktion-blue">
              Sikkerhed og data
            </Link>

            <Link href="/kontakt" className="hover:text-funktion-blue">
              Kontakt
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FaqSection({
  title,
  icon: Icon,
  questions
}: {
  title: string;
  icon: any;
  questions: { q: string; a: string }[];
}) {
  return (
    <section className="rounded border border-funktion-line bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded bg-funktion-blue/10">
          <Icon className="h-5 w-5 text-funktion-blue" />
        </div>

        <h2 className="text-2xl font-semibold text-funktion-blue">
          {title}
        </h2>
      </div>

      <div className="mt-6 grid gap-4">
        {questions.map((item) => (
          <details
            key={item.q}
            className="rounded border border-funktion-line bg-funktion-pale/20 p-5"
          >
            <summary className="cursor-pointer font-semibold text-funktion-blue">
              {item.q}
            </summary>

            <p className="mt-4 leading-7 text-black/70">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
