"use client";

import { useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";

const documentTypes = [
  "Daglig funktionsregistrering",
  "Ugentlig funktions- og belastningsopsummering",
  "Månedlig statusrapport",
  "Funktionsevnebeskrivelse",
  "Samlet praktik- og funktionsrapport",
  "Favn360 Analyse"
];

const periodTypes = ["Bestemt dag", "Fra/til dato", "Seneste 7 dage", "Seneste 30 dage", "Hele praktikperioden"];

const contentOptions = [
  ["includeCitizenEntries", "Borgerens egne registreringer"],
  ["includeAdminNotes", "Administratornoter"],
  ["includeAiSummary", "Favn360 Analyse"],
  ["includeAttachments", "Bilagsoversigt"],
  ["includeSignature", "Signaturfelt"],
  ["includeWatermark", "Vandmærke"],
  ["includeVersion", "Versionsnummer"],
  ["includeCharts", "Grafer placeholder"]
] as const;

const defaultContent = {
  includeCitizenEntries: true,
  includeAdminNotes: false,
  includeAiSummary: true,
  includeAttachments: false,
  includeSignature: true,
  includeWatermark: true,
  includeVersion: true,
  includeCharts: false
};

type ContentKey = keyof typeof defaultContent;

export function PdfExportModal({
  citizenId,
  citizenName,
  disabled = false,
  allowAdminNotes = false
}: {
  citizenId?: string | null;
  citizenName?: string | null;
  disabled?: boolean;
  allowAdminNotes?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState("Samlet praktik- og funktionsrapport");
  const [periodType, setPeriodType] = useState("Seneste 30 dage");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleContent(key: ContentKey) {
    setContent((current) => ({ ...current, [key]: !current[key] }));
  }

  const selectedContentLabels = contentOptions
    .filter(([key]) => content[key] && (key !== "includeAdminNotes" || allowAdminNotes))
    .map(([, label]) => label);

  const periodSummary =
    periodType === "Bestemt dag"
      ? `${periodType}${startDate ? `: ${startDate}` : ""}`
      : periodType === "Fra/til dato"
        ? `${periodType}${startDate || endDate ? `: ${startDate || "ikke angivet"} - ${endDate || "ikke angivet"}` : ""}`
        : periodType;

  async function exportPdf(mode: "preview" | "download") {
    setBusy(mode);
    setError(null);

    try {
      const response = await fetch("/api/pdf/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenId,
          documentType,
          periodType,
          startDate: startDate || null,
          endDate: endDate || null,
          ...content,
          includeAdminNotes: allowAdminNotes ? content.includeAdminNotes : false,
          disposition: mode === "preview" ? "inline" : "attachment"
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "PDF'en kunne ikke oprettes.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename = disposition.match(/filename="(.+)"/)?.[1] ?? "Favn360_eksport.pdf";

      if (mode === "preview") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-5 py-3 font-semibold text-black disabled:opacity-60"
      >
        <Download className="h-5 w-5 text-funktion-blue" />
        Eksporter PDF
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded border border-funktion-line bg-white shadow-calm">
            <div className="flex items-center justify-between border-b border-funktion-line px-5 py-4">
              <div className="flex items-center gap-3 text-funktion-blue">
                <FileText className="h-5 w-5" />
                <h2 className="text-xl font-semibold">PDF-eksport</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring rounded p-2 text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-5">
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  [1, "Dokumenttype og periode"],
                  [2, "Indhold"],
                  [3, "Handling"]
                ].map(([item, label]) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStep(Number(item))}
                    className={`focus-ring rounded border px-3 py-2 ${
                      step === item ? "border-funktion-blue bg-funktion-pale text-funktion-blue" : "border-funktion-line text-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {step === 1 ? (
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="font-medium">Dokumenttype</span>
                    <select
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value)}
                      className="focus-ring rounded border border-funktion-line px-4 py-3"
                    >
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">Periode</span>
                    <select
                      value={periodType}
                      onChange={(event) => setPeriodType(event.target.value)}
                      className="focus-ring rounded border border-funktion-line px-4 py-3"
                    >
                      {periodTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="font-medium">Startdato</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="focus-ring rounded border border-funktion-line px-4 py-3"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="font-medium">Slutdato</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="focus-ring rounded border border-funktion-line px-4 py-3"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {contentOptions.map(([key, label]) => {
                    const disabledOption = key === "includeAdminNotes" && !allowAdminNotes;
                    return (
                      <label key={key} className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
                        <input
                          type="checkbox"
                          checked={content[key]}
                          disabled={disabledOption}
                          onChange={() => toggleContent(key)}
                          className="h-5 w-5 accent-funktion-blue disabled:opacity-50"
                        />
                        <span className={disabledOption ? "text-black/45" : "text-black"}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <div className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/75">
                    <p className="font-semibold text-funktion-blue">Klar til eksport</p>
                    <p>Borger: {citizenName || "Valgt borger"}</p>
                    <p>Dokumenttype: {documentType}</p>
                    <p>Periode: {periodSummary}</p>
                    <p>Valgt indhold: {selectedContentLabels.length ? selectedContentLabels.join(", ") : "Intet valgt indhold"}</p>
                  </div>
                  {error ? <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => setOpen(false)}
                      className="focus-ring rounded border border-funktion-line px-5 py-3 font-semibold text-black disabled:opacity-60"
                    >
                      Annuller
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => exportPdf("preview")}
                      className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-5 py-3 font-semibold text-black disabled:opacity-60"
                    >
                      <Eye className="h-5 w-5 text-funktion-blue" />
                      {busy === "preview" ? "Opretter..." : "Forhåndsvis PDF"}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => exportPdf("download")}
                      className="focus-ring inline-flex items-center gap-2 rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:opacity-60"
                    >
                      <Download className="h-5 w-5" />
                      {busy === "download" ? "Opretter..." : "Download PDF"}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between border-t border-funktion-line pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded border border-funktion-line px-4 py-2 font-medium"
                >
                  Annuller
                </button>
                <div className="flex gap-3">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  className="focus-ring rounded border border-funktion-line px-4 py-2 font-medium disabled:opacity-50"
                >
                  Tilbage
                </button>
                <button
                  type="button"
                  disabled={step === 3}
                  onClick={() => setStep((current) => Math.min(3, current + 1))}
                  className="focus-ring rounded bg-funktion-blue px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  Næste
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
