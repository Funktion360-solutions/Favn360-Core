import { Trash2 } from "lucide-react";
import { deletePdfExport } from "@/lib/pdf-export-data";
import type { PdfExport } from "@/types/database";

export function PdfVersionHistory({
  exports,
  canDelete = false,
  citizenId
}: {
  exports: PdfExport[];
  canDelete?: boolean;
  citizenId?: string | null;
}) {
  if (exports.length === 0) {
    return (
      <p className="rounded border border-funktion-line p-4 text-sm leading-6 text-black/70">
        Der er endnu ikke oprettet PDF-versioner.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {exports.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded border border-funktion-line p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold text-funktion-blue">
              {item.document_type} · v{item.version_number}
            </p>
            <p className="mt-1 text-sm leading-6 text-black/70">
              {item.file_name}
              <br />
              Oprettet {new Date(item.created_at).toLocaleString("da-DK")}
            </p>
          </div>

          {canDelete ? (
            <form action={deletePdfExport}>
              <input type="hidden" name="exportId" value={item.id} />
              <input type="hidden" name="citizenId" value={citizenId ?? item.citizen_id} />
              <button className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-3 py-2 text-sm font-medium text-black hover:bg-funktion-pale">
                <Trash2 className="h-4 w-4 text-funktion-blue" />
                Slet
              </button>
            </form>
          ) : null}
        </div>
      ))}
    </div>
  );
}
