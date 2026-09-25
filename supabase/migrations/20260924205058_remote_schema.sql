SET local check_function_bodies = off;

CREATE EXTENSION "pg_cron";

CREATE TABLE "public"."ai_analyses" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"            uuid                     NOT NULL,
  "generated_by"          uuid,
  "analysis_type"         text                     NOT NULL,
  "period_start"          date,
  "period_end"            date,
  "version_number"        integer                  NOT NULL DEFAULT 1,
  "status"                text                     NOT NULL DEFAULT 'draft'::text,
  "risk_level"            text                     DEFAULT 'neutral'::text,
  "title"                 text,
  "summary"               text,
  "observations"          jsonb,
  "patterns"              jsonb,
  "functional_themes"     jsonb,
  "support_needs"         jsonb,
  "critical_observations" jsonb,
  "citizen_reflection"    jsonb,
  "administrator_comment" text,
  "approved_by"           uuid,
  "approved_at"           timestamp with time zone,
  "used_in_report"        boolean                  DEFAULT false,
  "prompt_version"        text,
  "model_used"            text,
  "created_at"            timestamp with time zone DEFAULT now(),
  "updated_at"            timestamp with time zone DEFAULT now(),
  CONSTRAINT "ai_analyses_pkey" PRIMARY KEY (id),
  CONSTRAINT "ai_analyses_risk_level_check" CHECK ((risk_level = ANY (ARRAY['green'::text, 'yellow'::text, 'red'::text, 'neutral'::text]))),
  CONSTRAINT "ai_analyses_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'generated'::text, 'reviewed'::text, 'approved'::text, 'used_in_report'::text])))
);

ALTER TABLE "public"."ai_analyses"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."ai_summaries" (
  "id"                                 uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"                         uuid                     NOT NULL,
  "period_start"                       date,
  "period_end"                         date,
  "source_diary_entry_id"              uuid,
  "objective_observations"             text,
  "citizen_own_descriptions"           text,
  "patterns_over_time"                 text,
  "support_needs"                      text,
  "development"                        text,
  "functional_description_suggestions" text,
  "date_citations"                     jsonb                    DEFAULT '[]'::jsonb,
  "generated_by_ai"                    boolean                  NOT NULL DEFAULT true,
  "generated_at"                       timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"                         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ai_summaries_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."ai_summaries"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."attachments" (
  "id"             uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"     uuid                     NOT NULL,
  "diary_entry_id" uuid,
  "file_name"      text                     NOT NULL,
  "file_path"      text                     NOT NULL,
  "file_type"      text,
  "file_size"      bigint,
  "uploaded_by"    uuid                     NOT NULL,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "attachments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."attachments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."audit_logs" (
  "id"         uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"    uuid,
  "citizen_id" uuid,
  "action"     text                     NOT NULL,
  "table_name" text,
  "record_id"  uuid,
  "metadata"   jsonb                    DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."audit_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."beta_users" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "beta_group"         text,
  "status"             text                     NOT NULL DEFAULT 'active'::text,
  "role_at_beta_start" text,
  "internal_note"      text,
  "created_by"         uuid,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "beta_users_pkey" PRIMARY KEY (id),
  CONSTRAINT "beta_users_status_check" CHECK ((status = ANY (ARRAY['invited'::text, 'active'::text, 'completed'::text, 'suspended'::text])))
);

ALTER TABLE "public"."beta_users"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."bugs" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "feedback_id" uuid,
  "title"       text                     NOT NULL,
  "description" text                     NOT NULL,
  "severity"    text,
  "status"      text                     NOT NULL DEFAULT 'open'::text,
  "assigned_to" uuid,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "bugs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."bugs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."calendar_events" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"        uuid,
  "representative_id" uuid,
  "created_by"        uuid                     NOT NULL,
  "title"             text                     NOT NULL,
  "description"       text,
  "location"          text,
  "event_type"        text                     NOT NULL DEFAULT 'other'::text,
  "status"            text                     NOT NULL DEFAULT 'planned'::text,
  "visibility"        text                     NOT NULL DEFAULT 'private'::text,
  "start_time"        timestamp with time zone NOT NULL,
  "end_time"          timestamp with time zone,
  "all_day"           boolean                  NOT NULL DEFAULT false,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "source"            text                     NOT NULL DEFAULT 'manual'::text,
  "source_ref"        text,
  CONSTRAINT "calendar_events_event_type_check"
    CHECK ((event_type = ANY (ARRAY['practice'::text, 'meeting'::text, 'reminder'::text, 'absence'::text, 'vacation'::text, 'follow_up'::text, 'other'::text]))),
  CONSTRAINT "calendar_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "calendar_events_status_check" CHECK ((status = ANY (ARRAY['planned'::text, 'completed'::text, 'cancelled'::text, 'missed'::text]))),
  CONSTRAINT "calendar_events_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'shared_with_representative'::text, 'shared_with_citizen'::text])))
);

ALTER TABLE "public"."calendar_events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_case_notes" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"        uuid                     NOT NULL,
  "representative_id" uuid,
  "author_id"         uuid                     NOT NULL,
  "note_type"         text                     NOT NULL DEFAULT 'other'::text,
  "title"             text,
  "body"              text                     NOT NULL,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_case_notes_note_type_check"
    CHECK ((note_type = ANY (ARRAY['meeting'::text, 'phone'::text, 'observation'::text, 'agreement'::text, 'follow_up'::text, 'other'::text]))),
  CONSTRAINT "citizen_case_notes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_case_notes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_consents" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"             uuid                     NOT NULL,
  "data_processing"        boolean                  NOT NULL DEFAULT false,
  "representative_sharing" boolean                  NOT NULL DEFAULT false,
  "ai_analysis"            boolean                  NOT NULL DEFAULT false,
  "notifications"          boolean                  NOT NULL DEFAULT false,
  "accepted_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_consents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_consents"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_contacts" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"   uuid                     NOT NULL,
  "contact_type" text                     NOT NULL,
  "name"         text,
  "phone"        text,
  "email"        text,
  "notes"        text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_contacts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_contacts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_employment" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"              uuid                     NOT NULL,
  "in_practice"             boolean                  NOT NULL DEFAULT false,
  "practice_company"        text,
  "practice_start_date"     date,
  "practice_end_date"       date,
  "practice_hours_per_week" numeric,
  "practice_contact_person" text,
  "job_clarification"       boolean                  NOT NULL DEFAULT false,
  "resource_program"        boolean                  NOT NULL DEFAULT false,
  "sick_leave"              boolean                  NOT NULL DEFAULT false,
  "cash_benefits"           boolean                  NOT NULL DEFAULT false,
  "sickness_benefits"       boolean                  NOT NULL DEFAULT false,
  "disability_pension"      boolean                  NOT NULL DEFAULT false,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "practice_weekdays"       text[]                   NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT "citizen_employment_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_employment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_function_profile" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"  uuid                     NOT NULL,
  "category"    text                     NOT NULL,
  "title"       text                     NOT NULL,
  "severity"    text                     NOT NULL,
  "description" text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_function_profile_pkey" PRIMARY KEY (id),
  CONSTRAINT "citizen_function_profile_severity_check" CHECK ((severity = ANY (ARRAY['light'::text, 'moderate'::text, 'severe'::text, 'very_severe'::text])))
);

