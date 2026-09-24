"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateAnalysisButton({
  citizenId,
  periodStart,
  periodEnd,
  analysisType = "period",
  label = "Opdater analyse",
  disabled = false
}: {
  citizenId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  analysisType?: string;
  label?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    if (!citizenId) return;
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citizenId, periodStart, periodEnd, analysisType })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; warning?: string } | null;
      if (!response.ok) {
        setMessage(payload?.error ?? "Favn360 Analyse kunne ikke opdateres.");
        return;
      }
      setMessage(payload?.warning ?? "Favn360 Analyse er opdateret.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={disabled || !citizenId || busy}
        onClick={generate}
        className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-funktion-blue px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Opdaterer..." : label}
      </button>
      {message ? <p className="text-sm leading-6 text-black/65">{message}</p> : null}
    </div>
  );
}
