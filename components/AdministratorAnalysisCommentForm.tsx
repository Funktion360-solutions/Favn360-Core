"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import {
  updateAiAnalysisAdministratorComment,
  type AdministratorCommentState
} from "@/lib/ai-analysis-actions";

const initialState: AdministratorCommentState = {
  ok: false,
  message: null
};

export function AdministratorAnalysisCommentForm({
  analysisId,
  citizenId,
  defaultValue
}: {
  analysisId: string;
  citizenId: string;
  defaultValue?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateAiAnalysisAdministratorComment, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded border border-funktion-line p-4">
      <input type="hidden" name="analysisId" value={analysisId} />
      <input type="hidden" name="citizenId" value={citizenId} />
      <label className="grid gap-2">
        <span className="font-medium">Administratorbemærkning til analysen</span>
        <textarea
          name="administratorComment"
          defaultValue={defaultValue ?? ""}
          rows={4}
          className="focus-ring rounded border border-funktion-line px-4 py-3 leading-7"
          placeholder="Tilføj neutral faglig bemærkning til analysen"
        />
      </label>
      {state.message ? (
        <p
          className={`rounded border px-4 py-3 text-sm ${
            state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        disabled={isPending}
        className="focus-ring inline-flex w-fit items-center gap-2 rounded bg-funktion-blue px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {isPending ? "Gemmer..." : "Gem bemærkning"}
      </button>
    </form>
  );
}
