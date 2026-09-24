import { NextResponse } from "next/server";
import { pdf, Document, Font, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { resolveExportCitizenId, type PdfExportOptions } from "@/lib/pdf-export-data";
import { fetchLatestAnalysisForPeriod } from "@/lib/ai-analysis-data";
import { listFromJson, riskLabel, type AiAnalysis } from "@/lib/ai-analysis";
import type { Citizen, DiaryEntry } from "@/types/database";
import { isSameOrigin } from "@/lib/request-security";

Font.registerHyphenationCallback((word) => [word]);

type ExportRequest = PdfExportOptions & {
  citizenId?: string | null;
  documentType: string;
  periodType: string;
  startDate?: string | null;
  endDate?: string | null;
  disposition?: "inline" | "attachment";
};

type DiaryNoteRow = {
  id: string;
  diary_entry_id: string;
  author_role: string;
  body: string;
  created_at: string;
};

type AttachmentRow = {
  id: string;
  diary_entry_id?: string | null;
  file_name: string;
  mime_type: string;
  file_size?: number | null;
  created_at: string;
};

type AiSummaryRow = {
  id: string;
  period_start: string;
  period_end: string;
  summary: Record<string, unknown>;
  created_at: string;
};

type ComputedSummary = {
  entryCount: number;
  practiceDays: number;
  totalWorkMinutes: number;
  absenceCount: number;
  averageFatigue: number | null;
  averageMental: number | null;
  averagePain: number | null;
  averagePressure: number | null;
  averageFunction: number | null;
  themes: string[];
};

const primary = "#141969";
const line = "#D9DEEA";
const muted = "#5F6575";

const styles = StyleSheet.create({
  cover: { flex: 1, backgroundColor: primary, color: "#FFFFFF", padding: 52, justifyContent: "space-between" },
  coverBrand: { fontSize: 36, fontWeight: 700, marginBottom: 8 },
  coverSubtitle: { fontSize: 12, marginBottom: 32 },
  coverDocument: { fontSize: 24, fontWeight: 700, marginBottom: 18 },
  coverMeta: { borderTop: "1 solid #FFFFFF", paddingTop: 18 },
  coverLine: { fontSize: 10.5, marginBottom: 7 },
  page: { padding: 42, paddingBottom: 62, fontSize: 9.5, color: "#000000", lineHeight: 1.42, backgroundColor: "#FFFFFF" },
  header: { borderBottom: `1 solid ${line}`, paddingBottom: 9, marginBottom: 15 },
  headerBrand: { color: primary, fontSize: 9, fontWeight: 700, marginBottom: 3 },
  headerTitle: { color: primary, fontSize: 15, fontWeight: 700 },
  headerMeta: { color: muted, fontSize: 8.5, marginTop: 3 },
  section: { marginBottom: 14 },
  sectionTitle: { color: primary, fontSize: 12.5, fontWeight: 700, marginBottom: 7 },
  sectionText: { marginBottom: 5 },
  card: { border: `1 solid ${line}`, padding: 9, marginBottom: 9, backgroundColor: "#FFFFFF" },
  subtleCard: { border: `1 solid ${line}`, backgroundColor: "#F7F8FC", padding: 9, marginBottom: 8 },
  label: { color: primary, fontWeight: 700 },
  row: { marginBottom: 3.5 },
  table: { border: `1 solid ${line}`, marginBottom: 8 },
  tableRow: { flexDirection: "row", borderBottom: `1 solid ${line}` },
  tableHeader: { backgroundColor: "#F0F2F8" },
  tableCell: { flex: 1, padding: 6, fontSize: 8.5 },
  tableCellWide: { flex: 2, padding: 6, fontSize: 8.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    borderTop: `1 solid ${line}`,
    paddingTop: 7,
    fontSize: 7.5,
    color: muted,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  footerLeft: { flex: 1.8 },
  footerRight: { flex: 1, textAlign: "right" },
  watermark: {
    position: "absolute",
    top: 330,
    left: 105,
    fontSize: 56,
    color: "#DADDE8",
    opacity: 0.25,
    transform: "rotate(-28deg)"
  },
  signatureBox: { border: `1 solid ${line}`, padding: 12, marginTop: 9 },
  signatureLine: { borderBottom: "1 solid #8A8F9F", marginTop: 22, marginBottom: 6 },
  small: { fontSize: 8.3, color: muted },
  twoColumn: { flexDirection: "row", gap: 10 },
  column: { flex: 1 }
});

function dbValue(entry: DiaryEntry, ...keys: string[]) {
  const dbEntry = entry as DiaryEntry & Record<string, any>;
  for (const key of keys) {
    const value = dbEntry[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function cleanText(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Ja" : "Nej";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value).replace(/\s+/g, " ").trim();
}

function valueText(value: unknown) {
  return cleanText(value) || "Ikke registreret";
}

function formatDate(date: string | null | undefined) {
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString("da-DK") : "Ikke angivet";
}

function formatDateTime(date: string | null | undefined) {
  return date ? new Date(date).toLocaleString("da-DK") : "Ikke angivet";
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Ikke registreret";
  return value.toLocaleString("da-DK", { maximumFractionDigits: digits, minimumFractionDigits: value % 1 === 0 ? 0 : digits });
}

function formatHours(minutes: number) {
  return `${formatNumber(minutes / 60, 1)} timer`;
}

function formatWeeklyHours(hours: number | null | undefined) {
  return hours === null || hours === undefined ? "Ikke angivet" : `${formatNumber(hours, 1)} timer`;
}

function sanitizeFilePart(value: string) {
  return value
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/Æ/g, "Ae")
    .replace(/Ø/g, "Oe")
    .replace(/Å/g, "Aa")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function resolvePeriod(input: ExportRequest, citizen: Citizen, entries: DiaryEntry[]) {
  const today = isoToday();
  if (input.periodType === "Bestemt dag") {
    const date = input.startDate || today;
    return { start: date, end: date };
  }
  if (input.periodType === "Fra/til dato") {
    return { start: input.startDate || today, end: input.endDate || input.startDate || today };
  }
  if (input.periodType === "Seneste 7 dage") {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: today };
  }
  if (input.periodType === "Seneste 30 dage") {
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start: start.toISOString().slice(0, 10), end: today };
  }

  const entryDates = entries.map((entry) => entry.entry_date).sort();
  return {
    start: citizen.practice_start_date || entryDates[0] || null,
    end: citizen.practice_end_date || entryDates.at(-1) || today
  };
}

async function optionalSelect<T>(query: PromiseLike<{ data: unknown; error: unknown }>, fallback: T, label: string): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.warn(`[favn360] ${label}`, error);
      return fallback;
    }
    return (data ?? fallback) as T;
  } catch (error) {
    console.warn(`[favn360] ${label}`, error);
    return fallback;
  }
}

