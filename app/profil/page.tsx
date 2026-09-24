import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/Section";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Min profil</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Her vises de grundlæggende oplysninger, som bruges til adgang og rolle i Favn360.
          </p>
        </div>

        <Section title="Brugeroplysninger">
          <dl className="grid gap-4 md:grid-cols-3">
            <div className="rounded border border-funktion-line p-4">
              <dt className="text-sm font-semibold text-funktion-blue">Navn</dt>
              <dd className="mt-2 text-lg text-black">{user.fullName}</dd>
            </div>
            <div className="rounded border border-funktion-line p-4">
              <dt className="text-sm font-semibold text-funktion-blue">Email</dt>
              <dd className="mt-2 break-words text-lg text-black">{user.email}</dd>
            </div>
            <div className="rounded border border-funktion-line p-4">
              <dt className="text-sm font-semibold text-funktion-blue">Rolle</dt>
              <dd className="mt-2 text-lg text-black">
                {user.role === "administrator" ? "Administrator" : user.role === "citizen" ? "Borger" : "Rolle ikke angivet"}
              </dd>
            </div>
          </dl>
        </Section>
      </div>
    </AppShell>
  );
}
