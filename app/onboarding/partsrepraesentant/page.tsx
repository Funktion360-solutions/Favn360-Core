import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function hasRepresentativeOnboardingAccess(
  user: Awaited<ReturnType<typeof requireUser>>,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  if (user.role === "representative") {
    return true;
  }

  const { data: application, error } = await supabase
  .from("representative_applications")
  .select("id")
  .eq("applicant_user_id", user.id)
  .eq("status", "approved")
  .eq("onboarding_unlocked", true)
  .maybeSingle();

  if (error) {
    console.error(error);
  }

  return Boolean(application);
}

async function createRepresentativeProfile(formData: FormData) {
  "use server";

  await requireUser();

  const supabase = await createClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const cvr = String(formData.get("cvr") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const profileText = String(formData.get("profile_text") ?? "").trim();
  const priceText = String(formData.get("price_text") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  const acceptsNewClients =
    formData.get("accepts_new_clients") === "on";

  const publicProfile =
    formData.get("public_profile") === "on";

  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase.rpc(
    "complete_representative_onboarding",
    {
      p_display_name: displayName,
      p_phone: phone || null,
      p_company_name: companyName || null,
      p_cvr: cvr || null,
      p_city: city || null,
      p_area: area || null,
      p_profile_text: profileText || null,
      p_specialties: specialties,
      p_price_text: priceText || null,
      p_website: website || null,
      p_accepts_new_clients: acceptsNewClients,
      p_public_profile: publicProfile
    }
  );

  if (error) {
    console.error("[favn360] Representative onboarding failed.", {
      code: error.code,
      message: error.message
    });

    return;
  }

  revalidatePath("/dashboard");
  redirect("/dashboard/partsrepraesentant");
}

export default async function RepresentativeOnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const hasAccess = await hasRepresentativeOnboardingAccess(user, supabase);

  if (!hasAccess) {
    return (
      <AppShell user={user}>
        <div className="mx-auto max-w-4xl">
          <Section title="Adgang afventer godkendelse">
            <p className="leading-7 text-black/70">
              Din adgang som professionel bruger er ikke godkendt endnu.
            </p>
          </Section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-funktion-blue">
            Opret partsrepræsentantprofil
          </h1>

          <p className="mt-2 leading-7 text-black/70">
            Din adgang er godkendt. Udfyld profilen for at oprette din professionelle bruger.
          </p>
        </div>

        <Section title="Profiloplysninger">
          <form action={createRepresentativeProfile} className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Navn
              </label>

              <input
                name="display_name"
                required
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Telefon
              </label>

              <input
                name="phone"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Firma / organisation
              </label>

              <input
                name="company_name"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                CVR
              </label>

              <input
                name="cvr"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                By
              </label>

              <input
                name="city"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Område
              </label>

              <input
                name="area"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Specialer (kommasepareret)
              </label>

              <input
                name="specialties"
                placeholder="ADHD, fleksjob, sygedagpenge"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Kort profiltekst
              </label>

              <textarea
                name="profile_text"
                rows={6}
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Pris/oplysninger
              </label>

              <input
                name="price_text"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Hjemmeside
              </label>

              <input
                name="website"
                className="rounded border border-funktion-line px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" name="accepts_new_clients" />

              <span>Tager imod nye klienter</span>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" name="public_profile" />

              <span>Vis min profil offentligt</span>
            </label>

            <button
              type="submit"
              className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white"
            >
              Opret profil
            </button>
          </form>
        </Section>
      </div>
    </AppShell>
  );
}