function average(entries: DiaryEntry[], ...keys: string[]) {
  const values = entries
    .map((entry) => Number(dbValue(entry, ...keys)))
    .filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function containsAny(text: string, words: readonly string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function computeThemes(entries: DiaryEntry[]) {
  const texts = entries
    .map((entry) =>
      [
        dbValue(entry, "pain_limitations"),
        dbValue(entry, "psychological_challenges", "mentally_challenging"),
        dbValue(entry, "challenge_handling", "coping"),
        dbValue(entry, "skipped_or_stopped_tasks"),
        dbValue(entry, "pressured_tasks"),
        dbValue(entry, "limited_tasks"),
        dbValue(entry, "work_difficulties", "difficult_work"),
        dbValue(entry, "break_description"),
        dbValue(entry, "work_notes")
      ]
        .map(cleanText)
        .join(" ")
    )
    .join(" ");

  const themes = [
    ["Pauser og restitution", ["pause", "hvile", "restitution", "træt"]],
    ["Tydelig struktur og afgrænsede opgaver", ["struktur", "tydelig", "afgrænset", "instruktion", "opgave"]],
    ["Belastning ved tempo eller flere samtidige input", ["pres", "tempo", "input", "belast", "stress"]],
    ["Smerter eller fysisk begrænsning", ["smerte", "fysisk", "begræns", "ondt"]],
    ["Psykisk sårbarhed eller angst", ["angst", "psykisk", "bekym", "mental", "uro"]],
    ["Samarbejde og støtte fra kontaktperson", ["kollega", "kontaktperson", "støtte", "samarbejde"]]
  ] as const;

  return themes.filter(([, words]) => containsAny(texts, words)).map(([label]) => label).slice(0, 5);
}

function computeSummary(entries: DiaryEntry[]): ComputedSummary {
  const practiceDays = entries.filter((entry) => Boolean(dbValue(entry, "had_practice_day", "was_practice_day"))).length;
  const totalWorkMinutes = entries.reduce((sum, entry) => sum + (Number(dbValue(entry, "calculated_work_minutes", "total_work_minutes")) || 0), 0);

  return {
    entryCount: entries.length,
    practiceDays,
    totalWorkMinutes,
    absenceCount: entries.filter((entry) => Boolean(dbValue(entry, "absence"))).length,
    averageFatigue: average(entries, "fatigue_daytime"),
    averageMental: average(entries, "mental_daytime"),
    averagePain: average(entries, "pain_level_daytime", "pain_level"),
    averagePressure: average(entries, "pressure_level", "work_pressure"),
    averageFunction: average(entries, "functional_level", "function_level"),
    themes: computeThemes(entries)
  };
}

function latestAiSummary(summaries: AiSummaryRow[]) {
  return summaries[0] ?? null;
}

function jsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function summaryToLines(summary: unknown): string[] {
  if (!summary || typeof summary !== "object") return [];
  return Object.entries(summary as Record<string, unknown>).flatMap(([key, value]) => {
    if (Array.isArray(value)) return value.map((item) => `${key}: ${cleanText(item)}`).filter(Boolean);
    const text = cleanText(value);
    return text ? [`${key}: ${text}`] : [];
  });
}

function diaryFields(entry: DiaryEntry) {
  return [
    ["Status", dbValue(entry, "status")],
    ["Hjemmefunktion", dbValue(entry, "home_day_description", "home_day")],
    ["Søvn", dbValue(entry, "sleep_description", "sleep")],
    ["Gik i seng igen", dbValue(entry, "went_back_to_bed")],
    ["Træthed ved opvågning", dbValue(entry, "fatigue_waking", "fatigue_wakeup")],
    ["Træthed da borger stod op", dbValue(entry, "fatigue_getting_up")],
    ["Træthed i løbet af dagen", dbValue(entry, "fatigue_daytime")],
    ["Træthed ved sengetid", dbValue(entry, "fatigue_bedtime")],
    ["Mentalt niveau ved opvågning", dbValue(entry, "mental_waking", "mental_wakeup")],
    ["Mentalt niveau da borger stod op", dbValue(entry, "mental_getting_up")],
    ["Mentalt niveau i løbet af dagen", dbValue(entry, "mental_daytime")],
    ["Mentalt niveau ved sengetid", dbValue(entry, "mental_bedtime")],
    ["Smerteniveau i løbet af dagen", dbValue(entry, "pain_level_daytime", "pain_level")],
    ["Smertebegrænsninger", dbValue(entry, "pain_limitations")],
    ["Planlagte hjemmeopgaver", dbValue(entry, "planned_home_tasks", "home_planned_tasks")],
    ["Udførte hjemmeopgaver", dbValue(entry, "completed_home_tasks", "home_completed_tasks")],
    ["Hvad gik godt", dbValue(entry, "what_went_well", "went_well_home")],
    ["Psykologiske udfordringer", dbValue(entry, "psychological_challenges", "mentally_challenging")],
    ["Håndtering af udfordringer", dbValue(entry, "challenge_handling", "coping")],
    ["Med til i morgen", dbValue(entry, "take_to_tomorrow", "tomorrow_takeaway")],
    ["Personlig hygiejne", hygieneText(entry)],
    ["Andre vigtige kommentarer", dbValue(entry, "other_important_comments", "important_comments")],
    ["Praktikdag", dbValue(entry, "had_practice_day", "was_practice_day")],
    ["Faktisk mødetid", dbValue(entry, "actual_start_time")],
    ["Faktisk sluttid", dbValue(entry, "actual_end_time")],
    ["Beregnet arbejdstid", minuteText(dbValue(entry, "calculated_work_minutes", "total_work_minutes"))],
    ["Fravær", dbValue(entry, "absence")],
    ["Fraværsårsag", dbValue(entry, "absence_reason")],
    ["Opgaver sprunget over eller stoppet", dbValue(entry, "skipped_or_stopped_tasks")],
    ["Opgaver med pres", dbValue(entry, "pressured_tasks")],
    ["Opgaver med begrænsning", dbValue(entry, "limited_tasks")],
    ["Hvad gik godt i praktik", dbValue(entry, "work_went_well", "went_well_work")],
    ["Hvad var svært i praktik", dbValue(entry, "work_difficulties", "difficult_work")],
    ["Arbejdsmængde passende", dbValue(entry, "workload_suitable", "workload_fit")],
    ["Antal pauser", dbValue(entry, "break_count")],
    ["Samlet pausetid", minuteText(dbValue(entry, "break_total_minutes"))],
    ["Beskrivelse af pauser", dbValue(entry, "break_description")],
    ["Kollegaer og samarbejde", dbValue(entry, "colleague_cooperation", "collaboration")],
    ["Belastning/pres", dbValue(entry, "pressure_level", "work_pressure")],
    ["Funktionsniveau", dbValue(entry, "functional_level", "function_level")],
    ["Arbejdsnoter", dbValue(entry, "work_notes")]
  ].filter(([, value]) => cleanText(value));
}

function hygieneText(entry: DiaryEntry) {
  const personalCare = dbValue(entry, "personal_care");
  if (Array.isArray(personalCare) && personalCare.length) return personalCare.join(", ");
  const dbEntry = entry as DiaryEntry & Record<string, any>;
  return [
    dbEntry.hygiene_brushed_teeth ? "Børste tænder" : null,
    dbEntry.hygiene_brushed_hair ? "Børste hår" : null,
    dbEntry.hygiene_body_wash ? "Kropsbad" : null,
    dbEntry.hygiene_hair_wash ? "Hårvask" : null,
    dbEntry.hygiene_makeup ? "Make-up" : null,
    dbEntry.hygiene_dressing ? "Påklædning" : null
  ].filter(Boolean).join(", ");
}

function minuteText(value: unknown) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  return `${formatNumber(minutes, 0)} minutter (${formatHours(minutes)})`;
}

function Footer({
  documentType,
  versionText,
  includeWatermark
}: {
  documentType: string;
  versionText: string;
  includeWatermark: boolean;
}) {
  return (
    <>
      {includeWatermark ? <Text fixed style={styles.watermark}>FORTROLIGT</Text> : null}
      <View fixed style={styles.footer}>
        <Text style={styles.footerLeft}>
          Favn360 · {documentType} · {versionText}
          {"\n"}Dokumentet er genereret i Favn360 på baggrund af registreringer og gemte oplysninger.
        </Text>
        <Text
          style={styles.footerRight}
          render={({ pageNumber, totalPages }) => `Side ${pageNumber} af ${totalPages}`}
        />
      </View>
    </>
  );
}

function Header({
  documentType,
  citizen,
  versionText,
  periodStart,
  periodEnd
}: {
  documentType: string;
  citizen: Citizen;
  versionText: string;
  periodStart: string | null;
  periodEnd: string | null;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerBrand}>Favn360</Text>
      <Text style={styles.headerTitle}>{documentType}</Text>
      <Text style={styles.headerMeta}>
        {citizen.citizen_name} · {formatDate(periodStart)} - {formatDate(periodEnd)} · {versionText}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: unknown }) {
  return (
    <Text style={styles.row}>
      <Text style={styles.label}>{label}: </Text>
      {valueText(value)}
    </Text>
  );
}