ALTER TABLE "public"."citizen_function_profile"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_goals" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"  uuid                     NOT NULL,
  "goal_type"   text,
  "custom_goal" text,
  "active"      boolean                  NOT NULL DEFAULT true,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_goals_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_goals"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_onboarding" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"           uuid                     NOT NULL,
  "onboarding_completed" boolean                  NOT NULL DEFAULT false,
  "current_step"         integer                  NOT NULL DEFAULT 1,
  "completed_at"         timestamp with time zone,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_onboarding_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizen_onboarding"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizen_representative_links" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"        uuid                     NOT NULL,
  "representative_id" uuid                     NOT NULL,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "requested_by"      uuid,
  "approved_by"       uuid,
  "started_at"        timestamp with time zone,
  "ended_at"          timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_representative_links_pkey" PRIMARY KEY (id),
  CONSTRAINT "citizen_representative_links_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'ended'::text, 'suspended'::text])))
);

ALTER TABLE "public"."citizen_representative_links"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."citizens" (
  "id"                      uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"                 uuid                     NOT NULL,
  "citizen_name"            text                     NOT NULL,
  "birth_year"              integer,
  "practice_place"          text,
  "contact_person"          text,
  "administrator_name"      text,
  "practice_start_date"     date                     NOT NULL DEFAULT '2026-06-10'::date,
  "practice_end_date"       date,
  "weekly_hours"            numeric(4,2)             NOT NULL DEFAULT 7.5,
  "health_information"      text,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "phone"                   text,
  "municipality"            text,
  "consent_terms"           boolean                  NOT NULL DEFAULT false,
  "consent_data_processing" boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "citizens_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."citizens"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."consents" (
  "id"           uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"   uuid                     NOT NULL,
  "user_id"      uuid                     NOT NULL,
  "consent_text" text                     NOT NULL,
  "accepted"     boolean                  NOT NULL DEFAULT false,
  "accepted_at"  timestamp with time zone,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "consents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."consents"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."deletion_requests" (
  "id"           uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"   uuid                     NOT NULL,
  "requested_by" uuid                     NOT NULL,
  "reason"       text,
  "handled_by"   uuid,
  "handled_at"   timestamp with time zone,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "deletion_requests_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."deletion_requests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."diary_entries" (
  "id"                       uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"               uuid                     NOT NULL,
  "entry_date"               date                     NOT NULL,
  "home_day_description"     text,
  "sleep_description"        text,
  "went_back_to_bed"         boolean,
  "fatigue_waking"           integer,
  "fatigue_getting_up"       integer,
  "fatigue_daytime"          integer,
  "fatigue_bedtime"          integer,
  "mental_waking"            integer,
  "mental_getting_up"        integer,
  "mental_daytime"           integer,
  "mental_bedtime"           integer,
  "pain_level_daytime"       integer,
  "pain_limitations"         text,
  "planned_home_tasks"       text,
  "completed_home_tasks"     text,
  "what_went_well"           text,
  "psychological_challenges" text,
  "challenge_handling"       text,
  "take_to_tomorrow"         text,
  "hygiene_brushed_teeth"    boolean                  DEFAULT false,
  "hygiene_brushed_hair"     boolean                  DEFAULT false,
  "hygiene_body_wash"        boolean                  DEFAULT false,
  "hygiene_hair_wash"        boolean                  DEFAULT false,
  "hygiene_makeup"           boolean                  DEFAULT false,
  "hygiene_dressing"         boolean                  DEFAULT false,
  "other_important_comments" text,
  "had_practice_day"         boolean                  DEFAULT false,
  "actual_start_time"        time without time zone,
  "actual_end_time"          time without time zone,
  "calculated_work_minutes"  integer,
  "absence"                  boolean                  DEFAULT false,
  "absence_reason"           text,
  "skipped_or_stopped_tasks" text,
  "pressured_tasks"          text,
  "limited_tasks"            text,
  "work_went_well"           text,
  "work_difficulties"        text,
  "workload_suitable"        text,
  "break_count"              integer,
  "break_total_minutes"      integer,
  "break_description"        text,
  "colleague_cooperation"    text,
  "pressure_level"           integer,
  "functional_level"         integer,
  "work_notes"               text,
  "locked_at"                timestamp with time zone,
  "created_by"               uuid,
  "updated_by"               uuid,
  "created_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "reopened_until"           timestamp with time zone,
  CONSTRAINT "diary_entries_citizen_id_entry_date_key" UNIQUE (citizen_id, entry_date),
  CONSTRAINT "diary_entries_fatigue_bedtime_check" CHECK (((fatigue_bedtime >= 1) AND (fatigue_bedtime <= 10))),
  CONSTRAINT "diary_entries_fatigue_daytime_check" CHECK (((fatigue_daytime >= 1) AND (fatigue_daytime <= 10))),
  CONSTRAINT "diary_entries_fatigue_getting_up_check" CHECK (((fatigue_getting_up >= 1) AND (fatigue_getting_up <= 10))),
  CONSTRAINT "diary_entries_fatigue_waking_check" CHECK (((fatigue_waking >= 1) AND (fatigue_waking <= 10))),
  CONSTRAINT "diary_entries_functional_level_check" CHECK (((functional_level >= 1) AND (functional_level <= 10))),
  CONSTRAINT "diary_entries_mental_bedtime_check" CHECK (((mental_bedtime >= 1) AND (mental_bedtime <= 10))),
  CONSTRAINT "diary_entries_mental_daytime_check" CHECK (((mental_daytime >= 1) AND (mental_daytime <= 10))),
  CONSTRAINT "diary_entries_mental_getting_up_check" CHECK (((mental_getting_up >= 1) AND (mental_getting_up <= 10))),
  CONSTRAINT "diary_entries_mental_waking_check" CHECK (((mental_waking >= 1) AND (mental_waking <= 10))),
  CONSTRAINT "diary_entries_pain_level_daytime_check" CHECK (((pain_level_daytime >= 1) AND (pain_level_daytime <= 10))),
  CONSTRAINT "diary_entries_pkey" PRIMARY KEY (id),
  CONSTRAINT "diary_entries_pressure_level_check" CHECK (((pressure_level >= 1) AND (pressure_level <= 10)))
);

ALTER TABLE "public"."diary_entries"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."diary_notes" (
  "id"             uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "diary_entry_id" uuid                     NOT NULL,
  "author_id"      uuid                     NOT NULL,
  "note_text"      text                     NOT NULL,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "diary_notes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."diary_notes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."documents" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"  uuid                     NOT NULL,
  "uploaded_by" uuid                     NOT NULL,
  "category"    text                     NOT NULL DEFAULT 'andet'::text,
  "title"       text,
  "file_name"   text                     NOT NULL,
  "file_path"   text                     NOT NULL,
  "mime_type"   text,
  "file_size"   integer,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "documents_category_check" CHECK ((category = ANY (ARRAY['laege'::text, 'jobcenter'::text, 'praktik'::text, 'moede'::text, 'afgoerelse'::text, 'andet'::text]))),
  CONSTRAINT "documents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."documents"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."feedback_items" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "type"           text                     NOT NULL,
  "title"          text                     NOT NULL,
  "description"    text                     NOT NULL,
  "status"         text                     NOT NULL DEFAULT 'new'::text,
  "severity"       text,
  "screenshot_url" text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "feedback_items_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."feedback_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."functional_description_versions" (
  "id"                        uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "functional_description_id" uuid                     NOT NULL,
  "version_number"            integer                  NOT NULL,
  "snapshot"                  jsonb                    NOT NULL,
  "created_by"                uuid,
  "created_at"                timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "functional_description_versio_functional_description_id_ver_key" UNIQUE (functional_description_id, version_number),
  CONSTRAINT "functional_description_versions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."functional_description_versions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."functional_descriptions" (
  "id"                                 uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"                         uuid                     NOT NULL,
  "section_1_primary_challenges"       text,
  "section_2_daily_rhythm_routines"    text,
  "section_3_shopping_cooking_meals"   text,
  "section_4_cleaning_laundry_bedding" text,
  "section_5_personal_care"            text,
  "section_6_house_garden_work"        text,
  "section_7_transport"                text,
  "section_8_communication"            text,
  "section_9_social_relations"         text,
  "section_10_development_options"     text,
  "ai_updated_at"                      timestamp with time zone,
  "approved_at"                        timestamp with time zone,
  "exported_at"                        timestamp with time zone,
  "created_by"                         uuid,
  "updated_by"                         uuid,
  "created_at"                         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "functional_descriptions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."functional_descriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."messages" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id" uuid                     NOT NULL,
  "sender_id"  uuid                     NOT NULL,
  "body"       text                     NOT NULL,
  "read_at"    timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "messages_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."messages"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."pdf_exports" (
  "id"             uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"     uuid                     NOT NULL,
  "exported_by"    uuid                     NOT NULL,
  "document_type"  text                     NOT NULL,
  "period_start"   date,
  "period_end"     date,
  "file_path"      text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "version_number" integer                  NOT NULL DEFAULT 1,
  "file_name"      text                     NOT NULL,
  "options"        jsonb,
  CONSTRAINT "pdf_exports_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."pdf_exports"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."practice_periods" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"        uuid                     NOT NULL,
  "title"             text                     NOT NULL DEFAULT 'Praktikforløb'::text,
  "practice_place"    text,
  "contact_person"    text,
  "start_date"        date,
  "end_date"          date,
  "weekly_hours"      numeric(5,2),
  "monday_minutes"    integer,
  "wednesday_minutes" integer,
  "friday_minutes"    integer,
  "status"            text                     NOT NULL DEFAULT 'planned'::text,
  "notes"             text,
  "created_by"        uuid,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "practice_periods_pkey" PRIMARY KEY (id),
  CONSTRAINT "practice_periods_status_check" CHECK ((status = ANY (ARRAY['planned'::text, 'active'::text, 'ended'::text])))
);

ALTER TABLE "public"."practice_periods"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."practice_schedule" (
  "id"            uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "citizen_id"    uuid                     NOT NULL,
  "weekday"       integer                  NOT NULL,
  "planned_hours" numeric(4,2)             NOT NULL DEFAULT 2.5,
  "active_from"   date                     NOT NULL DEFAULT '2026-06-10'::date,
  "active_to"     date,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "practice_schedule_pkey" PRIMARY KEY (id),
  CONSTRAINT "practice_schedule_weekday_check" CHECK (((weekday >= 1) AND (weekday <= 7)))
);

ALTER TABLE "public"."practice_schedule"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"         uuid                     NOT NULL,
  "email"      text,
  "full_name"  text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."representative_applications" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"                text                     NOT NULL,
  "email"               text                     NOT NULL,
  "phone"               text                     NOT NULL,
  "role_title"          text                     NOT NULL,
  "company_name"        text,
  "cvr"                 text,
  "city_area"           text,
  "website"             text,
  "profile_text"        text,
  "reason"              text                     NOT NULL,
  "status"              text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "admin_note"          text,
  "decided_at"          timestamp with time zone,
  "decided_by"          uuid,
  "invited_user_id"     uuid,
  "onboarding_unlocked" boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "representative_applications_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."representative_invitations" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "representative_id" uuid                     NOT NULL,
  "email"             text                     NOT NULL,
  "invitation_code"   text                     NOT NULL,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "expires_at"        timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "representative_invitations_invitation_code_key" UNIQUE (invitation_code),
  CONSTRAINT "representative_invitations_pkey" PRIMARY KEY (id),
  CONSTRAINT "representative_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."representative_invitations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."representative_profiles" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"             uuid                     NOT NULL,
  "display_name"        text                     NOT NULL,
  "email"               text                     NOT NULL,
  "phone"               text,
  "company_name"        text,
  "cvr"                 text,
  "city"                text,
  "area"                text,
  "profile_text"        text,
  "specialties"         text[]                   NOT NULL DEFAULT '{}'::text[],
  "price_text"          text,
  "website"             text,
  "accepts_new_clients" boolean                  NOT NULL DEFAULT false,
  "public_profile"      boolean                  NOT NULL DEFAULT false,
  "verified"            boolean                  NOT NULL DEFAULT false,
  "approved_by_admin"   boolean                  NOT NULL DEFAULT false,
  "suspended"           boolean                  NOT NULL DEFAULT false,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "representative_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "representative_profiles_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."representative_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."representative_requests" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "citizen_id"        uuid                     NOT NULL,
  "representative_id" uuid                     NOT NULL,
  "message"           text,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "handled_at"        timestamp with time zone,
  CONSTRAINT "representative_requests_pkey" PRIMARY KEY (id),
  CONSTRAINT "representative_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."representative_requests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."subscription_accounts" (
  "id"                       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_user_id"            uuid                     NOT NULL,
  "owner_role"               text                     NOT NULL,
  "plan_key"                 text                     NOT NULL DEFAULT 'free'::text,
  "status"                   text                     NOT NULL DEFAULT 'inactive'::text,
  "external_customer_id"     text,
  "external_subscription_id" text,
  "created_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"               timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "subscription_accounts_owner_role_check" CHECK ((owner_role = ANY (ARRAY['citizen'::text, 'representative'::text, 'administrator'::text]))),
  CONSTRAINT "subscription_accounts_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscription_accounts_status_check" CHECK ((status = ANY (ARRAY['inactive'::text, 'trial'::text, 'active'::text, 'past_due'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."subscription_accounts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."work_tasks" (
  "id"                     uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "diary_entry_id"         uuid                     NOT NULL,
  "task_description"       text                     NOT NULL,
  "support_description"    text,
  "limitation_description" text,
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "work_tasks_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."work_tasks"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."app_role" AS ENUM (
  'citizen',
  'administrator'
);

CREATE TYPE "public"."attachment_context" AS ENUM (
  'diary_day',
  'practice_day',
  'functional_description'
);

ALTER TABLE "public"."attachments"
  ADD COLUMN "context" public.attachment_context NOT NULL;

CREATE TYPE "public"."deletion_request_status" AS ENUM (
  'requested',
  'processing',
  'completed',
  'rejected'
);

ALTER TABLE "public"."deletion_requests"
  ADD COLUMN "status" public.deletion_request_status NOT NULL DEFAULT 'requested'::public.deletion_request_status;

CREATE TYPE "public"."diary_status" AS ENUM (
  'draft',
  'completed',
  'reviewed_by_administrator',
  'locked'
);

ALTER TABLE "public"."diary_entries"
  ADD COLUMN "status" public.diary_status NOT NULL DEFAULT 'draft'::public.diary_status;

CREATE TYPE "public"."functional_description_status" AS ENUM (
  'draft',
  'for_review',
  'approved',
  'exported'
);

ALTER TABLE "public"."functional_descriptions"
  ADD COLUMN "status" public.functional_description_status NOT NULL DEFAULT 'draft'::public.functional_description_status;

CREATE TYPE "public"."task_status" AS ENUM (
  'completed',
  'partially_completed',
  'attempted_but_stopped',
  'skipped',
  'completed_with_support'
);

ALTER TABLE "public"."work_tasks"
  ADD COLUMN "status" public.task_status NOT NULL;

CREATE TYPE "public"."user_role" AS ENUM (
  'citizen',
  'administrator',
  'representative'
);

ALTER TABLE "public"."diary_notes"
  ADD COLUMN "author_role" public.user_role NOT NULL;

ALTER TABLE "public"."profiles"
  ADD COLUMN "role" public.user_role NOT NULL DEFAULT 'citizen'::public.user_role;

CREATE OR REPLACE FUNCTION public.calculate_work_minutes()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  if new.actual_start_time is not null and new.actual_end_time is not null then
    new.calculated_work_minutes :=
      extract(epoch from (new.actual_end_time - new.actual_start_time)) / 60;
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.can_access_citizen (
  citizen_uuid uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  AS $function$
  select public.is_administrator()
  or exists (
    select 1 from citizens
    where id = citizen_uuid
    and user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_edit_diary_entry (
  entry_date date
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  AS $function$
  SELECT
    (now() AT TIME ZONE 'Europe/Copenhagen')::date = entry_date
    AND (now() AT TIME ZONE 'Europe/Copenhagen')::time <= time '23:59:00';
$function$;

CREATE OR REPLACE FUNCTION public.can_represent_citizen (
  citizen_uuid uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.citizen_representative_links l
    JOIN public.representative_profiles r ON r.id = l.representative_id
    WHERE l.citizen_id = citizen_uuid
      AND r.user_id = auth.uid()
      AND l.status = 'active'
      AND r.suspended = false
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_default_practice_schedule (
  target_citizen_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  insert into practice_schedule (citizen_id, weekday, planned_hours, active_from)
  values
    (target_citizen_id, 1, 2.5, '2026-06-10'),
    (target_citizen_id, 3, 2.5, '2026-06-10'),
    (target_citizen_id, 5, 2.5, '2026-06-10')
  on conflict do nothing;
end;
$function$;

CREATE OR REPLACE FUNCTION public.current_user_role()
  RETURNS public.user_role
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  AS $function$
  select role from profiles where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'citizen'
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_administrator()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  AS $function$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'administrator'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_platform_administrator()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role::text = 'administrator'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_representative()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role::text = 'representative'
  );
$function$;

CREATE OR REPLACE FUNCTION public.owns_citizen (
  citizen_uuid uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  AS $function$
  select exists (
    select 1 from citizens
    where id = citizen_uuid
    and user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.write_audit_log (
  p_action     text,
  p_citizen_id uuid  DEFAULT NULL::uuid,
  p_table_name text  DEFAULT NULL::text,
  p_record_id  uuid  DEFAULT NULL::uuid,
  p_metadata   jsonb DEFAULT '{}'::jsonb
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.audit_logs (
    user_id,
    citizen_id,
    action,
    table_name,
    record_id,
    metadata
  )
  values (
    auth.uid(),
    p_citizen_id,
    p_action,
    p_table_name,
    p_record_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$function$;

ALTER TABLE "public"."ai_analyses"
  ADD CONSTRAINT "ai_analyses_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."ai_summaries"
  ADD CONSTRAINT "ai_summaries_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."attachments"
  ADD CONSTRAINT "attachments_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."audit_logs"
  ADD CONSTRAINT "audit_logs_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE SET NULL;

ALTER TABLE "public"."calendar_events"
  ADD CONSTRAINT "calendar_events_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_case_notes"
  ADD CONSTRAINT "citizen_case_notes_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_consents"
  ADD CONSTRAINT "citizen_consents_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_contacts"
  ADD CONSTRAINT "citizen_contacts_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_employment"
  ADD CONSTRAINT "citizen_employment_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_function_profile"
  ADD CONSTRAINT "citizen_function_profile_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_goals"
  ADD CONSTRAINT "citizen_goals_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_onboarding"
  ADD CONSTRAINT "citizen_onboarding_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_representative_links"
  ADD CONSTRAINT "citizen_representative_links_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."consents"
  ADD CONSTRAINT "consents_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."deletion_requests"
  ADD CONSTRAINT "deletion_requests_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."diary_entries"
  ADD CONSTRAINT "diary_entries_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."ai_summaries"
  ADD CONSTRAINT "ai_summaries_source_diary_entry_id_fkey" FOREIGN KEY (source_diary_entry_id) REFERENCES public.diary_entries(id) ON DELETE SET NULL;

ALTER TABLE "public"."attachments"
  ADD CONSTRAINT "attachments_diary_entry_id_fkey" FOREIGN KEY (diary_entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;

ALTER TABLE "public"."diary_notes"
  ADD CONSTRAINT "diary_notes_diary_entry_id_fkey" FOREIGN KEY (diary_entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;

ALTER TABLE "public"."documents"
  ADD CONSTRAINT "documents_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."bugs"
  ADD CONSTRAINT "bugs_feedback_id_fkey" FOREIGN KEY (feedback_id) REFERENCES public.feedback_items(id) ON DELETE SET NULL;

ALTER TABLE "public"."functional_descriptions"
  ADD CONSTRAINT "functional_descriptions_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."functional_description_versions"
  ADD CONSTRAINT "functional_description_versions_functional_description_id_fkey" FOREIGN KEY (functional_description_id) REFERENCES public.functional_descriptions(id)
    ON DELETE CASCADE;

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."pdf_exports"
  ADD CONSTRAINT "pdf_exports_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."practice_periods"
  ADD CONSTRAINT "practice_periods_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."practice_schedule"
  ADD CONSTRAINT "practice_schedule_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."ai_analyses"
  ADD CONSTRAINT "ai_analyses_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."ai_analyses"
  ADD CONSTRAINT "ai_analyses_generated_by_fkey" FOREIGN KEY (generated_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."attachments"
  ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."beta_users"
  ADD CONSTRAINT "beta_users_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."beta_users"
  ADD CONSTRAINT "beta_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."bugs"
  ADD CONSTRAINT "bugs_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."calendar_events"
  ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."citizen_case_notes"
  ADD CONSTRAINT "citizen_case_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id);

ALTER TABLE "public"."citizen_representative_links"
  ADD CONSTRAINT "citizen_representative_links_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."citizen_representative_links"
  ADD CONSTRAINT "citizen_representative_links_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."citizens"
  ADD CONSTRAINT "citizens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."consents"
  ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."deletion_requests"
  ADD CONSTRAINT "deletion_requests_handled_by_fkey" FOREIGN KEY (handled_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."deletion_requests"
  ADD CONSTRAINT "deletion_requests_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."diary_entries"
  ADD CONSTRAINT "diary_entries_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."diary_entries"
  ADD CONSTRAINT "diary_entries_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."diary_notes"
  ADD CONSTRAINT "diary_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."documents"
  ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."feedback_items"
  ADD CONSTRAINT "feedback_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."functional_description_versions"
  ADD CONSTRAINT "functional_description_versions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."functional_descriptions"
  ADD CONSTRAINT "functional_descriptions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."functional_descriptions"
  ADD CONSTRAINT "functional_descriptions_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.profiles(id);

ALTER TABLE "public"."pdf_exports"
  ADD CONSTRAINT "pdf_exports_exported_by_fkey" FOREIGN KEY (exported_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."practice_periods"
  ADD CONSTRAINT "practice_periods_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."representative_applications"
  ADD CONSTRAINT "representative_applications_decided_by_fkey" FOREIGN KEY (decided_by) REFERENCES public.profiles(id);

ALTER TABLE "public"."representative_applications"
  ADD CONSTRAINT "representative_applications_invited_user_id_fkey" FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id);

ALTER TABLE "public"."calendar_events"
  ADD CONSTRAINT "calendar_events_representative_id_fkey" FOREIGN KEY (representative_id) REFERENCES public.representative_profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."citizen_case_notes"
  ADD CONSTRAINT "citizen_case_notes_representative_id_fkey" FOREIGN KEY (representative_id) REFERENCES public.representative_profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."citizen_representative_links"
  ADD CONSTRAINT "citizen_representative_links_representative_id_fkey" FOREIGN KEY (representative_id) REFERENCES public.representative_profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."representative_invitations"
  ADD CONSTRAINT "representative_invitations_representative_id_fkey" FOREIGN KEY (representative_id) REFERENCES public.representative_profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."representative_profiles"
  ADD CONSTRAINT "representative_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."representative_requests"
  ADD CONSTRAINT "representative_requests_citizen_id_fkey" FOREIGN KEY (citizen_id) REFERENCES public.citizens(id) ON DELETE CASCADE;

ALTER TABLE "public"."representative_requests"
  ADD CONSTRAINT "representative_requests_representative_id_fkey" FOREIGN KEY (representative_id) REFERENCES public.representative_profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."subscription_accounts"
  ADD CONSTRAINT "subscription_accounts_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."work_tasks"
  ADD CONSTRAINT "work_tasks_diary_entry_id_fkey" FOREIGN KEY (diary_entry_id) REFERENCES public.diary_entries(id) ON DELETE CASCADE;

CREATE INDEX ai_analyses_citizen_created_idx ON public.ai_analyses USING btree (citizen_id, created_at DESC);

CREATE INDEX ai_analyses_citizen_type_version_idx ON public.ai_analyses USING btree (citizen_id, analysis_type, version_number DESC);

CREATE INDEX beta_users_beta_group_idx ON public.beta_users USING btree (beta_group);

CREATE INDEX beta_users_group_idx ON public.beta_users USING btree (beta_group);

CREATE INDEX beta_users_status_idx ON public.beta_users USING btree (status);

CREATE UNIQUE INDEX beta_users_user_id_key ON public.beta_users USING btree (user_id);

CREATE INDEX bugs_feedback_id_idx ON public.bugs USING btree (feedback_id);

CREATE INDEX bugs_severity_idx ON public.bugs USING btree (severity);

CREATE INDEX bugs_status_idx ON public.bugs USING btree (status);

CREATE INDEX calendar_events_citizen_id_idx ON public.calendar_events USING btree (citizen_id);

CREATE INDEX calendar_events_citizen_source_idx ON public.calendar_events USING btree (citizen_id, source);

CREATE INDEX calendar_events_created_by_idx ON public.calendar_events USING btree (created_by);

CREATE INDEX calendar_events_representative_id_idx ON public.calendar_events USING btree (representative_id);

CREATE INDEX calendar_events_source_idx ON public.calendar_events USING btree (source);

CREATE INDEX calendar_events_source_ref_idx ON public.calendar_events USING btree (source_ref);

CREATE INDEX calendar_events_start_time_idx ON public.calendar_events USING btree (start_time);

CREATE INDEX citizen_case_notes_citizen_idx ON public.citizen_case_notes USING btree (citizen_id, created_at DESC);

CREATE INDEX citizen_consents_citizen_id_idx ON public.citizen_consents USING btree (citizen_id);

CREATE INDEX citizen_contacts_citizen_id_idx ON public.citizen_contacts USING btree (citizen_id);

CREATE UNIQUE INDEX citizen_employment_citizen_id_key ON public.citizen_employment USING btree (citizen_id);

CREATE INDEX citizen_function_profile_citizen_id_idx ON public.citizen_function_profile USING btree (citizen_id);

CREATE INDEX citizen_goals_citizen_id_idx ON public.citizen_goals USING btree (citizen_id);

CREATE UNIQUE INDEX citizen_onboarding_citizen_id_key ON public.citizen_onboarding USING btree (citizen_id);

CREATE INDEX citizen_representative_links_citizen_idx ON public.citizen_representative_links USING btree (citizen_id, status);

CREATE INDEX citizen_representative_links_representative_idx ON public.citizen_representative_links USING btree (representative_id, status);

CREATE INDEX documents_citizen_created_idx ON public.documents USING btree (citizen_id, created_at DESC);

CREATE INDEX feedback_items_status_idx ON public.feedback_items USING btree (status);

CREATE INDEX feedback_items_type_idx ON public.feedback_items USING btree (TYPE);

CREATE INDEX feedback_items_user_id_idx ON public.feedback_items USING btree (user_id);

CREATE INDEX idx_ai_summaries_citizen_period ON public.ai_summaries USING btree (citizen_id, period_start, period_end);

CREATE INDEX idx_attachments_citizen ON public.attachments USING btree (citizen_id);

CREATE INDEX idx_audit_logs_citizen ON public.audit_logs USING btree (citizen_id);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);

CREATE INDEX idx_citizens_user_id ON public.citizens USING btree (user_id);

CREATE INDEX idx_diary_entries_citizen_date ON public.diary_entries USING btree (citizen_id, entry_date);

CREATE INDEX idx_diary_notes_entry ON public.diary_notes USING btree (diary_entry_id);

CREATE INDEX idx_functional_descriptions_citizen ON public.functional_descriptions USING btree (citizen_id);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (ROLE);

CREATE INDEX idx_work_tasks_diary_entry ON public.work_tasks USING btree (diary_entry_id);

CREATE INDEX messages_citizen_created_idx ON public.messages USING btree (citizen_id, created_at DESC);

CREATE UNIQUE INDEX one_active_practice_period_per_citizen_idx ON public.practice_periods USING btree (citizen_id)
  WHERE (status = 'active'::text);

CREATE UNIQUE INDEX one_active_representative_per_citizen_idx ON public.citizen_representative_links USING btree (citizen_id)
  WHERE (status = 'active'::text);

CREATE INDEX practice_periods_citizen_idx ON public.practice_periods USING btree (citizen_id, status, start_date DESC);

CREATE INDEX representative_applications_created_at_idx ON public.representative_applications USING btree (created_at);

CREATE INDEX representative_applications_status_idx ON public.representative_applications USING btree (status);

CREATE INDEX representative_invitations_code_idx ON public.representative_invitations USING btree (invitation_code);

CREATE INDEX representative_profiles_public_idx ON public.representative_profiles USING btree (approved_by_admin, public_profile, accepts_new_clients, city);

CREATE INDEX representative_requests_representative_idx ON public.representative_requests USING btree (representative_id, status, created_at DESC);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_citizens_updated_at
  BEFORE UPDATE ON public.citizens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER calculate_diary_work_minutes
  BEFORE INSERT OR UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_work_minutes();

CREATE TRIGGER set_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_functional_descriptions_updated_at
  BEFORE UPDATE ON public.functional_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "ai analyses administrator update" ON "public"."ai_analyses"
  FOR UPDATE
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'administrator'::public.user_role)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'administrator'::public.user_role)))));

CREATE POLICY "ai analyses own or administrator insert" ON "public"."ai_analyses"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((generated_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = ai_analyses.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'administrator'::public.user_role)))))));

CREATE POLICY "ai analyses own representative or administrator select" ON "public"."ai_analyses"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = ai_analyses.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()));

CREATE POLICY "ai_summaries_access" ON "public"."ai_summaries"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "attachments_access" ON "public"."attachments"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "audit_logs_insert_authenticated" ON "public"."audit_logs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())));

CREATE POLICY "audit_logs_select_admin_or_related" ON "public"."audit_logs"
  FOR SELECT
  TO PUBLIC
  USING ((public.is_administrator() OR (user_id = auth.uid()) OR public.can_access_citizen(citizen_id)));

CREATE POLICY "Citizens can manage own calendar events" ON "public"."calendar_events"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = calendar_events.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = calendar_events.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "citizen case notes insert" ON "public"."citizen_case_notes"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((author_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_case_notes.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator())));

CREATE POLICY "citizen case notes select" ON "public"."citizen_case_notes"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_case_notes.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()));

CREATE POLICY "Citizens can manage own consents" ON "public"."citizen_consents"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_consents.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_consents.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can manage own contacts" ON "public"."citizen_contacts"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_contacts.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_contacts.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can manage own employment" ON "public"."citizen_employment"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_employment.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_employment.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can manage own function profile" ON "public"."citizen_function_profile"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_function_profile.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_function_profile.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can manage own goals" ON "public"."citizen_goals"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_goals.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_goals.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can insert own onboarding" ON "public"."citizen_onboarding"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_onboarding.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can read own onboarding" ON "public"."citizen_onboarding"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_onboarding.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "Citizens can update own onboarding" ON "public"."citizen_onboarding"
  FOR UPDATE
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_onboarding.citizen_id) AND (citizens.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens
  WHERE ((citizens.id = citizen_onboarding.citizen_id) AND (citizens.user_id = auth.uid())))));

