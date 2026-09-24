import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await writeAuditLog({
      action: "login",
      actorId: user.id,
      entityType: "session"
    });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn(friendlyDatabaseError(error, "Audit-log kunne ikke gemmes."));
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
