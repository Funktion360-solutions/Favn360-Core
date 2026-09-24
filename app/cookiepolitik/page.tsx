import Link from "next/link";

import {
  Cookie,
  Database,
  Globe,
  LockKeyhole,
  Settings,
  ShieldCheck
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function CookiepolitikPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Cookiepolitik
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Cookies og lignende teknologier i Favn360
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Denne cookiepolitik beskriver, hvordan Favn360 anvender
              cookies og lignende teknologier på hjemmesiden og i platformen.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Favn360 anvender på nuværende tidspunkt kun nødvendige
              cookies, herunder cookies til login, session, sikkerhed og
              teknisk funktionalitet.
            </p>
          </div>
        </div>
      </section>

      <LegalSection icon={Cookie} title="1. Hvad er cookies?">
        <p>
          Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en
          hjemmeside eller anvender en digital tjeneste. Cookies kan blandt
          andet anvendes til at få en hjemmeside til at fungere, huske
          loginstatus, sikre teknisk drift og understøtte brugerens session.
        </p>

        <p className="mt-6">
          Lignende teknologier kan omfatte lokal lagring, session storage,
          pixels, scripts og andre tekniske mekanismer, der bruges til at få
          digitale tjenester til at fungere korrekt.
        </p>
      </LegalSection>

      <LegalSection icon={LockKeyhole} title="2. Nødvendige cookies">
        <p>
          Favn360 anvender nødvendige cookies og tilsvarende teknologier,
          som er nødvendige for, at hjemmesiden og platformen kan fungere
          teknisk og sikkert.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Login og session">
            Cookies kan anvendes til at holde brugeren logget ind og sikre, at
            brugeren får adgang til de korrekte dele af platformen.
          </InfoBox>

          <InfoBox title="Sikkerhed">
            Cookies kan anvendes til at beskytte platformen mod misbrug,
            understøtte autentifikation og sikre korrekt adgangskontrol.
          </InfoBox>

          <InfoBox title="Teknisk funktionalitet">
            Cookies kan anvendes til at sikre, at centrale funktioner på siden
            virker korrekt, eksempelvis navigation, sessionsstyring og
            brugeradgang.
          </InfoBox>
        </div>

        <p className="mt-6">
          Nødvendige cookies kan som udgangspunkt anvendes uden samtykke, når
          de er nødvendige for at levere den tjeneste, brugeren udtrykkeligt
          har anmodet om.
        </p>
      </LegalSection>

      <LegalSection icon={Database} title="3. Login, Supabase og sessioner">
        <p>
          Favn360 anvender Supabase til blandt andet brugerlogin,
          autentifikation, database og teknisk adgangsstyring.
        </p>

        <p className="mt-6">
          I den forbindelse kan der anvendes cookies eller tilsvarende tekniske
          mekanismer til at håndtere brugerens session, adgang og loginstatus.
        </p>

        <p className="mt-6">
          Disse cookies anvendes ikke til markedsføring, tracking eller
          annoncering, men til nødvendig drift og sikker adgang til platformen.
        </p>
      </LegalSection>

      <LegalSection icon={ShieldCheck} title="4. Cookiekategorier">
        <p>
          Favn360 arbejder med følgende cookie- og teknologikategorier:
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Nødvendige cookies">
            Anvendes til login, session, sikkerhed, adgangsstyring og teknisk
            drift. Disse cookies er nødvendige for, at platformen kan fungere.
          </InfoBox>

          <InfoBox title="Præferencecookies">
            Kan anvendes til at huske brugerens valg, indstillinger eller
            præferencer. Favn360 anvender ikke nødvendigvis denne kategori
            aktuelt.
          </InfoBox>

          <InfoBox title="Statistikcookies">
            Kan anvendes til at forstå brugen af hjemmesiden og forbedre
            brugeroplevelsen. Favn360 anvender ikke analytics eller
            statistikcookies på nuværende tidspunkt.
          </InfoBox>

          <InfoBox title="Marketingcookies">
            Kan anvendes til annoncering, tracking eller målrettet
            markedsføring. Favn360 anvender ikke marketingcookies på
            nuværende tidspunkt.
          </InfoBox>
        </div>
      </LegalSection>

      <LegalSection icon={Globe} title="5. Tredjepartstjenester">
        <p>
          Favn360 kan anvende tredjepartsleverandører til drift,
          autentifikation, hosting, database, lagring og teknisk
          infrastruktur.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Supabase">
            Kan anvende nødvendige tekniske mekanismer i forbindelse med
            login, session, adgangsstyring og drift.
          </InfoBox>

          <InfoBox title="Hostingudbyder">
            Anvendes til hosting og drift af webapplikationen. Der kan behandles
            tekniske oplysninger i forbindelse med drift og sikkerhed.
          </InfoBox>

          <InfoBox title="OpenAI">
            Anvendes til AI-funktioner i platformen. OpenAI anvendes ikke som
            cookietjeneste på hjemmesiden, men er nævnt her som relevant
            tredjepartsleverandør i Favn360s samlede tekniske setup.
          </InfoBox>
        </div>
      </LegalSection>

      <LegalSection icon={Settings} title="6. Samtykke og cookiebanner">
        <p>
          Favn360 ønsker at implementere et cookiebanner, så brugere kan få
          tydelig information om cookies og træffe valg om ikke-nødvendige
          cookies, hvis sådanne cookies indføres.
        </p>

        <p className="mt-6">
          På nuværende tidspunkt anvendes der ikke analytics, marketingcookies
          eller trackingcookies. Hvis Favn360 senere implementerer sådanne
          teknologier, vil der blive arbejdet med samtykkestyring, eksempelvis
          gennem en professionel consent management-løsning.
        </p>

        <p className="mt-6">
          Favn360 kan løbende implementere nye funktioner og tjenester, som
          kan anvende cookies eller lignende teknologier. Cookiepolitikken vil i
          så fald blive opdateret.
        </p>
      </LegalSection>

      <LegalSection icon={Settings} title="7. Sådan sletter eller blokerer du cookies">
        <p>
          Du kan til enhver tid slette eller blokere cookies i din browser.
          Fremgangsmåden afhænger af, hvilken browser du anvender.
        </p>

        <p className="mt-6">
          Hvis du blokerer nødvendige cookies, kan det betyde, at Favn360
          ikke fungerer korrekt, eller at du ikke kan logge ind på platformen.
        </p>

        <div className="mt-8 grid gap-4">
          <InfoBox title="Browserindstillinger">
            Du kan typisk finde indstillinger for cookies under privatlivs-,
            sikkerheds- eller webstedsindstillinger i din browser.
          </InfoBox>

          <InfoBox title="Nødvendige cookies">
            Hvis nødvendige cookies blokeres, kan login, sessionsstyring og
            adgang til platformens funktioner blive påvirket.
          </InfoBox>
        </div>
      </LegalSection>

      <section>
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Spørgsmål om cookies?
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-black/70">
              Har du spørgsmål til Favn360s brug af cookies eller lignende
              teknologier, kan du kontakte os.
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
                Læs privatlivspolitik
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