CREATE POLICY "citizen representative links insert" ON "public"."citizen_representative_links"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_representative_links.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = citizen_representative_links.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "citizen representative links select" ON "public"."citizen_representative_links"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_representative_links.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = citizen_representative_links.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "citizen representative links update" ON "public"."citizen_representative_links"
  FOR UPDATE
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_representative_links.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = citizen_representative_links.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = citizen_representative_links.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = citizen_representative_links.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "citizens own representative or administrator select" ON "public"."citizens"
  FOR SELECT
  TO PUBLIC
  USING (((user_id = auth.uid()) OR public.can_represent_citizen(id) OR public.is_platform_administrator()));

CREATE POLICY "citizens_insert_admin_or_self" ON "public"."citizens"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((user_id = auth.uid()) OR public.is_administrator()));

CREATE POLICY "citizens_select_own_or_admin" ON "public"."citizens"
  FOR SELECT
  TO PUBLIC
  USING (((user_id = auth.uid()) OR public.is_administrator()));

CREATE POLICY "citizens_update_own_or_admin" ON "public"."citizens"
  FOR UPDATE
  TO PUBLIC
  USING (((user_id = auth.uid()) OR public.is_administrator()))
  WITH CHECK (((user_id = auth.uid()) OR public.is_administrator()));