function SummarySection({ summary }: { summary: ComputedSummary }) {
  return (
    <Section title="Kort resume">
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <InfoRow label="Antal dagbogsregistreringer" value={summary.entryCount} />
          <InfoRow label="Antal praktikdage" value={summary.practiceDays} />
          <InfoRow label="Registreret arbejdstid" value={summary.totalWorkMinutes ? minuteText(summary.totalWorkMinutes) : "0 minutter"} />
          <InfoRow label="Fraværsdage" value={summary.absenceCount} />
        </View>
        <View style={styles.column}>
          <InfoRow label="Gns. træthed i dagtimerne" value={formatNumber(summary.averageFatigue)} />
          <InfoRow label="Gns. mentalt niveau i dagtimerne" value={formatNumber(summary.averageMental)} />
          <InfoRow label="Gns. smerteniveau" value={formatNumber(summary.averagePain)} />
          <InfoRow label="Gns. belastning/pres" value={formatNumber(summary.averagePressure)} />
          <InfoRow label="Gns. funktionsniveau" value={formatNumber(summary.averageFunction)} />
        </View>
      </View>
      <Text style={[styles.sectionText, { marginTop: 8 }]}>
        Typiske temaer: {summary.themes.length ? summary.themes.join(", ") : "Der er endnu ikke nok tekstdata til at udlede tydelige temaer."}
      </Text>
    </Section>
  );
}

