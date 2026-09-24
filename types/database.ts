export type UserRole = "citizen" | "representative" | "administrator" | "ukendt";
export type DatabaseUserRole = Exclude<UserRole, "ukendt">;
export type LegacyUserRole = UserRole | "borger" | "admin" | "partsrepraesentant";
export type DiaryStatus = "draft" | "completed" | "reviewed_by_admin" | "locked";
export type FunctionalDescriptionStatus = "draft" | "for_review" | "approved" | "exported";
export type AiAnalysisStatus = "draft" | "generated" | "reviewed" | "approved" | "used_in_report";
export type AiRiskLevel = "green" | "yellow" | "red" | "neutral";
export type AuditAction =
  | "login"
  | "diary_created"
  | "diary_updated"
  | "diary_locked"
  | "admin_note_created"
  | "attachment_uploaded"
  | "ai_generated"
  | "ai_analysis_administrator_comment_updated"
  | "representative_application_approved"
  | "representative_application_rejected"
  | "representative_application_suspended"
  | "representative_application_reopened"
  | "representative_application_reactivated"
  | "pdf_exported"
  | "data_deleted"
  | "consent_accepted"
  | "deletion_requested";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: DatabaseUserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: DatabaseUserRole;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: DatabaseUserRole;
        };
      };
      citizens: {
        Row: Citizen;
        Insert: Partial<Citizen> & { user_id: string; citizen_name: string };
        Update: Partial<Citizen>;
      };
      diary_entries: {
        Row: DiaryEntry;
        Insert: Partial<DiaryEntry> & { citizen_id: string; entry_date: string };
        Update: Partial<DiaryEntry>;
      };
      diary_notes: {
        Row: DiaryNote;
        Insert: Partial<DiaryNote> & { diary_entry_id: string; author_id: string; body: string };
        Update: Partial<DiaryNote>;
      };
      practice_schedule: {
        Row: PracticeScheduleDay;
        Insert: Partial<PracticeScheduleDay> & { citizen_id: string; planned_date: string };
        Update: Partial<PracticeScheduleDay>;
      };
      audit_logs: {
        Row: {
          id: string;
          action: AuditAction;
          actor_id: string | null;
          citizen_id: string | null;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Record<string, unknown>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          action: AuditAction;
          actor_id?: string | null;
          citizen_id?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Record<string, never>;
      };
      ai_summaries: {
        Row: {
          id: string;
          citizen_id: string;
          period_start: string;
          period_end: string;
          summary: Record<string, unknown>;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          citizen_id: string;
          period_start: string;
          period_end: string;
          summary: Record<string, unknown>;
          created_by?: string | null;
        };
        Update: Record<string, never>;
      };
      ai_analyses: {
        Row: AiAnalysis;
        Insert: Partial<AiAnalysis> & { citizen_id: string; analysis_type: string; version_number: number };
        Update: Partial<AiAnalysis>;
      };
      pdf_exports: {
        Row: PdfExport;
        Insert: Omit<PdfExport, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Pick<PdfExport, "file_name" | "options">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AiAnalysis = {
  id: string;
  citizen_id: string;
  generated_by: string | null;
  analysis_type: string;
  period_start: string | null;
  period_end: string | null;
  version_number: number;
  status: AiAnalysisStatus;
  risk_level: AiRiskLevel;
  title: string | null;
  summary: string | null;
  observations: unknown;
  patterns: unknown;
  functional_themes: unknown;
  support_needs: unknown;
  critical_observations: unknown;
  citizen_reflection: unknown;
  administrator_comment: string | null;
  approved_by: string | null;
  approved_at: string | null;
  used_in_report: boolean;
  prompt_version: string | null;
  model_used: string | null;
  created_at: string;
  updated_at: string;
};

export type DiaryEntry = {
  id: string;
  citizen_id: string;
  entry_date: string;
  status: DiaryStatus;
  home_day: string | null;
  sleep: string | null;
  went_back_to_bed: boolean | null;
  fatigue_wakeup: number | null;
  fatigue_getting_up: number | null;
  fatigue_daytime: number | null;
  fatigue_bedtime: number | null;
  mental_wakeup: number | null;
  mental_getting_up: number | null;
  mental_daytime: number | null;
  mental_bedtime: number | null;
  pain_level: number | null;
  pain_limitations: string | null;
  home_planned_tasks: string | null;
  home_completed_tasks: string | null;
  went_well_home: string | null;
  mentally_challenging: string | null;
  coping: string | null;
  tomorrow_takeaway: string | null;
  personal_care: string[];
  important_comments: string | null;
  was_practice_day: boolean;
  actual_start_time: string | null;
  actual_end_time: string | null;
  total_work_minutes: number | null;
  absence: boolean;
  absence_reason: string | null;
  skipped_or_stopped_tasks: string | null;
  pressured_tasks: string | null;
  limited_tasks: string | null;
  went_well_work: string | null;
  difficult_work: string | null;
  workload_fit: string | null;
  break_count: number | null;
  break_length: string | null;
  break_description: string | null;
  collaboration: string | null;
  work_pressure: number | null;
  function_level: number | null;
  work_notes: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Citizen = {
  id: string;
  user_id: string;
  citizen_name: string;
  birth_year: number | null;
  practice_place: string | null;
  contact_person: string | null;
  administrator_name: string | null;
  practice_start_date: string | null;
  practice_end_date: string | null;
  weekly_hours: number | null;
  health_information: string | null;
  created_at: string;
  updated_at: string | null;
};

export type DiaryNote = {
  id: string;
  diary_entry_id: string;
  author_id: string;
  author_role: LegacyUserRole;
  body: string;
  created_at: string;
};

export type WorkTask = {
  id: string;
  diary_entry_id: string;
  title: string;
  status: "Udført" | "Delvist udført" | "Forsøgt men stoppet" | "Sprunget over" | "Udført med støtte";
  created_at: string;
};

export type PracticeScheduleDay = {
  id: string;
  citizen_id: string;
  planned_date: string;
  planned_start_time: string | null;
  planned_end_time: string | null;
  planned_minutes: number;
  is_practice_day: boolean;
  created_at: string;
};

export type PdfExport = {
  id: string;
  citizen_id: string;
  exported_by: string | null;
  document_type: string;
  period_start: string | null;
  period_end: string | null;
  version_number: number;
  file_name: string;
  file_path: string | null;
  options: Record<string, unknown> | null;
  created_at: string;
};