CREATE POLICY "consents_access" ON "public"."consents"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "deletion_requests_access" ON "public"."deletion_requests"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "diary own representative or administrator select" ON "public"."diary_entries"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = diary_entries.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()));

CREATE POLICY "diary_entries_insert_owner_or_admin" ON "public"."diary_entries"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "diary_entries_update_rules" ON "public"."diary_entries"
  FOR UPDATE
  TO PUBLIC
  USING
    ((public.is_administrator() OR (public.owns_citizen(citizen_id) AND (entry_date = ((now() AT TIME ZONE 'Europe/Copenhagen'::text))::date) AND (status <>
    'locked'::public.diary_status) AND (locked_at IS NULL))))
  WITH
    CHECK
    ((public.is_administrator() OR (public.owns_citizen(citizen_id) AND (entry_date = ((now() AT TIME ZONE 'Europe/Copenhagen'::text))::date) AND (status <>
    'locked'::public.diary_status) AND (locked_at IS NULL))));

CREATE POLICY "diary_notes_insert_access" ON "public"."diary_notes"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((author_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.diary_entries d
  WHERE ((d.id = diary_notes.diary_entry_id) AND public.can_access_citizen(d.citizen_id))))));

CREATE POLICY "diary_notes_select_access" ON "public"."diary_notes"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.diary_entries d
  WHERE ((d.id = diary_notes.diary_entry_id) AND public.can_access_citizen(d.citizen_id)))));