function DocumentInfoSection({
  input,
  citizen,
  periodStart,
  periodEnd,
  versionText
}: {
  input: ExportRequest;
  citizen: Citizen;
  periodStart: string | null;
  periodEnd: string | null;
  versionText: string;
}) {
  return (
    <Section title="Dokumentoplysninger">
      <View style={styles.table}>
        {[
          ["Dokumenttype", input.documentType],
          ["Borger", citizen.citizen_name],
          ["Periode", `${formatDate(periodStart)} - ${formatDate(periodEnd)}`],
          ["Version", versionText],
          ["Eksportdato", formatDate(isoToday())]
        ].map(([label, value], index) => (
          <View key={label} style={index === 0 ? [styles.tableRow, styles.tableHeader] : styles.tableRow}>
            <Text style={[styles.tableCell, styles.label]}>{label}</Text>
            <Text style={styles.tableCellWide}>{value}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function PracticeOverviewSection({ citizen, periodStart, periodEnd, summary }: { citizen: Citizen; periodStart: string | null; periodEnd: string | null; summary: ComputedSummary }) {
  return (
    <Section title="Praktik- og periodeoverblik">
      <View style={styles.subtleCard}>
        <InfoRow label="Praktiksted" value={citizen.practice_place} />
        <InfoRow label="Praktikperiode" value={`${formatDate(citizen.practice_start_date)} - ${formatDate(citizen.practice_end_date)}`} />
        <InfoRow label="Valgt rapportperiode" value={`${formatDate(periodStart)} - ${formatDate(periodEnd)}`} />
        <InfoRow label="Ugentlige timer" value={formatWeeklyHours(citizen.weekly_hours)} />
        <InfoRow label="Kontaktperson" value={citizen.contact_person} />
        <InfoRow label="Administrator/partsrepræsentant" value={citizen.administrator_name} />
        <InfoRow label="Registrerede praktikdage i perioden" value={summary.practiceDays} />
      </View>
    </Section>
  );
}

function DiaryOverviewSection({ entries }: { entries: DiaryEntry[] }) {
  return (
    <Section title="Borgerens egne registreringer">
      {entries.length ? (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Dato</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Praktik</Text>
            <Text style={styles.tableCell}>Arbejdstid</Text>
          </View>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatDate(entry.entry_date)}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "status"))}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "had_practice_day", "was_practice_day"))}</Text>
              <Text style={styles.tableCell}>{minuteText(dbValue(entry, "calculated_work_minutes", "total_work_minutes")) || "Ikke registreret"}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text>Der er ingen dagbogsregistreringer i den valgte periode.</Text>
      )}
    </Section>
  );
}

