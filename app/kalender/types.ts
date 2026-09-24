export type CalendarEventType =
  | "practice"
  | "meeting"
  | "reminder"
  | "absence"
  | "vacation"
  | "follow_up"
  | "other";

export type CalendarEventStatus = "planned" | "completed" | "cancelled" | "missed";

export type CalendarEvent = {
  id: string;
  citizen_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_type: CalendarEventType;
  status: CalendarEventStatus;
  visibility: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
};

export const eventTypes: Array<{ value: CalendarEventType; label: string }> = [
  { value: "practice", label: "Praktik" },
  { value: "meeting", label: "Møde" },
  { value: "reminder", label: "Påmindelse" },
  { value: "absence", label: "Fravær" },
  { value: "vacation", label: "Ferie" },
  { value: "follow_up", label: "Opfølgning" },
  { value: "other", label: "Andet" }
];

export const eventStatuses: Array<{ value: CalendarEventStatus; label: string }> = [
  { value: "planned", label: "Planlagt" },
  { value: "completed", label: "Gennemført" },
  { value: "cancelled", label: "Aflyst" },
  { value: "missed", label: "Udeblevet" }
];