CREATE POLICY "documents citizen representative insert" ON "public"."documents"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((uploaded_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = documents.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id))));

CREATE POLICY "documents citizen representative select" ON "public"."documents"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = documents.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id)));

CREATE POLICY "documents uploader delete" ON "public"."documents"
  FOR DELETE
  TO PUBLIC
  USING (((uploaded_by = auth.uid()) OR public.can_represent_citizen(citizen_id)));

CREATE POLICY "Users can insert own feedback" ON "public"."feedback_items"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can read own feedback" ON "public"."feedback_items"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "functional_description_versions_access" ON "public"."functional_description_versions"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.functional_descriptions f
  WHERE ((f.id = functional_description_versions.functional_description_id) AND public.can_access_citizen(f.citizen_id)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.functional_descriptions f
  WHERE ((f.id = functional_description_versions.functional_description_id) AND public.can_access_citizen(f.citizen_id)))));

CREATE POLICY "functional_descriptions_access" ON "public"."functional_descriptions"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "messages citizen representative insert" ON "public"."messages"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((sender_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = messages.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id))));

CREATE POLICY "messages citizen representative select" ON "public"."messages"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = messages.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id)));

CREATE POLICY "pdf_exports_access" ON "public"."pdf_exports"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "practice periods insert" ON "public"."practice_periods"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((created_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = practice_periods.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator())));

