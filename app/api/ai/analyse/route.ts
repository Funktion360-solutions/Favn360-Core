import { NextResponse } from "next/server";
import { z } from "zod";
import { createAiAnalysis } from "@/lib/ai-analysis-data";
import { getCurrentUser } from "@/lib/auth";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { isSameOrigin } from "@/lib/request-security";

const schema = z.object({
  citizenId: z.string().uuid(),
  periodStart: z.string().date().nullable().optional(),
  periodEnd: z.string().date().nullable().optional(),
  analysisType: z.string().min(1).max(80).default("period")
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
    }
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Du er ikke logget ind." }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const result = await createAiAnalysis({
      citizenId: body.citizenId,
      periodStart: body.periodStart ?? null,
      periodEnd: body.periodEnd ?? null,
      analysisType: body.analysisType,
      user
    });

    if (!result.analysis) {
      return NextResponse.json({ error: result.warning ?? "Favn360 Analyse kunne ikke oprettes." }, { status: 403 });
    }

    return NextResponse.json({ analysis: result.analysis, warning: result.warning });
  } catch (error) {
    return NextResponse.json(
      { error: friendlyDatabaseError(error, "Favn360 Analyse kunne ikke oprettes. Prøv igen senere.") },
      { status: 500 }
    );
  }
}
