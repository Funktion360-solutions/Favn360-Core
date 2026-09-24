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
    .eq("email", user.email.toLowerCase())
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

  const user = await requireUser();

  const supabase = await createClient();

  const hasAccess = await hasRepresentativeOnboardingAccess(user, supabase);

  if (!hasAccess) {
    return;
  }

  const display_name = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company_name = String(formData.get("company_name") ?? "").trim();
  const cvr = String(formData.get("cvr") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const profile_text = String(formData.get("profile_text") ?? "").trim();
  const price_text = String(formData.get("price_text") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  const accepts_new_clients = formData.get("accepts_new_clients") === "on";
  const public_profile = formData.get("public_profile") === "on";

  const specialtiesRaw = String(formData.get("specialties") ?? "");

  const specialties = specialtiesRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error: profileError } = await supabase
    .from("representative_profiles")
    .insert({
      user_id: user.id,
      display_name,
      email: user.email,
      phone,
      company_name,
      cvr,
      city,
      area,
      profile_text,
      specialties,
      price_text,
      website,
      accepts_new_clients,
      public_profile,
      approved_by_admin: true,
      verified: true,
      suspended: false
    });

  if (profileError) {
    console.error(profileError);
    return;
  }

  const { error: roleError } = await supabase
    .from("profiles")
    .update({
      role: "representative"
    })
    .eq("id", user.id);

  if (roleError) {
    console.error(roleError);
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
