import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCitizenByUserId } from "@/lib/citizens";

const requestSchema = z.object({
  representativeId: z.string().uuid(),
  message: z.string().trim().max(2_000)
});

async function createRepresentativeRequest(
  representativeId: string,
  formData: FormData
) {
  "use server";

  const user = await requireUser("borger");

  const supabase = await createClient();

  const { citizen } = await getCitizenByUserId(user.id);

  if (!citizen) {
    return;
  }

  const parsed = requestSchema.safeParse({
    representativeId,
    message: String(formData.get("message") ?? "")
  });

  if (!parsed.success) return;

  const { data: representative } = await supabase
    .from("representative_profiles")
    .select("id")
    .eq("id", parsed.data.representativeId)
    .eq("approved_by_admin", true)
    .eq("public_profile", true)
    .eq("suspended", false)
    .maybeSingle();

  if (!representative) return;

  const { error } = await supabase
    .from("representative_requests")
    .insert({
      citizen_id: citizen.id,
      representative_id: representative.id,
      message: parsed.data.message,
      status: "pending"
    });

  if (error) {
    console.error("[favn360] Representative request could not be created.", { code: error.code });
    return;
  }

  revalidatePath("/dashboard/partsrepraesentant");

  redirect("/dashboard/borger");
}

export default async function RepresentativeRequestPage({

  params

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const user = await requireUser("borger");

  const supabase = await createClient();

  const { data: representative, error } = await supabase
    .from("representative_profiles")
    .select("*")
    .eq("id", id)
    .eq("approved_by_admin", true)
    .eq("public_profile", true)
    .eq("suspended", false)
    .single();

  if (error || !representative) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-funktion-blue">
            Anmod om tilknytning
          </h1>

          <p className="mt-2 leading-7 text-black/70">
            Send en anmodning om tilknytning til partsrepræsentanten.
          </p>
        </div>

        <Section title={representative.display_name}>
          <div className="grid gap-3">
            <p className="text-black/70">
              {[representative.city, representative.area]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {representative.profile_text ? (
              <p className="leading-7 text-black/80">
                {representative.profile_text}
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Din besked">
          <form
            action={createRepresentativeRequest.bind(null, representative.id)}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Besked til partsrepræsentanten
              </label>

              <textarea
                name="message"
                rows={8}
                placeholder="Beskriv kort din situation eller hvorfor du ønsker tilknytning."
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
            >
              Send anmodning
            </button>
          </form>
        </Section>
      </div>
    </AppShell>
  );
}
