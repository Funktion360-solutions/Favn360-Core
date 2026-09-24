import type { DiaryStatus, FunctionalDescriptionStatus } from "@/types/database";

const labels: Record<DiaryStatus | FunctionalDescriptionStatus, string> = {
  draft: "Kladde",
  completed: "Færdig",
  reviewed_by_admin: "Gennemgået af administrator",
  locked: "Låst",
  for_review: "Til gennemgang",
  approved: "Godkendt",
  exported: "Eksporteret"
};

export function StatusBadge({ status }: { status: DiaryStatus | FunctionalDescriptionStatus }) {
  return (
    <span className="inline-flex rounded bg-funktion-pale px-3 py-1 text-xs font-semibold uppercase tracking-wide text-funktion-blue">
      {labels[status]}
    </span>
  );
}
