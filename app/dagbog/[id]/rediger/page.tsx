import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { fetchDiaryEntryById, isDiaryLocked } from "@/lib/diary-data";
import { DiaryForm } from "../../DiaryForm";

type EditDiaryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDiaryPage({ params }: EditDiaryPageProps) {
  const user = await requireUser("citizen");
  const { id } = await params;
  const { data: entry } = await fetchDiaryEntryById(id);

  if (!entry) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);

  if (entry.entry_date !== today || isDiaryLocked(entry)) {
    redirect(`/dagbog/${entry.id}`);
  }

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Rediger dagbog</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Rediger registreringen for {new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString("da-DK")}.
          </p>
        </div>
        <DiaryForm entry={entry} />
      </div>
    </AppShell>
  );
}
