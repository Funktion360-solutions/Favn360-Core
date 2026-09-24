"use client";

import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, List, Plus, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  updateCalendarEventStatus
} from "./actions";
import { copenhagenDateKey, copenhagenTimeValue, copenhagenTimeZone, padDatePart } from "./time";
import { eventStatuses, eventTypes, type CalendarEvent, type CalendarEventStatus, type CalendarEventType } from "./types";

type CalendarView = "month" | "week" | "list";
type ModalState =
  | { mode: "create"; dateKey: string; event?: undefined }
  | { mode: "edit"; dateKey: string; event: CalendarEvent };

const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const longDayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

const typeStyles: Record<CalendarEventType, { dot: string; badge: string; border: string }> = {
  practice: {
    dot: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    border: "border-l-blue-500"
  },
  meeting: {
    dot: "bg-purple-500",
    badge: "border-purple-200 bg-purple-50 text-purple-800",
    border: "border-l-purple-500"
  },
  reminder: {
    dot: "bg-yellow-400",
    badge: "border-yellow-200 bg-yellow-50 text-yellow-900",
    border: "border-l-yellow-400"
  },
  absence: {
    dot: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-800",
    border: "border-l-red-500"
  },
  vacation: {
    dot: "bg-green-500",
    badge: "border-green-200 bg-green-50 text-green-800",
    border: "border-l-green-500"
  },
  follow_up: {
    dot: "bg-orange-500",
    badge: "border-orange-200 bg-orange-50 text-orange-800",
    border: "border-l-orange-500"
  },
  other: {
    dot: "bg-gray-500",
    badge: "border-gray-200 bg-gray-50 text-gray-700",
    border: "border-l-gray-400"
  }
};

function pad(value: number) {
  return padDatePart(value);
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  return addDays(startOfDay(date), 1 - day);
}

