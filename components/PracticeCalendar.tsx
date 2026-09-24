import { CalendarDays } from "lucide-react";
import { buildPracticeCalendar, WEEKLY_WORK_HOURS } from "@/lib/practice-schedule";

export function PracticeCalendar() {
  const days = buildPracticeCalendar();

  return (
    <div className="grid gap-5">
      <div className="rounded border border-funktion-line bg-funktion-pale p-4 text-sm leading-6">
        <div className="flex items-center gap-2 font-semibold text-funktion-blue">
          <CalendarDays className="h-5 w-5" />
          Jobafprøvning fra 10. juni 2026
        </div>
        <p className="mt-2 text-black">
          Planlagt arbejdstid er {WEEKLY_WORK_HOURS.toLocaleString("da-DK")} timer ugentligt fordelt på mandag,
          onsdag og fredag med 2,5 timer pr. praktikdag.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <div
            key={day.date}
            className={`rounded border p-4 ${
              day.isPracticeDay ? "border-funktion-blue bg-white" : "border-funktion-line bg-white"
            }`}
          >
            <p className="font-semibold capitalize text-black">{day.weekday}</p>
            <p className="text-sm text-black/70">{new Date(`${day.date}T00:00:00`).toLocaleDateString("da-DK")}</p>
            <p className="mt-3 text-sm font-medium text-funktion-blue">
              {day.isPracticeDay ? `Praktikdag · ${day.plannedHours.toLocaleString("da-DK")} timer` : "Ingen praktik planlagt"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