function DiaryJournalSection({ entries }: { entries: DiaryEntry[] }) {
  return (
    <Section title="Dag-for-dag journal">
      {entries.length ? entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <Text style={[styles.label, { marginBottom: 5 }]}>{formatDate(entry.entry_date)}</Text>
          {diaryFields(entry).map(([label, value]) => (
            <InfoRow key={`${entry.id}-${label}`} label={label} value={value} />
          ))}
        </View>
      )) : <Text>Der er ingen dagbogsregistreringer i den valgte periode.</Text>}
    </Section>
  );
}

function LoadAndFunctionSection({ entries, summary }: { entries: DiaryEntry[]; summary: ComputedSummary }) {
  return (
    <Section title="Belastning, funktion og fremmøde">
      <SummarySection summary={summary} />
      {entries.length ? (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Dato</Text>
            <Text style={styles.tableCell}>Træthed</Text>
            <Text style={styles.tableCell}>Mentalt</Text>
            <Text style={styles.tableCell}>Smerte</Text>
            <Text style={styles.tableCell}>Pres</Text>
            <Text style={styles.tableCell}>Funktion</Text>
          </View>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatDate(entry.entry_date)}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "fatigue_daytime"))}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "mental_daytime"))}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "pain_level_daytime", "pain_level"))}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "pressure_level", "work_pressure"))}</Text>
              <Text style={styles.tableCell}>{valueText(dbValue(entry, "functional_level", "function_level"))}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Section>
  );
}

function AdminNotesSection({ notes }: { notes: DiaryNoteRow[] }) {
  return (
    <Section title="Administratornoter">
      {notes.length ? notes.map((note) => (
        <View key={note.id} style={styles.card}>
          <Text style={styles.label}>{formatDateTime(note.created_at)}</Text>
          <Text>{note.body}</Text>
        </View>
      )) : <Text>Der er ingen administratornoter registreret i perioden.</Text>}
    </Section>
  );
}

function AiSummarySection({ summaries, analysis }: { summaries: AiSummaryRow[]; analysis: AiAnalysis | null }) {
  const summary = latestAiSummary(summaries);
  return (
    <Section title="Systemgenereret analyse">
      {analysis ? (
        <View style={styles.card}>
          <Text style={styles.label}>
            Version v{analysis.version_number} · Genereret {formatDateTime(analysis.created_at)} · Risikoindikator: {riskLabel(analysis.risk_level)}
          </Text>
          {analysis.summary ? <Text style={[styles.sectionText, { marginTop: 6 }]}>{analysis.summary}</Text> : null}
          {listFromJson(analysis.patterns).length ? (
            <View style={styles.subtleCard}>
              <Text style={styles.label}>Mønstre</Text>
              {listFromJson(analysis.patterns).map((line, index) => (
                <Text key={`${analysis.id}-pattern-${index}`} style={styles.row}>{line}</Text>
              ))}
            </View>
          ) : null}
          {jsonArray(analysis.functional_themes).length ? (
            <View style={styles.subtleCard}>
              <Text style={styles.label}>Funktionelle temaer</Text>
              {jsonArray(analysis.functional_themes).slice(0, 8).map((item, index) => {
                const theme = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
                return (
                  <Text key={`${analysis.id}-theme-${index}`} style={styles.row}>
                    <Text style={styles.label}>{cleanText(theme.theme)}: </Text>
                    {cleanText(theme.description)}
                  </Text>
                );
              })}
            </View>
          ) : null}
          {listFromJson(analysis.support_needs).length ? (
            <View style={styles.subtleCard}>
              <Text style={styles.label}>Støttebehov</Text>
              {listFromJson(analysis.support_needs).map((line, index) => (
                <Text key={`${analysis.id}-support-${index}`} style={styles.row}>{line}</Text>
              ))}
            </View>
          ) : null}
          {analysis.administrator_comment ? (
            <View style={styles.subtleCard}>
              <Text style={styles.label}>Administratorbemærkning til systemgenereret analyse</Text>
              <Text style={styles.sectionText}>{analysis.administrator_comment}</Text>
            </View>
          ) : null}
        </View>
      ) : summary ? (
        <View style={styles.card}>
          <Text style={styles.label}>Nyeste analyse: {formatDate(summary.period_start)} - {formatDate(summary.period_end)}</Text>
          {summaryToLines(summary.summary).length ? summaryToLines(summary.summary).map((line, index) => (
            <Text key={`${summary.id}-${index}`} style={styles.row}>{line}</Text>
          )) : <Text>{JSON.stringify(summary.summary)}</Text>}
        </View>
      ) : (
        <Text>Der er endnu ikke gemt en systemgenereret analyse for den valgte periode.</Text>
      )}
    </Section>
  );
}

