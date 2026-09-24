import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/profile";
import { friendlyDatabaseError } from "@/lib/database-errors";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Anmodningen blev afvist." }, { status: 403 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Brugeren er ikke logget ind." }, { status: 401 });
    }

    const profile = await ensureProfileForUser(data.user, supabase);

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: friendlyDatabaseError(error, "Profilen kunne ikke klargøres. Prøv at logge ind igen.") },
      { status: 200 }
    );
  }
}
