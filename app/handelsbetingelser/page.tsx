import Link from "next/link";

import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  FileText,
  Gavel,
  LockKeyhole,
  RefreshCcw,
  Scale,
  ShieldCheck
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function HandelsbetingelserPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Handelsbetingelser
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Vilkår for brug af Favn360
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Disse handelsbetingelser gælder for professionelle brugeres brug
              af Favn360, herunder partsrepræsentanter, rådgivere,
              støttepersoner, selvstændige socialrådgivere og øvrige
              professionelle brugere.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Favn360 er en privat digital platform og et digitalt
              værktøjssystem til dokumentation, struktur, samarbejde og
              understøttelse af sociale og beskæftigelsesrelaterede forløb.
            </p>
          </div>
        </div>
      </section>

      <LegalSection icon={BadgeCheck} title="§ 1. Generelt">
        <p>
          Disse handelsbetingelser regulerer forholdet mellem Favn360 ved
          Aksel Slot og den professionelle bruger af platformen.
        </p>

        <p className="mt-6">
          Ved oprettelse af konto, gratis prøveperiode eller anvendelse af
          Favn360 accepterer brugeren disse handelsbetingelser.
        </p>

        <p className="mt-6">
          Borgere kan anvende Favn360 uden betaling, mens professionelle
          brugere kan være omfattet af abonnement og betaling.
        </p>
      </LegalSection>

      <LegalSection icon={CreditCard} title="§ 2. Abonnement og betaling">
        <div className="grid gap-4">
          <InfoBox title="Gratis prøveperiode">
            Professionelle brugere kan tilbydes en gratis prøveperiode på 14
            dage.
          </InfoBox>

          <InfoBox title="Automatisk abonnement">
            Efter udløb af den gratis prøveperiode overgår kontoen automatisk
            til et betalingsabonnement, medmindre abonnementet opsiges inden
            prøveperiodens udløb.
          </InfoBox>

          <InfoBox title="Abonnementsperiode">
            Abonnementer tegnes som løbende månedlige abonnementer.
          </InfoBox>

          <InfoBox title="Binding">
            Der gælder 5 måneders binding fra abonnementets startdato.
          </InfoBox>

          <InfoBox title="Opsigelse">
            Efter udløbet af bindingsperioden kan abonnementet opsiges med 1
            måneds varsel til udgangen af en abonnementsperiode.
          </InfoBox>

          <InfoBox title="Pris">
            Favn360 forventes aktuelt at koste 200 kr. pr. måned for
            professionelle brugere.
          </InfoBox>

          <InfoBox title="Moms">
            Alle priser er angivet i danske kroner (DKK) og er inklusive moms,
            medmindre andet fremgår særskilt.
          </InfoBox>
        </div>

        <p className="mt-6">
          Favn360 forbeholder sig ret til at ændre priser, funktioner,
          abonnementstyper og betalingsstruktur med rimeligt varsel.
        </p>

        <p className="mt-6">
          Betalingsløsninger og betalingsudbydere kan ændres løbende.
        </p>
      </LegalSection>

      <LegalSection icon={RefreshCcw} title="§ 3. Platform og videreudvikling">
        <p>
          Favn360 videreudvikles løbende, og platformens funktioner,
          brugergrænseflader, integrationsmuligheder og tekniske løsninger kan
          ændres uden særskilt varsel.
        </p>

        <p className="mt-6">
          Favn360 kan tilføje, ændre eller fjerne funktioner, moduler,
          integrationer eller services som led i den almindelige udvikling af
          platformen.
        </p>

        <p className="mt-6">
          Favn360 garanterer ikke, at alle funktioner til enhver tid vil
          være tilgængelige eller uændrede.
        </p>
      </LegalSection>

      <LegalSection icon={ShieldCheck} title="§ 4. Adgang og brugeransvar">
        <p>
          Brugeren er ansvarlig for:
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">
            korrekt og lovlig anvendelse af platformen.
          </li>

          <li className="list-disc">
            at beskytte loginoplysninger og adgang til kontoen.
          </li>

          <li className="list-disc">
            at uploadede oplysninger og dokumenter er lovlige.
          </li>

          <li className="list-disc">
            at nødvendige samtykker og tilladelser foreligger.
          </li>

          <li className="list-disc">
            at oplysninger behandles ansvarligt og relevant.
          </li>
        </ul>

        <p className="mt-6">
          Brugeren må ikke anvende Favn360 til ulovlige aktiviteter,
          chikane, misbrug, forsøg på uautoriseret adgang, spredning af skadelig
          kode eller anden adfærd, der kan skade platformen eller andre
          brugere.
        </p>
      </LegalSection>

      <LegalSection icon={LockKeyhole} title="§ 5. Suspension og lukning">
        <p>
          Favn360 forbeholder sig ret til midlertidigt eller permanent at
          suspendere, begrænse eller lukke brugeradgang ved:
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">mistanke om misbrug.</li>

          <li className="list-disc">brud på handelsbetingelserne.</li>

          <li className="list-disc">ulovlig anvendelse.</li>

          <li className="list-disc">
            sikkerhedsmæssige eller tekniske hensyn.
          </li>

          <li className="list-disc">
            manglende betaling eller misligholdelse.
          </li>
        </ul>

        <p className="mt-6">
          Favn360 kan i alvorlige tilfælde lukke en konto uden varsel.
        </p>
      </LegalSection>

      <LegalSection icon={FileText} title="§ 6. Data og indhold">
        <p>
          Brugeren ejer som udgangspunkt egne data og eget indhold, som
          uploades eller registreres i Favn360.
        </p>

        <p className="mt-6">
          Brugeren giver Favn360 den nødvendige ret til at behandle,
          lagre, strukturere og vise oplysninger som led i drift og levering af
          platformens funktioner.
        </p>

        <p className="mt-6">
          Favn360 gør ikke krav på ejerskab over brugerens dokumenter,
          dagbogsregistreringer, beskeder eller øvrige indhold.
        </p>
      </LegalSection>

      <LegalSection icon={AlertTriangle} title="§ 7. Ansvarsbegrænsning">
        <p>
          Favn360 stilles til rådighed som et digitalt værktøj og en privat
          platform til dokumentation, struktur og samarbejde.
        </p>

        <p className="mt-6">
          Favn360 er ikke en offentlig myndighed og deltager ikke i
          myndighedsudøvelse eller offentlige afgørelser.
        </p>

        <p className="mt-6">
          Favn360 yder ikke juridisk rådgivning, sundhedsfaglig behandling,
          socialfaglig myndighedsbehandling eller garanti for konkrete
          resultater i kommunale, sociale eller beskæftigelsesrelaterede
          forløb.
        </p>

        <p className="mt-6">
          Favn360 kan ikke holdes ansvarlig for:
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">
            brugerens anvendelse af platformen.
          </li>

          <li className="list-disc">
            kommunale afgørelser eller sagsforløb.
          </li>

          <li className="list-disc">
            tab af data, driftstab eller indirekte tab.
          </li>

          <li className="list-disc">
            fejl, afbrydelser eller utilgængelighed.
          </li>

          <li className="list-disc">
            brugerens egne uploads eller registreringer.
          </li>
        </ul>

        <p className="mt-6">
          Favn360 bestræber sig på stabil drift, men garanterer ikke
          uafbrudt adgang eller fejlfri funktionalitet.
        </p>
      </LegalSection>

      <LegalSection icon={ShieldCheck} title="§ 8. AI-funktioner">
        <p>
          Favn360 kan anvende AI-baserede funktioner til analyse,
          strukturering, opsummering og overblik.
        </p>

        <p className="mt-6">
          AI-funktioner er vejledende hjælpeværktøjer og kan tage fejl.
        </p>

        <p className="mt-6">
          AI erstatter ikke juridisk rådgivning, sundhedsfaglig vurdering,
          socialfaglig vurdering eller professionel rådgivning.
        </p>

        <p className="mt-6">
          Brugeren er selv ansvarlig for vurdering og anvendelse af AI-genereret
          indhold.
        </p>
      </LegalSection>

      <LegalSection icon={Scale} title="§ 9. Immaterielle rettigheder">
        <p>
          Favn360, herunder design, struktur, kode, platform,
          brugergrænseflader, logoer og tekniske løsninger tilhører
          Favn360 eller relevante rettighedshavere.
        </p>

        <p className="mt-6">
          Brugeren opnår alene en begrænset, ikke-eksklusiv og ikke-overdragelig
          brugsret til platformen som led i abonnementet.
        </p>

        <p className="mt-6">
          Kopiering, videresalg, reverse engineering eller uautoriseret brug af
          platformen er ikke tilladt.
        </p>
      </LegalSection>

      <LegalSection icon={Gavel} title="§ 10. Drift, vedligeholdelse og force majeure">
        <p>
          Favn360 kan midlertidigt være utilgængelig som følge af
          vedligeholdelse, opdateringer, tekniske problemer eller forhold uden
          for Favn360s kontrol.
        </p>

        <p className="mt-6">
          Favn360 er ikke ansvarlig for manglende adgang eller forsinkelser
          som følge af force majeure, herunder eksempelvis:
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">internetnedbrud.</li>

          <li className="list-disc">strømsvigt.</li>

          <li className="list-disc">cyberangreb.</li>

          <li className="list-disc">naturkatastrofer.</li>

          <li className="list-disc">myndighedsindgreb.</li>

          <li className="list-disc">leverandørfejl.</li>
        </ul>
      </LegalSection>

      <LegalSection icon={Scale} title="§ 11. Lovvalg og værneting">
        <p>
          Disse handelsbetingelser er underlagt dansk ret.
        </p>

        <p className="mt-6">
          Eventuelle tvister skal afgøres ved de danske domstole.
        </p>
      </LegalSection>

      <section>
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Kontakt Favn360
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-black/70">
              Har du spørgsmål til handelsbetingelserne eller brugen af
              Favn360, kan du kontakte os.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="mailto:kontakt@favn360.dk"
                className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Kontakt Favn360
              </Link>

              <Link
                href="/privatlivspolitik"
                className="rounded border border-funktion-line bg-white px-5 py-3 font-semibold"
              >
                Privatlivspolitik
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function LegalSection({
  icon: Icon,
  title,
  children
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-funktion-line bg-white p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-funktion-blue/10">
              <Icon className="h-6 w-6 text-funktion-blue" />
            </div>

            <div className="max-w-4xl">
              <h2 className="text-2xl font-semibold text-funktion-blue">
                {title}
              </h2>

              <div className="mt-5 leading-8 text-black/70">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBox({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-funktion-line bg-funktion-pale/20 p-5">
      <h3 className="font-semibold text-funktion-blue">{title}</h3>

      <p className="mt-3 leading-7 text-black/70">
        {children}
      </p>
    </div>
  );
}