function ThemesSection({ summary }: { summary: ComputedSummary }) {
  return (
    <Section title="Funktionsevnemæssige temaer">
      {summary.themes.length ? summary.themes.map((theme) => (
        <View key={theme} style={styles.subtleCard}>
          <Text style={styles.label}>{theme}</Text>
          <Text style={styles.small}>Temaet er udledt mekanisk fra gentagne formuleringer i dagbogsregistreringerne og er ikke en myndighedsvurdering.</Text>
        </View>
      )) : <Text>Der er endnu ikke tilstrækkeligt tekstgrundlag til at vise tydelige temaer.</Text>}
    </Section>
  );
}

function AttachmentsSection({ attachments, entries }: { attachments: AttachmentRow[]; entries: DiaryEntry[] }) {
  const entryDateById = new Map(entries.map((entry) => [entry.id, entry.entry_date]));
  return (
    <Section title="Bilagsoversigt">
      {attachments.length ? attachments.map((attachment) => (
        <View key={attachment.id} style={styles.card}>
          <InfoRow label="Filnavn" value={attachment.file_name} />
          <InfoRow label="Dato" value={formatDateTime(attachment.created_at)} />
          <InfoRow label="Tilknyttet dagbogsdato" value={attachment.diary_entry_id ? formatDate(entryDateById.get(attachment.diary_entry_id)) : "Ikke angivet"} />
          <InfoRow label="Filtype" value={attachment.mime_type} />
        </View>
      )) : <Text>Der er ingen bilag registreret i perioden.</Text>}
    </Section>
  );
}

function SignatureSection() {
  return (
    <Section title="Signatur og digital godkendelse">
      <View style={styles.signatureBox}>
        <Text>Digitalt godkendt af borger</Text>
        <Text style={styles.signatureLine}> </Text>
        <Text>Dato</Text>
      </View>
      <View style={styles.signatureBox}>
        <Text>Digitalt godkendt af administrator/partsrepræsentant</Text>
        <Text style={styles.signatureLine}> </Text>
        <Text>Dato</Text>
      </View>
      <Text style={[styles.small, { marginTop: 8 }]}>
        Digital godkendelse i Favn360 er en intern godkendelsesmarkering og erstatter ikke offentlig digital signatur.
      </Text>
    </Section>
  );
}

function ChartsSection() {
  return (
    <Section title="Grafer placeholder">
      <View style={styles.subtleCard}>
        <Text>Grafer for træthed, mentalt niveau, smerte, belastning og arbejdstid kan tilføjes i en senere version.</Text>
      </View>
    </Section>
  );
}

function CoverPage({
  citizen,
  input,
  versionText
}: {
  citizen: Citizen;
  input: ExportRequest;
  versionText: string;
}) {
  return (
    <Page size="A4" style={styles.cover}>
      {input.includeWatermark ? <Text fixed style={styles.watermark}>FORTROLIGT</Text> : null}
      <View>
        <Text style={styles.coverBrand}>Favn360</Text>
        <Text style={styles.coverSubtitle}>Digital dagbog og funktionsdokumentation</Text>
      </View>
      <View>
        <Text style={styles.coverDocument}>{input.documentType}</Text>
        <View style={styles.coverMeta}>
          <Text style={styles.coverLine}>Borger: {citizen.citizen_name}</Text>
          <Text style={styles.coverLine}>Fødselsår: {citizen.birth_year ?? "Ikke angivet"}</Text>
          <Text style={styles.coverLine}>Praktiksted: {citizen.practice_place ?? "Ikke angivet"}</Text>
          <Text style={styles.coverLine}>Praktikperiode: {formatDate(citizen.practice_start_date)} - {formatDate(citizen.practice_end_date)}</Text>
          <Text style={styles.coverLine}>Ugentlige timer: {formatWeeklyHours(citizen.weekly_hours)}</Text>
          <Text style={styles.coverLine}>Partsrepræsentant/administrator: {citizen.administrator_name ?? "Ikke angivet"}</Text>
          <Text style={styles.coverLine}>Eksportdato: {formatDate(isoToday())}</Text>
          <Text style={styles.coverLine}>Version: {versionText}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 8.5 }}>FORTROLIGT · Genereret i Favn360</Text>
    </Page>
  );
}