CREATE POLICY "practice periods select" ON "public"."practice_periods"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = practice_periods.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()));

CREATE POLICY "practice periods update" ON "public"."practice_periods"
  FOR UPDATE
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = practice_periods.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = practice_periods.citizen_id) AND (c.user_id = auth.uid())))) OR public.can_represent_citizen(citizen_id) OR public.is_platform_administrator()));

CREATE POLICY "practice_schedule_access" ON "public"."practice_schedule"
  FOR ALL
  TO PUBLIC
  USING (public.can_access_citizen(citizen_id))
  WITH CHECK (public.can_access_citizen(citizen_id));

CREATE POLICY "profiles_select_own_or_admin" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING (((id = auth.uid()) OR public.is_administrator()));

CREATE POLICY "profiles_update_own" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "representative invitations insert" ON "public"."representative_invitations"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_invitations.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "representative invitations select" ON "public"."representative_invitations"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_invitations.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "representative invitations update" ON "public"."representative_invitations"
  FOR UPDATE
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_invitations.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_invitations.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "representative profiles own insert" ON "public"."representative_profiles"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "representative profiles own update" ON "public"."representative_profiles"
  FOR UPDATE
  TO PUBLIC
  USING (((user_id = auth.uid()) OR public.is_platform_administrator()))
  WITH CHECK (((user_id = auth.uid()) OR public.is_platform_administrator()));