function sameDay(first: Date, second: Date) {
  return localDateKey(first) === localDateKey(second);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function combineDateAndTime(dateKey: string, time: string) {
  return `${dateKey}T${time || "00:00"}`;
}

function eventDateKey(event: CalendarEvent) {
  return copenhagenDateKey(event.start_time);
}

function eventTime(event: CalendarEvent) {
  if (event.all_day) {
    return "Hele dagen";
  }

  return new Date(event.start_time).toLocaleTimeString("da-DK", {
    timeZone: copenhagenTimeZone,
    hour: "2-digit",
    minute: "2-digit"
  });
}

function eventEndTime(event: CalendarEvent) {
  return new Date(event.end_time).toLocaleTimeString("da-DK", {
    timeZone: copenhagenTimeZone,
    hour: "2-digit",
    minute: "2-digit"
  });
}

function eventDateLabel(event: CalendarEvent) {
  return new Date(event.start_time).toLocaleDateString("da-DK", {
    timeZone: copenhagenTimeZone,
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("da-DK", {
    timeZone: copenhagenTimeZone,
    month: "long",
    year: "numeric"
  });
}

function weekLabel(date: Date) {
  const first = startOfWeek(date);
  const last = addDays(first, 6);
  return `${first.toLocaleDateString("da-DK", { timeZone: copenhagenTimeZone, day: "numeric", month: "short" })} - ${last.toLocaleDateString(
    "da-DK",
    { timeZone: copenhagenTimeZone, day: "numeric", month: "short", year: "numeric" }
  )}`;
}

function typeLabel(type: CalendarEventType) {
  return eventTypes.find((item) => item.value === type)?.label ?? type;
}

function statusLabel(status: CalendarEventStatus) {
  return eventStatuses.find((item) => item.value === status)?.label ?? status;
}

function toDateInputValue(value: string) {
  return copenhagenDateKey(value);
}

function toTimeInputValue(value: string) {
  return copenhagenTimeValue(value);
}

function defaultEndTime(startTime: string) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date(2026, 0, 1, hours, minutes);
  date.setHours(date.getHours() + 1);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CalendarExperience({
  events,
  statusMessage,
  errorMessage,
  citizenReady
}: {
  events: CalendarEvent[];
  statusMessage?: string;
  errorMessage?: string;
  citizenReady: boolean;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState<CalendarView>("month");
  const [focusDate, setFocusDate] = useState(today);
  const [modal, setModal] = useState<ModalState | null>(null);
  const todayKey = copenhagenDateKey(today);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [events]
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    sortedEvents.forEach((event) => {
      const key = eventDateKey(event);
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    });

    return grouped;
  }, [sortedEvents]);

  const todayEvents = eventsByDay.get(todayKey) ?? [];
  const now = Date.now();
  const upcomingEvents = sortedEvents.filter((event) => new Date(event.start_time).getTime() >= now);
  const previousEvents = [...sortedEvents]
    .filter((event) => new Date(event.start_time).getTime() < now)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  function openCreate(dateKey = localDateKey(focusDate)) {
    if (citizenReady) {
      setModal({ mode: "create", dateKey });
    }
  }

  function openEdit(event: CalendarEvent) {
    setModal({ mode: "edit", dateKey: eventDateKey(event), event });
  }

  function jumpToToday() {
    setFocusDate(today);
  }

  function moveBack() {
    if (view === "week") {
      setFocusDate((date) => addDays(date, -7));
      return;
    }

    setFocusDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }

  function moveForward() {
    if (view === "week") {
      setFocusDate((date) => addDays(date, 7));
      return;
    }

    setFocusDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-funktion-blue">Kalender</h1>
          <p className="mt-2 max-w-3xl leading-7 text-black/70">
            Overblik over aftaler, praktik, påmindelser og fravær.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openCreate(todayKey)}
            disabled={!citizenReady}
            className="focus-ring inline-flex items-center gap-2 rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/30"
          >
            <Plus className="h-5 w-5" />
            Ny aftale
          </button>

          <button
            type="button"
            onClick={jumpToToday}
            className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line bg-white px-5 py-3 font-semibold text-funktion-blue"
          >
            <Clock className="h-5 w-5" />
            I dag
          </button>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded border border-funktion-line bg-white p-5 shadow-calm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-funktion-blue">I dag</h2>
            <p className="mt-1 text-sm leading-6 text-black/70">
              {today.toLocaleDateString("da-DK", {
                timeZone: copenhagenTimeZone,
                weekday: "long",
                day: "numeric",
                month: "long"
              })}
            </p>
          </div>

          <ViewSwitcher view={view} onChange={setView} />
        </div>

        {todayEvents.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todayEvents.map((event) => (
              <EventCard key={event.id} event={event} compact onEdit={openEdit} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-funktion-line bg-funktion-pale/40 p-5 text-sm leading-6 text-black/70">
            Ingen aftaler i dag
          </div>
        )}
      </section>

      <section className="rounded border border-funktion-line bg-white shadow-calm">
        <div className="flex flex-col gap-4 border-b border-funktion-line p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={moveBack}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded border border-funktion-line text-funktion-blue"
              aria-label="Forrige periode"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-semibold text-funktion-blue">
                {view === "week" ? weekLabel(focusDate) : view === "month" ? monthLabel(focusDate) : "Liste"}
              </h2>
              {view === "list" ? <p className="mt-1 text-sm text-black/60">Kommende og tidligere aftaler</p> : null}
            </div>

            <button
              type="button"
              onClick={moveForward}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded border border-funktion-line text-funktion-blue"
              aria-label="Næste periode"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <span key={type.value} className="inline-flex items-center gap-2 text-xs text-black/65">
                <span className={`h-2.5 w-2.5 rounded-full ${typeStyles[type.value].dot}`} />
                {type.label}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5">
          {view === "month" ? (
            <MonthView focusDate={focusDate} today={today} eventsByDay={eventsByDay} onCreate={openCreate} onEdit={openEdit} />
          ) : null}

          {view === "week" ? (
            <WeekView focusDate={focusDate} today={today} eventsByDay={eventsByDay} onCreate={openCreate} onEdit={openEdit} />
          ) : null}

          {view === "list" ? (
            <ListView upcomingEvents={upcomingEvents} previousEvents={previousEvents} onEdit={openEdit} />
          ) : null}
        </div>
      </section>

      {modal ? <EventModal modal={modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

function ViewSwitcher({ view, onChange }: { view: CalendarView; onChange: (view: CalendarView) => void }) {
  const options: Array<{ value: CalendarView; label: string; icon: ReactNode }> = [
    { value: "month", label: "Måned", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "week", label: "Uge", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "list", label: "Liste", icon: <List className="h-4 w-4" /> }
  ];

  return (
    <div className="grid grid-cols-3 rounded border border-funktion-line bg-funktion-pale p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`focus-ring inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
            view === option.value ? "bg-white text-funktion-blue shadow-sm" : "text-black/65 hover:text-funktion-blue"
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MonthView({
  focusDate,
  today,
  eventsByDay,
  onCreate,
  onEdit
}: {
  focusDate: Date;
  today: Date;
  eventsByDay: Map<string, CalendarEvent[]>;
  onCreate: (dateKey: string) => void;
  onEdit: (event: CalendarEvent) => void;
}) {
  const days = useMemo(() => {
    const firstOfMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
    const gridStart = startOfWeek(firstOfMonth);

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [focusDate]);

  return (
    <div className="grid gap-3">
      <div className="hidden grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-black/50 md:grid">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-7 md:gap-2">
        {days.map((day) => {
          const dateKey = localDateKey(day);
          const dayEvents = eventsByDay.get(dateKey) ?? [];
          const inCurrentMonth = day.getMonth() === focusDate.getMonth();

          return (
            <div
              key={dateKey}
              role="button"
              tabIndex={0}
              onClick={() => onCreate(dateKey)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  onCreate(dateKey);
                }
              }}
              className={`focus-ring min-h-32 rounded border p-3 text-left transition hover:border-funktion-blue hover:bg-funktion-pale ${
                sameDay(day, today)
                  ? "border-funktion-blue bg-funktion-pale"
                  : "border-funktion-line bg-white"
              } ${inCurrentMonth ? "" : "opacity-55"}`}
            >
              <span className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-black/50 md:hidden">
                  {longDayNames[(day.getDay() + 6) % 7]}
                </span>
                <span className="text-sm font-semibold text-funktion-blue">{day.getDate()}</span>
              </span>

              <span className="grid gap-1.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEdit(event);
                    }}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        onEdit(event);
                      }
                    }}
                    className={`focus-ring truncate rounded border px-2 py-1 text-left text-xs font-semibold ${typeStyles[event.event_type].badge}`}
                  >
                    {eventTime(event)} {event.title}
                  </button>
                ))}

                {dayEvents.length > 3 ? (
                  <span className="text-xs font-semibold text-black/55">+ {dayEvents.length - 3} mere</span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  focusDate,
  today,
  eventsByDay,
  onCreate,
  onEdit
}: {
  focusDate: Date;
  today: Date;
  eventsByDay: Map<string, CalendarEvent[]>;
  onCreate: (dateKey: string) => void;
  onEdit: (event: CalendarEvent) => void;
}) {
  const weekDays = useMemo(() => {
    const first = startOfWeek(focusDate);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
  }, [focusDate]);

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {weekDays.map((day) => {
        const dateKey = localDateKey(day);
        const dayEvents = eventsByDay.get(dateKey) ?? [];

        return (
          <div
            key={dateKey}
            className={`grid gap-3 rounded border p-4 ${
              sameDay(day, today) ? "border-funktion-blue bg-funktion-pale" : "border-funktion-line bg-white"
            }`}
          >
            <button type="button" onClick={() => onCreate(dateKey)} className="focus-ring rounded text-left">
              <p className="text-sm font-semibold text-funktion-blue">{longDayNames[(day.getDay() + 6) % 7]}</p>
              <p className="mt-1 text-2xl font-semibold text-black">{day.getDate()}</p>
            </button>

            {dayEvents.length > 0 ? (
              <div className="grid gap-2">
                {dayEvents.map((event) => (
                  <EventMiniCard key={event.id} event={event} onEdit={onEdit} />
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onCreate(dateKey)}
                className="focus-ring rounded border border-dashed border-funktion-line p-3 text-left text-sm text-black/55"
              >
                Ingen aftaler
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  upcomingEvents,
  previousEvents,
  onEdit
}: {
  upcomingEvents: CalendarEvent[];
  previousEvents: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <h3 className="text-lg font-semibold text-funktion-blue">Kommende aftaler</h3>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} onEdit={onEdit} />
            ))}
          </div>
        ) : (
          <EmptyState text="Der er ingen kommende aftaler." />
        )}
      </div>

      <div className="grid gap-3">
        <h3 className="text-lg font-semibold text-funktion-blue">Tidligere aftaler</h3>
        {previousEvents.length > 0 ? (
          <div className="grid gap-3">
            {previousEvents.map((event) => (
              <EventCard key={event.id} event={event} onEdit={onEdit} />
            ))}
          </div>
        ) : (
          <EmptyState text="Tidligere aftaler vises her, når starttidspunktet er passeret." />
        )}
      </div>
    </div>
  );
}

function EventMiniCard({ event, onEdit }: { event: CalendarEvent; onEdit: (event: CalendarEvent) => void }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(event)}
      className={`focus-ring rounded border border-l-4 bg-white p-3 text-left shadow-sm ${typeStyles[event.event_type].border}`}
    >
      <p className="text-xs font-semibold text-black/60">{eventTime(event)}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-black">{event.title}</p>
    </button>
  );
}

function EventCard({
  event,
  compact = false,
  onEdit
}: {
  event: CalendarEvent;
  compact?: boolean;
  onEdit: (event: CalendarEvent) => void;
}) {
  return (
    <article className={`rounded border border-l-4 bg-white p-4 ${typeStyles[event.event_type].border}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded border px-3 py-1 text-xs font-semibold ${typeStyles[event.event_type].badge}`}>
              {typeLabel(event.event_type)}
            </span>
            <span className="rounded border border-funktion-line px-3 py-1 text-xs font-semibold text-black/70">
              {statusLabel(event.status)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-funktion-blue">{event.title}</h3>
          <p className="mt-1 text-sm leading-6 text-black/70">
            {eventDateLabel(event)} · {eventTime(event)}
            {event.all_day ? "" : ` - ${eventEndTime(event)}`}
          </p>
          {!compact && event.location ? <p className="mt-1 text-sm leading-6 text-black/70">Sted: {event.location}</p> : null}
          {!compact && event.description ? <p className="mt-3 leading-7 text-black/75">{event.description}</p> : null}
        </div>

        <button
          type="button"
          onClick={() => onEdit(event)}
          className="focus-ring rounded border border-funktion-line px-4 py-2 text-sm font-semibold text-funktion-blue"
        >
          Rediger
        </button>
      </div>
    </article>
  );
}

function EventModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const event = modal.event;
  const [dateKey, setDateKey] = useState(event ? toDateInputValue(event.start_time) : modal.dateKey);
  const [startTime, setStartTime] = useState(event ? toTimeInputValue(event.start_time) : "09:00");
  const [endTime, setEndTime] = useState(event ? toTimeInputValue(event.end_time) : "10:00");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const formId = `calendar-event-form-${event?.id ?? "new"}`;
  const action = event ? updateCalendarEvent : createCalendarEvent;

  function updateStartTime(value: string) {
    setStartTime(value);

    if (!event) {
      setEndTime(defaultEndTime(value));
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t bg-white shadow-2xl sm:max-w-2xl sm:rounded">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-funktion-line bg-white p-5">
          <div>
            <h2 className="text-2xl font-semibold text-funktion-blue">
              {event ? "Rediger aftale" : "Ny aftale"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-black/65">Gem det vigtigste først. Flere detaljer kan foldes ud.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-funktion-line text-funktion-blue"
            aria-label="Luk"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <form id={formId} action={action} className="grid gap-5">
            {event ? <input type="hidden" name="event_id" value={event.id} /> : null}
            <input type="hidden" name="start_time" value={combineDateAndTime(dateKey, allDay ? "00:00" : startTime)} />
            <input type="hidden" name="end_time" value={combineDateAndTime(dateKey, allDay ? "23:59" : endTime)} />

            <label className="grid gap-2">
              <span className="font-medium text-black">Titel</span>
              <input
                name="title"
                required
                defaultValue={event?.title ?? ""}
                placeholder="Fx møde med sagsbehandler"
                className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-medium text-black">Type</span>
                <select
                  name="event_type"
                  defaultValue={event?.event_type ?? "meeting"}
                  className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-medium text-black">Dato</span>
                <input
                  type="date"
                  required
                  value={dateKey}
                  onChange={(changeEvent) => setDateKey(changeEvent.target.value)}
                  className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-medium text-black">Starttid</span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(changeEvent) => updateStartTime(changeEvent.target.value)}
                  disabled={allDay}
                  className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black disabled:bg-black/5"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium text-black">Sluttid</span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(changeEvent) => setEndTime(changeEvent.target.value)}
                  disabled={allDay}
                  className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black disabled:bg-black/5"
                />
              </label>
            </div>

            <details className="rounded border border-funktion-line p-4">
              <summary className="cursor-pointer font-semibold text-funktion-blue">Avancerede felter</summary>

              <div className="mt-4 grid gap-5">
                <label className="grid gap-2">
                  <span className="font-medium text-black">Sted</span>
                  <input
                    name="location"
                    defaultValue={event?.location ?? ""}
                    className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="font-medium text-black">Beskrivelse</span>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={event?.description ?? ""}
                    className="focus-ring min-h-28 rounded border border-funktion-line bg-white px-4 py-3 leading-7 text-black"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium text-black">Status</span>
                    <select
                      name="status"
                      defaultValue={event?.status ?? "planned"}
                      className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
                    >
                      {eventStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium text-black">Synlighed</span>
                    <select
                      name="visibility"
                      defaultValue={event?.visibility ?? "private"}
                      disabled={Boolean(event)}
                      className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black disabled:bg-black/5"
                    >
                      <option value="private">Privat</option>
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
                  <input
                    type="checkbox"
                    name="all_day"
                    checked={allDay}
                    onChange={(changeEvent) => setAllDay(changeEvent.target.checked)}
                    className="h-5 w-5 accent-funktion-blue"
                  />
                  <span>Heldagsbegivenhed</span>
                </label>
              </div>
            </details>
          </form>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-funktion-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {event ? (
                <>
                  <StatusForm eventId={event.id} status="completed" label="Gennemført" icon={<Check className="h-4 w-4" />} />
                  <StatusForm eventId={event.id} status="cancelled" label="Aflys" icon={<X className="h-4 w-4" />} />
                  <form action={deleteCalendarEvent}>
                    <input type="hidden" name="event_id" value={event.id} />
                    <button type="submit" className="rounded border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
                      Slet
                    </button>
                  </form>
                </>
              ) : null}
            </div>

            <button type="submit" form={formId} className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white">
              Gem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusForm({
  eventId,
  status,
  label,
  icon
}: {
  eventId: string;
  status: CalendarEventStatus;
  label: string;
  icon: ReactNode;
}) {
  return (
    <form action={updateCalendarEventStatus}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded border border-funktion-line px-4 py-2 text-sm font-semibold text-funktion-blue"
      >
        {icon}
        {label}
      </button>
    </form>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded border border-dashed border-funktion-line p-5 text-sm leading-6 text-black/70">{text}</p>;
}
