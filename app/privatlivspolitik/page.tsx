import Link from "next/link";

import {
  Brain,
  Database,
  FileText,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function PrivatlivspolitikPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Privatlivspolitik
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Behandling af personoplysninger i Favn360
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Denne privatlivspolitik beskriver, hvordan Favn360 behandler
              personoplysninger om borgere, brugere, partsrepræsentanter,
              kontaktpersoner og øvrige registrerede.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Favn360 behandler oplysninger med høj alvor, da platformen kan
              indeholde oplysninger om funktionsevne, sociale forhold,
              beskæftigelsesforhold, praktikforløb, trivsel, dokumenter,
              beskeder og dagbogsregistreringer.
            </p>
          </div>
        </div>
      </section>

      <LegalSection
        icon={UserCheck}
        title="1. Dataansvarlig"
      >
        <p>
          Favn360 ved Aksel Slot er dataansvarlig for egne henvendelser,
          hjemmeside- og kontoadministration. For oplysninger i et konkret
          borger- eller kundeforløb afhænger rollen af aftalen og formålet:
          Favn360 kan være dataansvarlig, fælles dataansvarlig eller
          databehandler. Rollen og instruksen skal være dokumenteret, før
          behandlingen begynder.
        </p>

        <div className="mt-6 rounded border border-funktion-line bg-funktion-pale/30 p-5">
          <p className="font-semibold text-funktion-blue">Aksel Slot</p>
          <p className="mt-2 text-black/70">Sankt Peders Gade 1</p>
          <p className="text-black/70">9400 Nørresundby</p>
          <p className="mt-2 text-black/70">
            E-mail:{" "}
            <Link
              href="mailto:kontakt@favn360.dk"
              className="text-funktion-blue underline"
            >
              kontakt@favn360.dk
            </Link>
          </p>
          <p className="text-black/70">Telefon: +45 20 65 29 05</p>
        </div>

        <p className="mt-6">
          Behovet for en databeskyttelsesrådgiver (DPO) vurderes og
          dokumenteres før produktionsdrift og ved væsentlige ændringer.
          Spørgsmål om behandling af personoplysninger kan rettes til
          ovenstående kontaktoplysninger.
        </p>
      </LegalSection>

      <LegalSection
        icon={FileText}
        title="2. Behandlingsaktiviteter"
      >
        <p>
          Favn360 behandler personoplysninger i forbindelse med drift af
          platformen, brugeroprettelse, kommunikation, dokumentation,
          beskedsystem, dagbogsregistreringer, partsrepræsentantrelationer,
          dokumentarkiv og øvrige funktioner i systemet.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Besøg på hjemmeside">
            Ved besøg på hjemmesiden kan der behandles tekniske oplysninger og
            cookies, der er nødvendige for hjemmesidens funktion. Du kan læse
            mere i vores cookiepolitik.
          </InfoBox>

          <InfoBox title="Kommunikation med potentielle brugere og samarbejdspartnere">
            Når du kontakter Favn360 via e-mail, kontaktformular eller
            telefon, behandler vi de oplysninger, du selv giver os, eksempelvis
            navn, e-mailadresse, telefonnummer og indholdet af henvendelsen.
            Behandlingsgrundlaget er databeskyttelsesforordningens artikel 6,
            stk. 1, litra f.
          </InfoBox>

          <InfoBox title="Brugeroprettelse og platformskonto">
            Ved oprettelse af en brugerprofil behandles oplysninger som navn,
            e-mailadresse, rolle, loginoplysninger, brugerrelationer og
            nødvendige tekniske oplysninger. Behandlingen sker for at kunne
            levere adgang til Favn360.
          </InfoBox>

          <InfoBox title="Borgere og forløbsdokumentation">
            Borgere kan registrere oplysninger om funktionsevne,
            hverdagsfunktion, praktikforløb, fremmøde, belastning, trivsel,
            søvn, smerter, pauser, opgaver, refleksioner og øvrige relevante
            forhold.
          </InfoBox>

          <InfoBox title="Partsrepræsentanter">
            Partsrepræsentanter kan oprette profil, anmode om godkendelse,
            modtage borgerrelationer, skrive journalnoter, sende beskeder og
            behandle oplysninger om tilknyttede borgere.
          </InfoBox>

          <InfoBox title="Dokumenter og bilag">
            Favn360 kan behandle uploadede dokumenter, herunder
            praktikpapirer, afgørelser, jobcenterdokumenter, bilag,
            mødedokumenter og andre relevante dokumenter.
          </InfoBox>

          <InfoBox title="Beskeder">
            Platformen indeholder et internt beskedsystem mellem borger og
            tilknyttet partsrepræsentant. Beskeder kan indeholde personlige og
            forløbsrelaterede oplysninger.
          </InfoBox>

          <InfoBox title="AI-funktioner">
            Favn360 kan anvende AI-baserede funktioner til analyse,
            strukturering, opsummering og overblik. AI anvendes som
            hjælpeværktøj og træffer ikke afgørelser.
          </InfoBox>
        </div>
      </LegalSection>

      <LegalSection
        icon={Database}
        title="3. Typer af personoplysninger"
      >
        <p>
          Favn360 kan behandle både almindelige personoplysninger og
          oplysninger, der efter deres karakter kan være følsomme eller særligt
          beskyttelsesværdige.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <InfoBox title="Almindelige oplysninger">
            Navn, e-mail, telefonnummer, adresse, rolle, bruger-id,
            kontaktoplysninger, betalingsoplysninger, profiloplysninger og
            tekniske oplysninger.
          </InfoBox>

          <InfoBox title="Forløbsoplysninger">
            Praktiksted, praktikperiode, fremmøde, fravær, opgaver,
            arbejdstid, pauser, funktionsniveau, progression og
            dokumentation.
          </InfoBox>

          <InfoBox title="Følsomme eller særligt beskyttelsesværdige oplysninger">
            Oplysninger om funktionsevne, helbredsrelaterede forhold,
            trivsel, sociale forhold, belastning, smerter,
            beskæftigelsessituation og dagbogsregistreringer.
          </InfoBox>

          <InfoBox title="Kommunikation og dokumenter">
            Beskeder, journalnoter, uploads, bilag, sagsrelaterede dokumenter
            og øvrigt materiale, som brugeren selv uploader eller skriver.
          </InfoBox>
        </div>
      </LegalSection>

      <LegalSection
        icon={Scale}
        title="4. Behandlingsgrundlag"
      >
        <p>
          Favn360 behandler personoplysninger på baggrund af relevante
          behandlingsgrundlag i databeskyttelsesforordningen.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Artikel 6, stk. 1, litra b — aftale">
            Behandling kan ske, når det er nødvendigt for at levere adgang til
            Favn360 og de funktioner, brugeren har oprettet sig til.
          </InfoBox>

          <InfoBox title="Artikel 6, stk. 1, litra f — legitim interesse">
            Behandling kan ske for at besvare henvendelser, administrere
            brugerrelationer, sikre drift, forbedre platformen og forebygge
            misbrug.
          </InfoBox>

          <InfoBox title="Artikel 6, stk. 1, litra c — retlig forpligtelse">
            Behandling kan ske, når det er nødvendigt for at overholde
            lovgivning, eksempelvis bogføringsregler.
          </InfoBox>

          <InfoBox title="Artikel 6, stk. 1, litra a — samtykke">
            Behandling kan ske på baggrund af samtykke, eksempelvis ved
            tilmelding til nyhedsbrev eller andre frivillige funktioner.
          </InfoBox>

          <InfoBox title="Artikel 9">
            Følsomme oplysninger behandles kun, når et konkret og dokumenteret
            grundlag efter artikel 9 finder anvendelse. Grundlaget fastlægges
            særskilt for den enkelte behandlingsaktivitet og dataansvarlige.
          </InfoBox>
        </div>
      </LegalSection>

      <LegalSection
        icon={LockKeyhole}
        title="5. Adgangsstyring og relationer"
      >
        <p>
          Favn360 anvender rollebaseret og relationel adgangsstyring.
          Det betyder, at adgang til en borgers oplysninger afhænger af
          brugerens rolle og relation til borgeren.
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">
            Borgeren kan se egne oplysninger og registreringer.
          </li>
          <li className="list-disc">
            En partsrepræsentant kan kun få adgang til en borger, når der er
            en aktiv tilknytning.
          </li>
          <li className="list-disc">
            Dokumenter og beskeder er private og ikke offentligt tilgængelige.
          </li>
          <li className="list-disc">
            Offentlige partsrepræsentantprofiler kræver godkendelse.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        icon={Brain}
        title="6. AI, profilering og automatiserede afgørelser"
      >
        <p>
          Favn360 kan anvende AI-baserede funktioner til at skabe
          struktur, opsummeringer, analyser og overblik over registreringer.
        </p>

        <p className="mt-6">
          AI-analyser er vejledende og kan tage fejl. AI erstatter ikke
          juridisk rådgivning, sundhedsfaglig vurdering, socialfaglig
          vurdering eller kommunal afgørelse.
        </p>

        <p className="mt-6">
          Favn360 foretager ikke automatiserede afgørelser om borgere.
          Favn360 anvender ikke AI til at træffe myndighedsafgørelser.
        </p>
      </LegalSection>

      <LegalSection
        icon={ShieldCheck}
        title="7. Databehandlere og leverandører"
      >
        <p>
          Favn360 anvender eksterne leverandører og databehandlere til
          drift, hosting, database, lagring, kunstig intelligens og teknisk
          infrastruktur.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Supabase">
            Anvendes til database, autentifikation, lagring og teknisk
            infrastruktur. Projektregion, databehandleraftale og eventuelle
            overførsler kontrolleres før produktionsdrift.
          </InfoBox>

          <InfoBox title="Hostingudbyder">
            Anvendes til hosting og drift af webapplikationen. Den aktuelle
            udbyder og behandlingsregion fremgår af leverandørfortegnelsen.
          </InfoBox>

          <InfoBox title="OpenAI">
            Anvendes til AI-baserede funktioner, herunder analyse,
            strukturering og opsummering. Favn360 anvender OpenAI API til
            disse funktioner, når funktionen er aktiveret og det relevante
            behandlingsgrundlag, samtykke og leverandørkontroller foreligger.
          </InfoBox>
        </div>

        <p className="mt-6">
          Favn360 indgår relevante aftaler med databehandlere, hvor dette
          er nødvendigt, og stiller krav om passende beskyttelse af
          personoplysninger.
        </p>
      </LegalSection>

      <LegalSection
        icon={Database}
        title="8. Opbevaring, sletning og bogføring"
      >
        <p>
          Personoplysninger opbevares, så længe det er nødvendigt til de
          formål, oplysningerne er indsamlet til, eller så længe der foreligger
          et andet lovligt grundlag for opbevaring.
        </p>

        <p className="mt-6">
          Brugere kan anmode om sletning af oplysninger. Sletning kan dog være
          begrænset, hvis oplysninger skal opbevares som følge af lovgivning,
          dokumentationshensyn, retskrav eller bogføringsregler.
        </p>

        <p className="mt-6">
          Regnskabsbilag og fakturaoplysninger opbevares i overensstemmelse
          med bogføringsloven, som udgangspunkt i 5 år efter udløbet af det
          relevante regnskabsår.
        </p>
      </LegalSection>

      <LegalSection
        icon={Mail}
        title="9. Nyhedsbrev og kommunikation"
      >
        <p>
          Hvis Favn360 tilbyder nyhedsbrev, er tilmelding frivillig og
          baseret på samtykke. Du kan til enhver tid framelde dig igen.
        </p>

        <p className="mt-6">
          Ved tilmelding til nyhedsbrev behandles typisk e-mailadresse og
          eventuelt navn. Behandlingsgrundlaget er
          databeskyttelsesforordningens artikel 6, stk. 1, litra a.
        </p>

        <p className="mt-6">
          Ved almindelig kommunikation behandles de oplysninger, du selv giver
          os, for at vi kan besvare din henvendelse.
        </p>
      </LegalSection>

      <LegalSection
        icon={ShieldCheck}
        title="10. Behandlingssikkerhed"
      >
        <p>
          Favn360 anvender tekniske og organisatoriske foranstaltninger
          med henblik på at beskytte personoplysninger mod uautoriseret
          adgang, tab, ændring, misbrug eller offentliggørelse.
        </p>

        <ul className="mt-6 grid gap-3 pl-6 leading-8 text-black/70">
          <li className="list-disc">Loginbeskyttelse og brugeradgang.</li>
          <li className="list-disc">Rollebaseret adgangsstyring.</li>
          <li className="list-disc">Relationel adgang mellem borger og partsrepræsentant.</li>
          <li className="list-disc">Private dokumenter og beskeder.</li>
          <li className="list-disc">Løbende videreudvikling af sikkerhedsforanstaltninger.</li>
        </ul>
      </LegalSection>

      <LegalSection
        icon={FileText}
        title="11. Dine rettigheder"
      >
        <p>
          Du har efter databeskyttelsesforordningen en række rettigheder i
          forhold til Favn360s behandling af oplysninger om dig.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Ret til indsigt">
            Du har ret til at få indsigt i de oplysninger, vi behandler om dig.
          </InfoBox>

          <InfoBox title="Ret til berigtigelse">
            Du har ret til at få urigtige oplysninger om dig rettet.
          </InfoBox>

          <InfoBox title="Ret til sletning">
            Du har i særlige tilfælde ret til at få slettet oplysninger om dig.
          </InfoBox>

          <InfoBox title="Ret til begrænsning">
            Du har i visse tilfælde ret til at få behandlingen af dine
            oplysninger begrænset.
          </InfoBox>

          <InfoBox title="Ret til indsigelse">
            Du har i visse tilfælde ret til at gøre indsigelse mod vores
            behandling af dine oplysninger.
          </InfoBox>

          <InfoBox title="Ret til dataportabilitet">
            Du har i visse tilfælde ret til at modtage dine oplysninger i et
            struktureret, almindeligt anvendt og maskinlæsbart format.
          </InfoBox>
        </div>

        <p className="mt-6">
          Hvis behandlingen er baseret på samtykke, har du ret til at trække
          dit samtykke tilbage.
        </p>
      </LegalSection>

      <LegalSection
        icon={Scale}
        title="12. Klage til Datatilsynet"
      >
        <p>
          Du har ret til at indgive en klage til Datatilsynet, hvis du er
          utilfreds med den måde, Favn360 behandler dine
          personoplysninger på.
        </p>

        <p className="mt-6">
          Du finder Datatilsynets kontaktoplysninger på{" "}
          <Link
            href="https://www.datatilsynet.dk"
            className="text-funktion-blue underline"
          >
            www.datatilsynet.dk
          </Link>
          .
        </p>
      </LegalSection>

      <section>
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Kontakt om personoplysninger
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-black/70">
              Hvis du ønsker indsigt, rettelse, sletning, begrænsning,
              dataportabilitet eller har spørgsmål til behandlingen af dine
              personoplysninger, kan du kontakte Favn360.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="mailto:kontakt@favn360.dk"
                className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Kontakt Favn360
              </Link>

              <Link
                href="/sikkerhed-og-data"
                className="rounded border border-funktion-line bg-white px-5 py-3 font-semibold"
              >
                Sikkerhed og data
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
      <p className="mt-3 leading-7 text-black/70">{children}</p>
    </div>
  );
}