CREATE POLICY "representative profiles public approved select" ON "public"."representative_profiles"
  FOR SELECT
  TO PUBLIC
  USING
    ((((public_profile = true) AND (accepts_new_clients = true) AND (approved_by_admin = true) AND (suspended = false)) OR (user_id = auth.uid()) OR
    public.is_platform_administrator()));

CREATE POLICY "representative requests insert" ON "public"."representative_requests"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = representative_requests.citizen_id) AND (c.user_id = auth.uid())))));

CREATE POLICY "representative requests select" ON "public"."representative_requests"
  FOR SELECT
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.citizens c
  WHERE ((c.id = representative_requests.citizen_id) AND (c.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_requests.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "representative requests update" ON "public"."representative_requests"
  FOR UPDATE
  TO PUBLIC
  USING (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_requests.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.representative_profiles r
  WHERE ((r.id = representative_requests.representative_id) AND (r.user_id = auth.uid())))) OR public.is_platform_administrator()));

CREATE POLICY "subscription accounts own insert" ON "public"."subscription_accounts"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((owner_user_id = auth.uid()));

CREATE POLICY "subscription accounts own select" ON "public"."subscription_accounts"
  FOR SELECT
  TO PUBLIC
  USING (((owner_user_id = auth.uid()) OR public.is_platform_administrator()));

