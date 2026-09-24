import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { DiaryForm } from "./DiaryForm";

export default async function DiaryPage() {
  const user = await requireUser("citizen");

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Dagbog</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Registrer dagens funktion, praktik, belastning, pauser og noter. Felterne er store og opdelt, så registreringen kan udfyldes i flere omgange.
          </p>
        </div>
        <DiaryForm />
      </div>
    </AppShell>
  );
}
