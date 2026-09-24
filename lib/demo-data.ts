import type { DiaryEntry, DiaryNote, WorkTask } from "@/types/database";

export const demoDiaryEntries: DiaryEntry[] = [
  {
    id: "demo-entry-1",
    citizen_id: "demo-citizen",
    entry_date: "2026-06-10",
    status: "completed",
    home_day: "Rolig morgen med lavt tempo. Havde behov for hvile før praktik.",
    sleep: "Afbrudt nattesøvn og tidlig opvågning.",
    went_back_to_bed: true,
    fatigue_wakeup: 8,
    fatigue_getting_up: 7,
    fatigue_daytime: 6,
    fatigue_bedtime: 8,
    mental_wakeup: 6,
    mental_getting_up: 5,
    mental_daytime: 6,
    mental_bedtime: 5,
    pain_level: 4,
    pain_limitations: "Behov for pauser efter aktivitet.",
    home_planned_tasks: "Personlig pleje og let oprydning.",
    home_completed_tasks: "Tandbørstning, påklædning og kort oprydning.",
    went_well_home: "Kom afsted til planlagt tid.",
    mentally_challenging: "Bekymring før fremmøde.",
    coping: "Brugte pause og forberedte tasken i god tid.",
    tomorrow_takeaway: "Fortsætte med rolig start.",
    personal_care: ["Børste tænder", "Påklædning"],
    important_comments: "Første praktikdag.",
    was_practice_day: true,
    actual_start_time: "09:00",
    actual_end_time: "11:30",
    total_work_minutes: 150,
    absence: false,
    absence_reason: null,
    skipped_or_stopped_tasks: "Stoppede en sorteringsopgave efter øget pres.",
    pressured_tasks: "Nye instruktioner med flere trin.",
    limited_tasks: "Opgaver med mange samtidige input.",
    went_well_work: "Mødte stabilt og gennemførte planlagt tid.",
    difficult_work: "Behov for tydelige pauser.",
    workload_fit: "Delvist passende.",
    break_count: 2,
    break_length: "10 minutter",
    break_description: "Stille pause uden samtale.",
    collaboration: "God kontakt med kontaktperson.",
    work_pressure: 6,
    function_level: 5,
    work_notes: "Behov for afgrænsede opgaver.",
    locked_at: null,
    created_at: "2026-06-10T12:00:00Z",
    updated_at: "2026-06-10T12:00:00Z"
  }
];

export const demoNotes: DiaryNote[] = [
  {
    id: "demo-note-1",
    diary_entry_id: "demo-entry-1",
    author_id: "demo-citizen",
    author_role: "citizen",
    body: "Jeg var træt efter hjemkomst og måtte hvile resten af dagen.",
    created_at: "2026-06-10T14:15:00Z"
  }
];

export const demoWorkTasks: WorkTask[] = [
  {
    id: "demo-task-1",
    diary_entry_id: "demo-entry-1",
    title: "Sortering af materialer",
    status: "Delvist udført",
    created_at: "2026-06-10T11:30:00Z"
  }
];