CREATE POLICY "work_tasks_access" ON "public"."work_tasks"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.diary_entries d
  WHERE ((d.id = work_tasks.diary_entry_id) AND public.can_access_citizen(d.citizen_id)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.diary_entries d
  WHERE ((d.id = work_tasks.diary_entry_id) AND public.can_access_citizen(d.citizen_id)))));

CREATE POLICY "authenticated_can_delete_storage" ON "storage"."objects"
  FOR DELETE
  TO PUBLIC
  USING (((auth.uid() IS NOT NULL) AND (bucket_id = ANY (ARRAY['funktion360-attachments'::text, 'funktion360-pdf-exports'::text]))));

CREATE POLICY "authenticated_can_read_own_storage" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (((auth.uid() IS NOT NULL) AND (bucket_id = ANY (ARRAY['funktion360-attachments'::text, 'funktion360-pdf-exports'::text]))));

CREATE POLICY "authenticated_can_update_storage" ON "storage"."objects"
  FOR UPDATE
  TO PUBLIC
  USING (((auth.uid() IS NOT NULL) AND (bucket_id = ANY (ARRAY['funktion360-attachments'::text, 'funktion360-pdf-exports'::text]))))
  WITH CHECK (((auth.uid() IS NOT NULL) AND (bucket_id = ANY (ARRAY['funktion360-attachments'::text, 'funktion360-pdf-exports'::text]))));

CREATE POLICY "authenticated_can_upload_attachments" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((auth.uid() IS NOT NULL) AND (bucket_id = ANY (ARRAY['funktion360-attachments'::text, 'funktion360-pdf-exports'::text]))));

COMMENT ON EXTENSION "pg_cron" IS 'Job scheduler for PostgreSQL';

GRANT EXECUTE ON FUNCTION "public"."calculate_work_minutes"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."can_access_citizen"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."can_edit_diary_entry"(date) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."can_represent_citizen"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."create_default_practice_schedule"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."current_user_role"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_administrator"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_platform_administrator"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_representative"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."owns_citizen"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."write_audit_log"(text, uuid, text, uuid, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."write_audit_log"(text, uuid, text, uuid, jsonb) TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_analyses" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_summaries" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."attachments" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."beta_users" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bugs" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."calendar_events" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_case_notes" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_consents" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_contacts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_employment" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_function_profile" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_goals" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizen_onboarding" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."citizen_representative_links"
  TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."citizens" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."consents" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deletion_requests" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."diary_entries" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."diary_notes" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."documents" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."feedback_items" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."functional_description_versions"
  TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."functional_descriptions" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."pdf_exports" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."practice_periods" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."practice_schedule" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."representative_applications" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."representative_invitations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."representative_profiles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."representative_requests" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscription_accounts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."work_tasks" TO "anon", "authenticated", "postgres", "service_role";

GRANT USAGE ON TYPE "public"."app_role" TO "postgres";

GRANT USAGE ON TYPE "public"."attachment_context" TO "postgres";

GRANT USAGE ON TYPE "public"."deletion_request_status" TO "postgres";

GRANT USAGE ON TYPE "public"."diary_status" TO "postgres";

GRANT USAGE ON TYPE "public"."functional_description_status" TO "postgres";

GRANT USAGE ON TYPE "public"."task_status" TO "postgres";

GRANT USAGE ON TYPE "public"."user_role" TO "postgres";

SELECT cron.schedule_in_database('lock-diary-entries-after-midnight', '5 0 * * *', '
    UPDATE public.diary_entries
    SET
      locked_at = now(),
      status = ''locked''
    WHERE locked_at IS NULL
    AND entry_date < (now() AT TIME ZONE ''Europe/Copenhagen'')::date;
  ', 'postgres', NULL, true);
