export const copenhagenTimeZone = "Europe/Copenhagen";

export function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function copenhagenDateKey(value: string | Date) {
  return new Date(value).toLocaleDateString("sv-SE", { timeZone: copenhagenTimeZone });
}

export function copenhagenTimeValue(value: string | Date) {
  const parts = new Intl.DateTimeFormat("da-DK", {
    timeZone: copenhagenTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(value));

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

function copenhagenOffset(dateKey: string, time: string) {
  const probe = new Date(`${dateKey}T${time}:00Z`);
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: copenhagenTimeZone,
    timeZoneName: "shortOffset"
  })
    .formatToParts(probe)
    .find((part) => part.type === "timeZoneName")?.value;

  const match = timeZoneName?.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return "+01:00";
  }

  const [, sign, hours, minutes = "00"] = match;
  return `${sign}${hours.padStart(2, "0")}:${minutes}`;
}

export function copenhagenDateTimeToUtcIso(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00${copenhagenOffset(dateKey, time)}`).toISOString();
}

export function copenhagenLocalInputToUtcIso(value: string) {
  const [dateKey, time = "00:00"] = value.split("T");

  if (!dateKey) {
    return null;
  }

  const date = new Date(copenhagenDateTimeToUtcIso(dateKey, time.slice(0, 5)));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
