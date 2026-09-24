export const PRACTICE_START_DATE = "2026-06-10";
export const WEEKLY_WORK_HOURS = 7.5;
export const PRACTICE_DAYS = [1, 3, 5];
export const DAILY_PRACTICE_MINUTES = 150;

export function isPracticeDay(date: Date) {
  const startsAt = new Date(`${PRACTICE_START_DATE}T00:00:00`);
  return date >= startsAt && PRACTICE_DAYS.includes(date.getDay());
}

export function buildPracticeCalendar(anchor = new Date("2026-06-10T00:00:00"), weeks = 6) {
  const days: Array<{ date: string; weekday: string; isPracticeDay: boolean; plannedHours: number }> = [];
  const formatter = new Intl.DateTimeFormat("da-DK", { weekday: "long" });

  for (let index = 0; index < weeks * 7; index += 1) {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + index);
    const practiceDay = isPracticeDay(date);

    days.push({
      date: date.toISOString().slice(0, 10),
      weekday: formatter.format(date),
      isPracticeDay: practiceDay,
      plannedHours: practiceDay ? DAILY_PRACTICE_MINUTES / 60 : 0
    });
  }

  return days;
}

export function calculateWorkMinutes(start?: string | null, end?: string | null) {
  if (!start || !end) {
    return null;
  }

  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  const total = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

  return Number.isFinite(total) && total >= 0 ? total : null;
}
