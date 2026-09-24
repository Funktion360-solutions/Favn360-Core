import { CheckCircle2, Circle, FileCheck2 } from "lucide-react";
import { AdministratorAnalysisCommentForm } from "@/components/AdministratorAnalysisCommentForm";
import { GenerateAnalysisButton } from "@/components/GenerateAnalysisButton";
import { listFromJson, riskLabel, type AiAnalysis } from "@/lib/ai-analysis";
import { updateAiAnalysisWorkflow } from "@/lib/ai-analysis-data";

const riskClasses: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-rose-500",
  neutral: "bg-slate-400"
};

function formatDate(date: string | null | undefined) {
  return date ? new Date(date.includes("T") ? date : `${date}T00:00:00`).toLocaleDateString("da-DK") : "Ikke angivet";
}

function statusLabel(status: string) {
  if (status === "generated") return "Genereret";
  if (status === "reviewed") return "Gennemgået";
  if (status === "approved") return "Godkendt";
  if (status === "used_in_report") return "Brugt i rapport";
  return "Kladde";
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded border border-funktion-line p-4">
      <h3 className="font-semibold text-funktion-blue">{title}</h3>
      {items.length ? (
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-black/75">
          {items.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-black/60">Ikke beskrevet i den seneste analyse.</p>
      )}
    </div>
  );
}

export function AiAnalysisPanel({
  citizenId,
  analyses,
  mode,
  defaultPeriodStart,
  defaultPeriodEnd
}: {
  citizenId?: string | null;
  analyses: AiAnalysis[];
  mode: "citizen" | "admin";
  defaultPeriodStart?: string | null;
  defaultPeriodEnd?: string | null;
}) {
  const latest = analyses[0] ?? null;
  const patterns = latest ? listFromJson(latest.patterns) : [];
  const critical = latest ? listFromJson(latest.critical_observations) : [];
  const supportNeeds = latest ? listFromJson(latest.support_needs) : [];
  const risk = latest?.risk_level ?? "neutral";

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${riskClasses[risk] ?? riskClasses.neutral}`} />
            <p className="text-sm font-semibold text-black/70">{riskLabel(risk)}</p>
            {latest ? (
              <p className="text-sm text-black/55">
                v{latest.version_number} · {formatDate(latest.created_at)} · {statusLabel(latest.status)}
              </p>
            ) : null}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-funktion-blue">{latest?.title ?? "Favn360 Analyse"}</h2>
          <p className="mt-2 leading-7 text-black/75">
            {latest?.summary ?? "Der er endnu ikke oprettet en Favn360 Analyse for den valgte borger."}
          </p>
        </div>
        <GenerateAnalysisButton
          citizenId={citizenId}
          periodStart={defaultPeriodStart}
          periodEnd={defaultPeriodEnd}
          analysisType={mode === "admin" ? "admin_period" : "citizen_period"}
          label={mode === "admin" ? "Opdater Favn360 Analyse" : "Opdater analyse"}
          disabled={!citizenId}
        />
      </div>

      {latest?.model_used === "placeholder" ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          OPENAI_API_KEY mangler. Der vises en sikker placeholder-analyse, og dagbog/PDF fungerer fortsat.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title={mode === "admin" ? "Belastnings- og stabilitetstendenser" : "Seneste mønstre"} items={patterns} />
        <ListBlock title={mode === "admin" ? "Kritiske observationer" : "Støtte og refleksion"} items={mode === "admin" ? critical : supportNeeds} />
      </div>

      {mode === "admin" && latest ? (
        <div className="grid gap-3">
          <h3 className="text-lg font-semibold text-funktion-blue">Administratorbemærkning til analysen</h3>
          <AdministratorAnalysisCommentForm
            analysisId={latest.id}
            citizenId={latest.citizen_id}
            defaultValue={latest.administrator_comment}
          />
        </div>
      ) : null}

      {mode === "citizen" && latest?.administrator_comment ? (
        <div className="rounded border border-funktion-line p-4">
          <h3 className="font-semibold text-funktion-blue">Administratorbemærkning</h3>
          <p className="mt-3 leading-7 text-black/75">{latest.administrator_comment}</p>
        </div>
      ) : null}

      {mode === "admin" && latest ? (
        <form action={updateAiAnalysisWorkflow} className="grid gap-3 rounded border border-funktion-line p-4">
          <input type="hidden" name="analysisId" value={latest.id} />
          <input type="hidden" name="citizenId" value={latest.citizen_id} />
          <div className="flex flex-wrap gap-3">
            <button name="action" value="review" className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-4 py-2.5 font-semibold">
              <Circle className="h-4 w-4 text-funktion-blue" />
              Marker gennemgået
            </button>
            <button name="action" value="approve" className="focus-ring inline-flex items-center gap-2 rounded bg-funktion-blue px-4 py-2.5 font-semibold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Godkend
            </button>
            <button name="action" value="used" className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-4 py-2.5 font-semibold">
              <FileCheck2 className="h-4 w-4 text-funktion-blue" />
              Brugt i rapport
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded border border-funktion-line p-4">
        <h3 className="font-semibold text-funktion-blue">Tidligere versioner</h3>
        {analyses.length > 1 ? (
          <div className="mt-3 grid gap-2 text-sm leading-6 text-black/75">
            {analyses.slice(1).map((analysis) => (
              <div key={analysis.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-funktion-line pt-2">
                <span>v{analysis.version_number} · {analysis.title ?? "Favn360 Analyse"}</span>
                <span className="text-black/55">{formatDate(analysis.created_at)} · {riskLabel(analysis.risk_level)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-black/60">Der er endnu ikke tidligere versioner.</p>
        )}
      </div>
    </div>
  );
}
