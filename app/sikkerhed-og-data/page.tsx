import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  Brain,
  Database,
  Eye,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
  Users
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";

export default function SikkerhedOgDataPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <section className="border-b border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              Sikkerhed og data
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight text-funktion-blue">
              Tryghed, fortrolighed og kontrol over oplysninger
            </h1>

            <p className="mt-8 text-lg leading-8 text-black/70">
              Favn360 behandler oplysninger om borgere, dokumentation,
              beskeder og forløb med høj alvor. Platformen er bygget med fokus
              på adgangskontrol, dataminimering og tydelige relationer mellem
              borger og partsrepræsentant.
            </p>

            <p className="mt-6 text-lg leading-8 text-black/70">
              Rollen som dataansvarlig eller databehandler fastlægges for den
              konkrete løsning og aftale. Produktionsdata placeres i en
              dokumenteret EU-region som et releasekrav.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <TrustCard
              icon={ShieldCheck}
              title="Rollebaseret adgang"
              text="Adgang styres efter brugerrolle og relation til borgeren."
            />

            <TrustCard
              icon={UserCheck}
              title="Borgerens relationer"
              text="Partsrepræsentanter får kun adgang via en tilknytning til borgeren."
            />

            <TrustCard
              icon={Database}
              title="EU-datacentre"
              text="Produktionsregion og eventuelle overførsler dokumenteres og kontrolleres før drift."
            />

            <TrustCard
              icon={LockKeyhole}
              title="Loginbeskyttelse"
              text="Adgang til platformen kræver login og kontrolleret brugeradgang."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Hvem kan se mine oplysninger?
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Oplysninger i Favn360 er ikke offentlige. De er knyttet til
                borgerens brugerprofil og de relationer, borgeren indgår i.
              </p>

              <p>
                En partsrepræsentant kan kun få adgang til en borgers data, når
                der er oprettet en aktiv tilknytning mellem borgeren og
                partsrepræsentanten.
              </p>

              <p>
                Adgangen omfatter kun de oplysninger, dokumenter, beskeder,
                registreringer og noter, der er relevante for borgerens forløb
                i Favn360.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <InfoItem text="Borgeren kan se egne oplysninger og registreringer." />
            <InfoItem text="Tilknyttet partsrepræsentant kan se borgerens relevante forløbsdata." />
            <InfoItem text="Dokumenter og beskeder er private og ikke offentligt tilgængelige." />
            <InfoItem text="Adgang bygger på aktiv relation og rollebaseret adgangsstyring." />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded border border-funktion-line bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded bg-funktion-blue/10 px-3 py-1 text-sm font-semibold text-funktion-blue">
              <FileText className="h-4 w-4" />
              GDPR og dataminimering
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
              Kun relevante oplysninger bør registreres
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 arbejder med principperne i
                databeskyttelsesforordningen, herunder dataminimering,
                gennemsigtighed og formålsbegrænsning.
              </p>

              <p>
                Det betyder, at brugere kun bør registrere oplysninger, der er
                relevante for dokumentation, funktionsevne, praktik, samarbejde
                eller det konkrete forløb.
              </p>

              <p>
                Borgeren bestemmer selv, hvilke oplysninger der indtastes i
                dagbogsregistreringer, dokumenter og beskeder.
              </p>
            </div>
          </div>

          <div className="rounded border border-funktion-line bg-white p-8">
            <div className="inline-flex items-center gap-2 rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              <Eye className="h-4 w-4" />
              Indsigt og sletning
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
              Ret til indsigt og anmodning om sletning
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Brugere skal kunne få indsigt i de oplysninger, der er
                registreret om dem i Favn360.
              </p>

              <p>
                Borgeren kan anmode om sletning af oplysninger, når det er
                relevant og muligt efter gældende regler.
              </p>

              <p>
                Spørgsmål om indsigt, rettelse eller sletning kan rettes til
                Favn360 via kontaktoplysningerne nederst på siden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-pale/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
              <Brain className="h-4 w-4" />
              AI i Favn360
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-funktion-blue">
              AI bruges som støtteværktøj — ikke som afgørelsesværktøj
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 kan anvende AI til at skabe overblik,
                opsummeringer, analyser og struktur i registreringer.
              </p>

              <p>
                AI-analyser er vejledende og kan tage fejl. De må ikke stå
                alene og erstatter ikke faglige, juridiske, sundhedsfaglige
                eller kommunale vurderinger.
              </p>

              <p>
                Favn360 træffer ikke automatiske afgørelser om borgere.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <InfoItem text="AI kan hjælpe med opsummering og overblik." />
            <InfoItem text="AI erstatter ikke faglig vurdering." />
            <InfoItem text="AI må ikke bruges som eneste grundlag for beslutninger." />
            <InfoItem text="Der træffes ikke automatiske kommunale afgørelser i Favn360." />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Følsomme oplysninger kræver særlig omtanke
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 kan indeholde oplysninger om funktionsevne,
                trivsel, praktik, helbredslignende forhold, sociale forhold,
                dokumenter og kommunikation.
              </p>

              <p>
                Derfor skal brugere være opmærksomme på, hvad der registreres,
                og kun indtaste oplysninger, som er relevante for formålet.
              </p>

              <p>
                Platformen er udviklet med respekt for, at mange brugere kan
                befinde sig i en sårbar eller presset situation.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Sikkerhed udvikles løbende
            </h2>

            <div className="mt-6 space-y-6 leading-8 text-black/70">
              <p>
                Favn360 er under løbende udvikling. Det gælder både
                funktioner, brugeroplevelse og sikkerhedsforanstaltninger.
              </p>

              <p>
                Platformen arbejder løbende med forbedringer af adgangsstyring,
                databeskyttelse, loginbeskyttelse og teknisk stabilitet.
              </p>

              <p>
                Nye funktioner vurderes med fokus på datasikkerhed,
                brugerbeskyttelse og tydelig adgangskontrol.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-funktion-line bg-funktion-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold">
            Vigtige begrænsninger
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <DisclaimerItem text="Favn360 er ikke en offentlig myndighed." />
            <DisclaimerItem text="Favn360 erstatter ikke juridisk rådgivning." />
            <DisclaimerItem text="Favn360 erstatter ikke sundhedsfaglig behandling eller vurdering." />
            <DisclaimerItem text="Favn360 træffer ikke kommunale afgørelser." />
            <DisclaimerItem text="AI-analyser er vejledende og skal vurderes kritisk." />
            <DisclaimerItem text="Platformen er et støtte- og dokumentationsværktøj." />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded border border-funktion-line bg-funktion-pale/40 p-8">
            <h2 className="text-3xl font-semibold text-funktion-blue">
              Spørgsmål om sikkerhed eller data?
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-black/70">
              Har du spørgsmål om data, adgang, sletning, indsigt eller
              sikkerhed i Favn360, kan du kontakte os.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="mailto:kontakt@favn360.dk"
                className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
              >
                Kontakt om data
              </Link>

              <Link
                href="/kontakt"
                className="rounded border border-funktion-line bg-white px-5 py-3 font-semibold"
              >
                Gå til kontakt
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function TrustCard({
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

      <h2 className="mt-4 text-lg font-semibold text-funktion-blue">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-black/70">
        {text}
      </p>
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

function DisclaimerItem({ text }: { text: string }) {
  return (
    <div className="rounded border border-white/20 bg-white/10 px-5 py-4">
      <p className="font-medium text-white/90">{text}</p>
    </div>
  );
}