function contentSectionsForType(input: ExportRequest) {
  if (input.documentType === "Daglig funktionsregistrering") {
    return ["documentInfo", "summary", "diaryJournal", "adminNotes", "aiSummary", "attachments", "signature"];
  }
  if (input.documentType === "Ugentlig funktions- og belastningsopsummering") {
    return ["documentInfo", "summary", "practiceOverview", "loadFunction", "adminNotes", "aiSummary", "charts", "signature"];
  }
  if (input.documentType === "Månedlig statusrapport") {
    return ["documentInfo", "summary", "practiceOverview", "diaryOverview", "loadFunction", "themes", "adminNotes", "aiSummary", "attachments", "signature"];
  }
  if (input.documentType === "Funktionsevnebeskrivelse") {
    return ["documentInfo", "summary", "themes", "diaryJournal", "adminNotes", "aiSummary", "signature"];
  }
  if (input.documentType === "Favn360 Analyse") {
    return ["documentInfo", "summary", "loadFunction", "themes", "aiSummary", "charts", "signature"];
  }
  return [
    "documentInfo",
    "summary",
    "practiceOverview",
    "diaryOverview",
    "diaryJournal",
    "loadFunction",
    "adminNotes",
    "aiSummary",
    "themes",
    "attachments",
    "charts",
    "signature"
  ];
}

function renderSection(
  section: string,
  props: {
    input: ExportRequest;
    citizen: Citizen;
    entries: DiaryEntry[];
    notes: DiaryNoteRow[];
    aiSummaries: AiSummaryRow[];
    aiAnalysis: AiAnalysis | null;
    attachments: AttachmentRow[];
    summary: ComputedSummary;
    periodStart: string | null;
    periodEnd: string | null;
    versionText: string;
  }
) {
  if (section === "documentInfo") return <DocumentInfoSection input={props.input} citizen={props.citizen} periodStart={props.periodStart} periodEnd={props.periodEnd} versionText={props.versionText} />;
  if (section === "summary") return <SummarySection summary={props.summary} />;
  if (section === "practiceOverview") return <PracticeOverviewSection citizen={props.citizen} periodStart={props.periodStart} periodEnd={props.periodEnd} summary={props.summary} />;
  if (section === "diaryOverview") return props.input.includeCitizenEntries ? <DiaryOverviewSection entries={props.entries} /> : null;
  if (section === "diaryJournal") return props.input.includeCitizenEntries ? <DiaryJournalSection entries={props.entries} /> : null;
  if (section === "loadFunction") return <LoadAndFunctionSection entries={props.entries} summary={props.summary} />;
  if (section === "adminNotes") return props.input.includeAdminNotes ? <AdminNotesSection notes={props.notes} /> : null;
  if (section === "aiSummary") return props.input.includeAiSummary ? <AiSummarySection summaries={props.aiSummaries} analysis={props.aiAnalysis} /> : null;
  if (section === "themes") return <ThemesSection summary={props.summary} />;
  if (section === "attachments") return props.input.includeAttachments ? <AttachmentsSection attachments={props.attachments} entries={props.entries} /> : null;
  if (section === "charts") return props.input.includeCharts ? <ChartsSection /> : null;
  if (section === "signature") return props.input.includeSignature ? <SignatureSection /> : null;
  return null;
}

