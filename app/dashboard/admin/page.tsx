import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { PdfExportModal } from "@/components/PdfExportModal";
import { PdfVersionHistory } from "@/components/PdfVersionHistory";
import { AiAnalysisPanel } from "@/components/AiAnalysisPanel";
import { demoNotes } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth";
import { fetchCitizensForAdmin, fetchDiaryEntriesForCitizen } from "@/lib/diary-data";
import { fetchPdfExportsForCitizen } from "@/lib/pdf-export-data";
import { fetchAnalysesForCitizen } from "@/lib/ai-analysis-data";
import type { Citizen, DiaryEntry } from "@/types/database";

type AdminDashboardPageProps = {
  searchParams?: Promise<{
    citizenId?: string;
  }>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const user = await requireUser("administrator");
  const params = await searchParams;
  const selectedCitizenId = params?.citizenId ?? null;
  const { data: citizens, warning: citizensWarning } = await fetchCitizensForAdmin();
  const selectedCitizen = citizens.find((citizen) => citizen.id === selectedCitizenId) ?? null;
  const { data: diaryEntries, warning: diaryWarning } = selectedCitizen
    ? await fetchDiaryEntriesForCitizen(selectedCitizen.id)
    : { data: [] as DiaryEntry[], warning: null };
  const { data: pdfExports, warning: pdfWarning } = await fetchPdfExportsForCitizen(selectedCitizen?.id ?? null);
  const { data: analyses, warning: analysisWarning } = await fetchAnalysesForCitizen(selectedCitizen?.id ?? null);

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-funktion-blue">Administratordashboard</h1>
            <p className="mt-2 max-w-3xl leading-7 text-black/70">
              Administrator kan vælge en borger og se registreringer uden at ændre borgerens egne dagbogsindtastninger.
            </p>
          </div>
          <PdfExportModal citizenId={selectedCitizen?.id} citizenName={selectedCitizen?.citizen_name} disabled={!selectedCitizen} allowAdminNotes />
        </div>

        {citizensWarning ? <WarningMessage message={citizensWarning} /> : null}
        {diaryWarning ? <WarningMessage message={diaryWarning} /> : null}
        {pdfWarning ? <WarningMessage message={pdfWarning} /> : null}
        {analysisWarning ? <WarningMessage message={analysisWarning} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Section title="Vælg borger">
            {citizens.length > 0 ? (
              <div className="grid gap-3">
                {citizens.map((citizen) => (
                  <CitizenLink key={citizen.id} citizen={citizen} selected={citizen.id === selectedCitizen?.id} />
                ))}
              </div>
            ) : (
              <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
                Der er endnu ikke oprettet borgere.
              </p>
            )}
          </Section>

          <Section title="Administratornote">
            {selectedCitizen ? (
              <>
                <form className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="font-medium">Note til valgt dag</span>
                    <textarea
                      rows={7}
                      className="focus-ring rounded border border-funktion-line px-4 py-3 leading-7"
                      placeholder="Tilføj neutral, dokumentationsorienteret administratornote"
                    />
                  </label>
                  <button className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
                    <MessageSquarePlus className="h-5 w-5" />
                    Gem administratornote
                  </button>
                </form>
                <div className="mt-5 grid gap-3">
                  {demoNotes.map((note) => (
                    <div key={note.id} className="rounded border border-funktion-line p-4">
                      <p className="text-sm font-semibold text-funktion-blue">
                        {note.author_role === "administrator" || note.author_role === "admin" ? "Administrator" : "Borger"} ·{" "}
                        {new Date(note.created_at).toLocaleString("da-DK")}
                      </p>
                      <p className="mt-2 leading-7">{note.body}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
                Vælg en borger for at se dagbogsregistreringer.
              </p>
            )}
          </Section>
        </div>

        <Section title="Borgerens registreringer">
          {selectedCitizen ? (
            diaryEntries.length > 0 ? (
              <div className="grid gap-4">
                {diaryEntries.map((entry) => (
                  <DiaryEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
                Der er endnu ikke gemt dagbogsregistreringer for {selectedCitizen.citizen_name}.
              </p>
            )
          ) : (
            <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
              Vælg en borger for at se dagbogsregistreringer.
            </p>
          )}
        </Section>

        {selectedCitizen ? (
          <Section title="Favn360 Analyse">
            <AiAnalysisPanel
              citizenId={selectedCitizen.id}
              analyses={analyses}
              mode="admin"
              defaultPeriodStart={diaryEntries.at(-30)?.entry_date ?? diaryEntries.at(-1)?.entry_date ?? null}
              defaultPeriodEnd={diaryEntries[0]?.entry_date ?? null}
            />
          </Section>
        ) : null}

        {selectedCitizen ? (
          <Section title="PDF-versioner">
            <PdfVersionHistory exports={pdfExports} canDelete citizenId={selectedCitizen.id} />
          </Section>
        ) : null}

        <Section title="Funktionsevnebeskrivelse">
          <div className="grid gap-3">
            {[
              "Borgerens egen beskrivelse af de primære udfordringer i funktionsevnen",
              "Døgnrytme og rutiner",
              "Indkøb, madlavning og måltider",
              "Rengøring, tøjvask og sengeredning",
              "Personlig pleje",
              "Hus- og havearbejde",
              "Transport",
              "Kommunikation",
              "Sociale relationer",
              "Udviklingsmuligheder"
            ].map((point, index) => (
              <div key={point} className="rounded border border-funktion-line p-4">
                <p className="font-semibold text-funktion-blue">
                  {index + 1}. {point}
                </p>
                <textarea className="focus-ring mt-3 min-h-24 w-full rounded border border-funktion-line px-4 py-3" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function WarningMessage({ message }: { message: string }) {
  return <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">{message}</div>;
}

function CitizenLink({ citizen, selected }: { citizen: Citizen; selected: boolean }) {
  return (
    <Link
      href={`/dashboard/admin?citizenId=${citizen.id}`}
      className={`focus-ring rounded border p-4 ${
        selected ? "border-funktion-blue bg-funktion-pale" : "border-funktion-line hover:bg-funktion-pale"
      }`}
    >
      <p className="font-semibold text-funktion-blue">{citizen.citizen_name}</p>
      <dl className="mt-3 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-black">Praktiksted</dt>
          <dd>{citizen.practice_place ?? "Ikke angivet"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-black">Praktikstart</dt>
          <dd>
            {citizen.practice_start_date
              ? new Date(`${citizen.practice_start_date}T00:00:00`).toLocaleDateString("da-DK")
              : "Ikke angivet"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const dbEntry = entry as DiaryEntry & Record<string, any>;
  const text =
    dbEntry.home_day_description ||
    dbEntry.home_day ||
    dbEntry.work_notes ||
    dbEntry.what_went_well ||
    "Ingen tekst registreret.";
  const workPressure = dbEntry.pressure_level ?? dbEntry.work_pressure;
  const functionLevel = dbEntry.functional_level ?? dbEntry.function_level;
  const workMinutes = dbEntry.calculated_work_minutes ?? dbEntry.total_work_minutes;

  return (
    <Link href={`/dagbog/${entry.id}`} className="focus-ring grid gap-3 rounded border border-funktion-line p-4 hover:bg-funktion-pale">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString("da-DK")}
        </h2>
        <StatusBadge status={entry.status} />
      </div>
      <p className="leading-7 text-black/75">{text}</p>
      <dl className="grid gap-2 text-sm text-black/70 sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-black">Belastning</dt>
          <dd>{workPressure ?? "-"} / 10</dd>
        </div>
        <div>
          <dt className="font-semibold text-black">Funktionsniveau</dt>
          <dd>{functionLevel ?? "-"} / 10</dd>
        </div>
        <div>
          <dt className="font-semibold text-black">Arbejdstid</dt>
          <dd>{workMinutes ?? 0} min.</dd>
        </div>
      </dl>
    </Link>
  );
}