function ExportPdf({
  citizen,
  entries,
  notes,
  aiSummaries,
  aiAnalysis,
  attachments,
  input,
  versionNumber,
  periodStart,
  periodEnd
}: {
  citizen: Citizen;
  entries: DiaryEntry[];
  notes: DiaryNoteRow[];
  aiSummaries: AiSummaryRow[];
  aiAnalysis: AiAnalysis | null;
  attachments: AttachmentRow[];
  input: ExportRequest;
  versionNumber: number;
  periodStart: string | null;
  periodEnd: string | null;
}) {
  const versionText = `v${versionNumber}`;
  const summary = computeSummary(entries);
  const sections = contentSectionsForType(input);

  return (
    <Document title={`${input.documentType} ${versionText}`} author="Favn360">
      <CoverPage citizen={citizen} input={input} versionText={versionText} />
      <Page size="A4" style={styles.page}>
        <Footer documentType={input.documentType} versionText={versionText} includeWatermark={input.includeWatermark} />
        <Header documentType={input.documentType} citizen={citizen} versionText={versionText} periodStart={periodStart} periodEnd={periodEnd} />
        {sections.map((section) => (
          <View key={section}>{renderSection(section, { input, citizen, entries, notes, aiSummaries, aiAnalysis, attachments, summary, periodStart, periodEnd, versionText })}</View>
        ))}
      </Page>
    </Document>
  );
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
    }
    const input = (await request.json()) as ExportRequest;
    const resolved = await resolveExportCitizenId(input.citizenId);

    if (!resolved.user || !resolved.citizenId || resolved.error) {
      return NextResponse.json({ error: resolved.error ?? "PDF-eksport er ikke tilladt." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: citizenData, error: citizenError } = await supabase
      .from("citizens")
      .select("*")
      .eq("id", resolved.citizenId)
      .single();

    if (citizenError || !citizenData) {
      return NextResponse.json({ error: friendlyDatabaseError(citizenError, "Borgeren kunne ikke hentes.") }, { status: 404 });
    }

    const citizen = citizenData as Citizen;
    const { data: allEntriesData, error: entriesError } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("citizen_id", citizen.id)
      .order("entry_date", { ascending: true });

    if (entriesError) {
      return NextResponse.json({ error: friendlyDatabaseError(entriesError, "Dagbøgerne kunne ikke hentes.") }, { status: 500 });
    }

    const allEntries = (allEntriesData ?? []) as DiaryEntry[];
    const { start, end } = resolvePeriod(input, citizen, allEntries);
    const entries = allEntries.filter((entry) => {
      if (start && entry.entry_date < start) return false;
      if (end && entry.entry_date > end) return false;
      return true;
    });

    const entryIds = entries.map((entry) => entry.id);
    const notes = input.includeAdminNotes && entryIds.length
      ? await optionalSelect<DiaryNoteRow[]>(
          supabase
            .from("diary_notes")
            .select("id,diary_entry_id,author_role,body,created_at")
            .in("diary_entry_id", entryIds)
            .in("author_role", ["administrator", "admin"])
            .order("created_at", { ascending: true }),
          [],
          "Administratornoter kunne ikke hentes."
        )
      : [];

    const aiSummaries = input.includeAiSummary
      ? await optionalSelect<AiSummaryRow[]>(
          supabase
            .from("ai_summaries")
            .select("id,period_start,period_end,summary,created_at")
            .eq("citizen_id", citizen.id)
            .gte("period_end", start ?? "0001-01-01")
            .lte("period_start", end ?? "9999-12-31")
            .order("created_at", { ascending: false }),
          [],
          "Favn360 Analyse kunne ikke hentes."
        )
      : [];

    const aiAnalysis = input.includeAiSummary
      ? await fetchLatestAnalysisForPeriod(supabase, citizen.id, start, end)
      : null;

    const attachments = input.includeAttachments
      ? await optionalSelect<AttachmentRow[]>(
          supabase
            .from("attachments")
            .select("id,diary_entry_id,file_name,mime_type,file_size,created_at")
            .eq("citizen_id", citizen.id)
            .order("created_at", { ascending: false }),
          [],
          "Bilag kunne ikke hentes."
        )
      : [];

    const { data: latestVersion } = await supabase
      .from("pdf_exports")
      .select("version_number")
      .eq("citizen_id", citizen.id)
      .eq("document_type", input.documentType)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const versionNumber = ((latestVersion as { version_number?: number } | null)?.version_number ?? 0) + 1;
    const fileName = `Favn360_${sanitizeFilePart(citizen.citizen_name)}_${sanitizeFilePart(input.documentType)}_${isoToday()}_v${versionNumber}.pdf`;

    const { error: versionError } = await supabase.from("pdf_exports").insert({
      citizen_id: citizen.id,
      exported_by: resolved.user.id,
      document_type: input.documentType,
      period_start: start,
      period_end: end,
      version_number: versionNumber,
      file_name: fileName,
      file_path: null,
      options: input as unknown as Record<string, unknown>
    });

    if (versionError) {
      return NextResponse.json({ error: friendlyDatabaseError(versionError, "PDF-versionen kunne ikke registreres.") }, { status: 500 });
    }

    const blob = await pdf(
      <ExportPdf
        citizen={citizen}
        entries={entries}
        notes={notes}
        aiSummaries={aiSummaries}
        aiAnalysis={aiAnalysis}
        attachments={attachments}
        input={input}
        versionNumber={versionNumber}
        periodStart={start}
        periodEnd={end}
      />
    ).toBlob();

    await writeAuditLog({
      action: "pdf_exported",
      actorId: resolved.user.id,
      citizenId: citizen.id,
      entityType: "pdf_export",
      metadata: { documentType: input.documentType, versionNumber, periodStart: start, periodEnd: end }
    });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${input.disposition === "inline" ? "inline" : "attachment"}; filename="${fileName}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: friendlyDatabaseError(error, "PDF'en kunne ikke oprettes. Prøv igen senere.") },
      { status: 500 }
    );
  }
}
