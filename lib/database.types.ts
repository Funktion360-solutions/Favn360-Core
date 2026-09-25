
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_analyses": {
                  Row: {
                    "administrator_comment": string | null,"analysis_type": string,"approved_at": string | null,"approved_by": string | null,"citizen_id": string,"citizen_reflection": Json | null,"created_at": string | null,"critical_observations": Json | null,"functional_themes": Json | null,"generated_by": string | null,"id": string,"model_used": string | null,"observations": Json | null,"patterns": Json | null,"period_end": string | null,"period_start": string | null,"prompt_version": string | null,"risk_level": string | null,"status": string,"summary": string | null,"support_needs": Json | null,"title": string | null,"updated_at": string | null,"used_in_report": boolean | null,"version_number": number
                  }
                  Insert: {
                    "administrator_comment"?: string | null,"analysis_type": string,"approved_at"?: string | null,"approved_by"?: string | null,"citizen_id": string,"citizen_reflection"?: Json | null,"created_at"?: string | null,"critical_observations"?: Json | null,"functional_themes"?: Json | null,"generated_by"?: string | null,"id"?: string,"model_used"?: string | null,"observations"?: Json | null,"patterns"?: Json | null,"period_end"?: string | null,"period_start"?: string | null,"prompt_version"?: string | null,"risk_level"?: string | null,"status"?: string,"summary"?: string | null,"support_needs"?: Json | null,"title"?: string | null,"updated_at"?: string | null,"used_in_report"?: boolean | null,"version_number"?: number
                  }
                  Update: {
                    "administrator_comment"?: string | null,"analysis_type"?: string,"approved_at"?: string | null,"approved_by"?: string | null,"citizen_id"?: string,"citizen_reflection"?: Json | null,"created_at"?: string | null,"critical_observations"?: Json | null,"functional_themes"?: Json | null,"generated_by"?: string | null,"id"?: string,"model_used"?: string | null,"observations"?: Json | null,"patterns"?: Json | null,"period_end"?: string | null,"period_start"?: string | null,"prompt_version"?: string | null,"risk_level"?: string | null,"status"?: string,"summary"?: string | null,"support_needs"?: Json | null,"title"?: string | null,"updated_at"?: string | null,"used_in_report"?: boolean | null,"version_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_analyses_approved_by_fkey"
      columns: ["approved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ai_analyses_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ai_analyses_generated_by_fkey"
      columns: ["generated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"ai_summaries": {
                  Row: {
                    "citizen_id": string,"citizen_own_descriptions": string | null,"created_at": string,"date_citations": Json | null,"development": string | null,"functional_description_suggestions": string | null,"generated_at": string,"generated_by_ai": boolean,"id": string,"objective_observations": string | null,"patterns_over_time": string | null,"period_end": string | null,"period_start": string | null,"source_diary_entry_id": string | null,"support_needs": string | null
                  }
                  Insert: {
                    "citizen_id": string,"citizen_own_descriptions"?: string | null,"created_at"?: string,"date_citations"?: Json | null,"development"?: string | null,"functional_description_suggestions"?: string | null,"generated_at"?: string,"generated_by_ai"?: boolean,"id"?: string,"objective_observations"?: string | null,"patterns_over_time"?: string | null,"period_end"?: string | null,"period_start"?: string | null,"source_diary_entry_id"?: string | null,"support_needs"?: string | null
                  }
                  Update: {
                    "citizen_id"?: string,"citizen_own_descriptions"?: string | null,"created_at"?: string,"date_citations"?: Json | null,"development"?: string | null,"functional_description_suggestions"?: string | null,"generated_at"?: string,"generated_by_ai"?: boolean,"id"?: string,"objective_observations"?: string | null,"patterns_over_time"?: string | null,"period_end"?: string | null,"period_start"?: string | null,"source_diary_entry_id"?: string | null,"support_needs"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_summaries_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ai_summaries_source_diary_entry_id_fkey"
      columns: ["source_diary_entry_id"]
isOneToOne: false
      referencedRelation: "diary_entries"
      referencedColumns: ["id"]
    }
                  ]
                },"attachments": {
                  Row: {
                    "citizen_id": string,"context": Database["public"]['Enums']["attachment_context"],"created_at": string,"diary_entry_id": string | null,"file_name": string,"file_path": string,"file_size": number | null,"file_type": string | null,"id": string,"uploaded_by": string
                  }
                  Insert: {
                    "citizen_id": string,"context": Database["public"]['Enums']["attachment_context"],"created_at"?: string,"diary_entry_id"?: string | null,"file_name": string,"file_path": string,"file_size"?: number | null,"file_type"?: string | null,"id"?: string,"uploaded_by": string
                  }
                  Update: {
                    "citizen_id"?: string,"context"?: Database["public"]['Enums']["attachment_context"],"created_at"?: string,"diary_entry_id"?: string | null,"file_name"?: string,"file_path"?: string,"file_size"?: number | null,"file_type"?: string | null,"id"?: string,"uploaded_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attachments_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attachments_diary_entry_id_fkey"
      columns: ["diary_entry_id"]
isOneToOne: false
      referencedRelation: "diary_entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attachments_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"citizen_id": string | null,"created_at": string,"id": string,"metadata": Json | null,"record_id": string | null,"table_name": string | null,"user_id": string | null
                  }
                  Insert: {
                    "action": string,"citizen_id"?: string | null,"created_at"?: string,"id"?: string,"metadata"?: Json | null,"record_id"?: string | null,"table_name"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"citizen_id"?: string | null,"created_at"?: string,"id"?: string,"metadata"?: Json | null,"record_id"?: string | null,"table_name"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_logs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"calendar_events": {
                  Row: {
                    "all_day": boolean,"citizen_id": string | null,"created_at": string,"created_by": string,"description": string | null,"end_time": string | null,"event_type": string,"id": string,"location": string | null,"representative_id": string | null,"source": string,"source_ref": string | null,"start_time": string,"status": string,"title": string,"updated_at": string,"visibility": string
                  }
                  Insert: {
                    "all_day"?: boolean,"citizen_id"?: string | null,"created_at"?: string,"created_by": string,"description"?: string | null,"end_time"?: string | null,"event_type"?: string,"id"?: string,"location"?: string | null,"representative_id"?: string | null,"source"?: string,"source_ref"?: string | null,"start_time": string,"status"?: string,"title": string,"updated_at"?: string,"visibility"?: string
                  }
                  Update: {
                    "all_day"?: boolean,"citizen_id"?: string | null,"created_at"?: string,"created_by"?: string,"description"?: string | null,"end_time"?: string | null,"event_type"?: string,"id"?: string,"location"?: string | null,"representative_id"?: string | null,"source"?: string,"source_ref"?: string | null,"start_time"?: string,"status"?: string,"title"?: string,"updated_at"?: string,"visibility"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "calendar_events_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "calendar_events_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "calendar_events_representative_id_fkey"
      columns: ["representative_id"]
isOneToOne: false
      referencedRelation: "representative_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_case_notes": {
                  Row: {
                    "author_id": string,"body": string,"citizen_id": string,"created_at": string,"id": string,"note_type": string,"representative_id": string | null,"title": string | null
                  }
                  Insert: {
                    "author_id": string,"body": string,"citizen_id": string,"created_at"?: string,"id"?: string,"note_type"?: string,"representative_id"?: string | null,"title"?: string | null
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"citizen_id"?: string,"created_at"?: string,"id"?: string,"note_type"?: string,"representative_id"?: string | null,"title"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_case_notes_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citizen_case_notes_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citizen_case_notes_representative_id_fkey"
      columns: ["representative_id"]
isOneToOne: false
      referencedRelation: "representative_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_consents": {
                  Row: {
                    "accepted_at": string,"ai_analysis": boolean,"citizen_id": string,"data_processing": boolean,"id": string,"notifications": boolean,"representative_sharing": boolean
                  }
                  Insert: {
                    "accepted_at"?: string,"ai_analysis"?: boolean,"citizen_id": string,"data_processing"?: boolean,"id"?: string,"notifications"?: boolean,"representative_sharing"?: boolean
                  }
                  Update: {
                    "accepted_at"?: string,"ai_analysis"?: boolean,"citizen_id"?: string,"data_processing"?: boolean,"id"?: string,"notifications"?: boolean,"representative_sharing"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_consents_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_contacts": {
                  Row: {
                    "citizen_id": string,"contact_type": string,"created_at": string,"email": string | null,"id": string,"name": string | null,"notes": string | null,"phone": string | null
                  }
                  Insert: {
                    "citizen_id": string,"contact_type": string,"created_at"?: string,"email"?: string | null,"id"?: string,"name"?: string | null,"notes"?: string | null,"phone"?: string | null
                  }
                  Update: {
                    "citizen_id"?: string,"contact_type"?: string,"created_at"?: string,"email"?: string | null,"id"?: string,"name"?: string | null,"notes"?: string | null,"phone"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_contacts_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_employment": {
                  Row: {
                    "cash_benefits": boolean,"citizen_id": string,"created_at": string,"disability_pension": boolean,"id": string,"in_practice": boolean,"job_clarification": boolean,"practice_company": string | null,"practice_contact_person": string | null,"practice_end_date": string | null,"practice_hours_per_week": number | null,"practice_start_date": string | null,"practice_weekdays": (string)[],"resource_program": boolean,"sick_leave": boolean,"sickness_benefits": boolean,"updated_at": string
                  }
                  Insert: {
                    "cash_benefits"?: boolean,"citizen_id": string,"created_at"?: string,"disability_pension"?: boolean,"id"?: string,"in_practice"?: boolean,"job_clarification"?: boolean,"practice_company"?: string | null,"practice_contact_person"?: string | null,"practice_end_date"?: string | null,"practice_hours_per_week"?: number | null,"practice_start_date"?: string | null,"practice_weekdays"?: (string)[],"resource_program"?: boolean,"sick_leave"?: boolean,"sickness_benefits"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "cash_benefits"?: boolean,"citizen_id"?: string,"created_at"?: string,"disability_pension"?: boolean,"id"?: string,"in_practice"?: boolean,"job_clarification"?: boolean,"practice_company"?: string | null,"practice_contact_person"?: string | null,"practice_end_date"?: string | null,"practice_hours_per_week"?: number | null,"practice_start_date"?: string | null,"practice_weekdays"?: (string)[],"resource_program"?: boolean,"sick_leave"?: boolean,"sickness_benefits"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_employment_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_function_profile": {
                  Row: {
                    "category": string,"citizen_id": string,"created_at": string,"description": string | null,"id": string,"severity": string,"title": string
                  }
                  Insert: {
                    "category": string,"citizen_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"severity": string,"title": string
                  }
                  Update: {
                    "category"?: string,"citizen_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"severity"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_function_profile_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_goals": {
                  Row: {
                    "active": boolean,"citizen_id": string,"created_at": string,"custom_goal": string | null,"goal_type": string | null,"id": string
                  }
                  Insert: {
                    "active"?: boolean,"citizen_id": string,"created_at"?: string,"custom_goal"?: string | null,"goal_type"?: string | null,"id"?: string
                  }
                  Update: {
                    "active"?: boolean,"citizen_id"?: string,"created_at"?: string,"custom_goal"?: string | null,"goal_type"?: string | null,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_goals_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_onboarding": {
                  Row: {
                    "citizen_id": string,"completed_at": string | null,"created_at": string,"current_step": number,"id": string,"onboarding_completed": boolean,"updated_at": string
                  }
                  Insert: {
                    "citizen_id": string,"completed_at"?: string | null,"created_at"?: string,"current_step"?: number,"id"?: string,"onboarding_completed"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "citizen_id"?: string,"completed_at"?: string | null,"created_at"?: string,"current_step"?: number,"id"?: string,"onboarding_completed"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_onboarding_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"citizen_representative_links": {
                  Row: {
                    "approved_by": string | null,"citizen_id": string,"created_at": string,"ended_at": string | null,"id": string,"representative_id": string,"requested_by": string | null,"started_at": string | null,"status": string,"updated_at": string
                  }
                  Insert: {
                    "approved_by"?: string | null,"citizen_id": string,"created_at"?: string,"ended_at"?: string | null,"id"?: string,"representative_id": string,"requested_by"?: string | null,"started_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "approved_by"?: string | null,"citizen_id"?: string,"created_at"?: string,"ended_at"?: string | null,"id"?: string,"representative_id"?: string,"requested_by"?: string | null,"started_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizen_representative_links_approved_by_fkey"
      columns: ["approved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citizen_representative_links_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citizen_representative_links_representative_id_fkey"
      columns: ["representative_id"]
isOneToOne: false
      referencedRelation: "representative_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citizen_representative_links_requested_by_fkey"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"citizens": {
                  Row: {
                    "administrator_name": string | null,"birth_year": number | null,"citizen_name": string,"consent_data_processing": boolean,"consent_terms": boolean,"contact_person": string | null,"created_at": string,"health_information": string | null,"id": string,"municipality": string | null,"phone": string | null,"practice_end_date": string | null,"practice_place": string | null,"practice_start_date": string,"updated_at": string,"user_id": string,"weekly_hours": number
                  }
                  Insert: {
                    "administrator_name"?: string | null,"birth_year"?: number | null,"citizen_name": string,"consent_data_processing"?: boolean,"consent_terms"?: boolean,"contact_person"?: string | null,"created_at"?: string,"health_information"?: string | null,"id"?: string,"municipality"?: string | null,"phone"?: string | null,"practice_end_date"?: string | null,"practice_place"?: string | null,"practice_start_date"?: string,"updated_at"?: string,"user_id": string,"weekly_hours"?: number
                  }
                  Update: {
                    "administrator_name"?: string | null,"birth_year"?: number | null,"citizen_name"?: string,"consent_data_processing"?: boolean,"consent_terms"?: boolean,"contact_person"?: string | null,"created_at"?: string,"health_information"?: string | null,"id"?: string,"municipality"?: string | null,"phone"?: string | null,"practice_end_date"?: string | null,"practice_place"?: string | null,"practice_start_date"?: string,"updated_at"?: string,"user_id"?: string,"weekly_hours"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "citizens_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "accepted": boolean,"accepted_at": string | null,"citizen_id": string,"consent_text": string,"created_at": string,"id": string,"user_id": string
                  }
                  Insert: {
                    "accepted"?: boolean,"accepted_at"?: string | null,"citizen_id": string,"consent_text": string,"created_at"?: string,"id"?: string,"user_id": string
                  }
                  Update: {
                    "accepted"?: boolean,"accepted_at"?: string | null,"citizen_id"?: string,"consent_text"?: string,"created_at"?: string,"id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"deletion_requests": {
                  Row: {
                    "citizen_id": string,"created_at": string,"handled_at": string | null,"handled_by": string | null,"id": string,"reason": string | null,"requested_by": string,"status": Database["public"]['Enums']["deletion_request_status"]
                  }
                  Insert: {
                    "citizen_id": string,"created_at"?: string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"reason"?: string | null,"requested_by": string,"status"?: Database["public"]['Enums']["deletion_request_status"]
                  }
                  Update: {
                    "citizen_id"?: string,"created_at"?: string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"reason"?: string | null,"requested_by"?: string,"status"?: Database["public"]['Enums']["deletion_request_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "deletion_requests_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deletion_requests_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deletion_requests_requested_by_fkey"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"diary_entries": {
                  Row: {
                    "absence": boolean | null,"absence_reason": string | null,"actual_end_time": string | null,"actual_start_time": string | null,"break_count": number | null,"break_description": string | null,"break_total_minutes": number | null,"calculated_work_minutes": number | null,"challenge_handling": string | null,"citizen_id": string,"colleague_cooperation": string | null,"completed_home_tasks": string | null,"created_at": string,"created_by": string | null,"entry_date": string,"fatigue_bedtime": number | null,"fatigue_daytime": number | null,"fatigue_getting_up": number | null,"fatigue_waking": number | null,"functional_level": number | null,"had_practice_day": boolean | null,"home_day_description": string | null,"hygiene_body_wash": boolean | null,"hygiene_brushed_hair": boolean | null,"hygiene_brushed_teeth": boolean | null,"hygiene_dressing": boolean | null,"hygiene_hair_wash": boolean | null,"hygiene_makeup": boolean | null,"id": string,"limited_tasks": string | null,"locked_at": string | null,"mental_bedtime": number | null,"mental_daytime": number | null,"mental_getting_up": number | null,"mental_waking": number | null,"other_important_comments": string | null,"pain_level_daytime": number | null,"pain_limitations": string | null,"planned_home_tasks": string | null,"pressure_level": number | null,"pressured_tasks": string | null,"psychological_challenges": string | null,"reopened_until": string | null,"skipped_or_stopped_tasks": string | null,"sleep_description": string | null,"status": Database["public"]['Enums']["diary_status"],"take_to_tomorrow": string | null,"updated_at": string,"updated_by": string | null,"went_back_to_bed": boolean | null,"what_went_well": string | null,"work_difficulties": string | null,"work_notes": string | null,"work_went_well": string | null,"workload_suitable": string | null
                  }
                  Insert: {
                    "absence"?: boolean | null,"absence_reason"?: string | null,"actual_end_time"?: string | null,"actual_start_time"?: string | null,"break_count"?: number | null,"break_description"?: string | null,"break_total_minutes"?: number | null,"calculated_work_minutes"?: number | null,"challenge_handling"?: string | null,"citizen_id": string,"colleague_cooperation"?: string | null,"completed_home_tasks"?: string | null,"created_at"?: string,"created_by"?: string | null,"entry_date": string,"fatigue_bedtime"?: number | null,"fatigue_daytime"?: number | null,"fatigue_getting_up"?: number | null,"fatigue_waking"?: number | null,"functional_level"?: number | null,"had_practice_day"?: boolean | null,"home_day_description"?: string | null,"hygiene_body_wash"?: boolean | null,"hygiene_brushed_hair"?: boolean | null,"hygiene_brushed_teeth"?: boolean | null,"hygiene_dressing"?: boolean | null,"hygiene_hair_wash"?: boolean | null,"hygiene_makeup"?: boolean | null,"id"?: string,"limited_tasks"?: string | null,"locked_at"?: string | null,"mental_bedtime"?: number | null,"mental_daytime"?: number | null,"mental_getting_up"?: number | null,"mental_waking"?: number | null,"other_important_comments"?: string | null,"pain_level_daytime"?: number | null,"pain_limitations"?: string | null,"planned_home_tasks"?: string | null,"pressure_level"?: number | null,"pressured_tasks"?: string | null,"psychological_challenges"?: string | null,"reopened_until"?: string | null,"skipped_or_stopped_tasks"?: string | null,"sleep_description"?: string | null,"status"?: Database["public"]['Enums']["diary_status"],"take_to_tomorrow"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"went_back_to_bed"?: boolean | null,"what_went_well"?: string | null,"work_difficulties"?: string | null,"work_notes"?: string | null,"work_went_well"?: string | null,"workload_suitable"?: string | null
                  }
                  Update: {
                    "absence"?: boolean | null,"absence_reason"?: string | null,"actual_end_time"?: string | null,"actual_start_time"?: string | null,"break_count"?: number | null,"break_description"?: string | null,"break_total_minutes"?: number | null,"calculated_work_minutes"?: number | null,"challenge_handling"?: string | null,"citizen_id"?: string,"colleague_cooperation"?: string | null,"completed_home_tasks"?: string | null,"created_at"?: string,"created_by"?: string | null,"entry_date"?: string,"fatigue_bedtime"?: number | null,"fatigue_daytime"?: number | null,"fatigue_getting_up"?: number | null,"fatigue_waking"?: number | null,"functional_level"?: number | null,"had_practice_day"?: boolean | null,"home_day_description"?: string | null,"hygiene_body_wash"?: boolean | null,"hygiene_brushed_hair"?: boolean | null,"hygiene_brushed_teeth"?: boolean | null,"hygiene_dressing"?: boolean | null,"hygiene_hair_wash"?: boolean | null,"hygiene_makeup"?: boolean | null,"id"?: string,"limited_tasks"?: string | null,"locked_at"?: string | null,"mental_bedtime"?: number | null,"mental_daytime"?: number | null,"mental_getting_up"?: number | null,"mental_waking"?: number | null,"other_important_comments"?: string | null,"pain_level_daytime"?: number | null,"pain_limitations"?: string | null,"planned_home_tasks"?: string | null,"pressure_level"?: number | null,"pressured_tasks"?: string | null,"psychological_challenges"?: string | null,"reopened_until"?: string | null,"skipped_or_stopped_tasks"?: string | null,"sleep_description"?: string | null,"status"?: Database["public"]['Enums']["diary_status"],"take_to_tomorrow"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"went_back_to_bed"?: boolean | null,"what_went_well"?: string | null,"work_difficulties"?: string | null,"work_notes"?: string | null,"work_went_well"?: string | null,"workload_suitable"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "diary_entries_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "diary_entries_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "diary_entries_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"diary_notes": {
                  Row: {
                    "author_id": string,"author_role": Database["public"]['Enums']["user_role"],"created_at": string,"diary_entry_id": string,"id": string,"note_text": string
                  }
                  Insert: {
                    "author_id": string,"author_role": Database["public"]['Enums']["user_role"],"created_at"?: string,"diary_entry_id": string,"id"?: string,"note_text": string
                  }
                  Update: {
                    "author_id"?: string,"author_role"?: Database["public"]['Enums']["user_role"],"created_at"?: string,"diary_entry_id"?: string,"id"?: string,"note_text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "diary_notes_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "diary_notes_diary_entry_id_fkey"
      columns: ["diary_entry_id"]
isOneToOne: false
      referencedRelation: "diary_entries"
      referencedColumns: ["id"]
    }
                  ]
                },"documents": {
                  Row: {
                    "category": string,"citizen_id": string,"created_at": string,"file_name": string,"file_path": string,"file_size": number | null,"id": string,"mime_type": string | null,"title": string | null,"uploaded_by": string
                  }
                  Insert: {
                    "category"?: string,"citizen_id": string,"created_at"?: string,"file_name": string,"file_path": string,"file_size"?: number | null,"id"?: string,"mime_type"?: string | null,"title"?: string | null,"uploaded_by": string
                  }
                  Update: {
                    "category"?: string,"citizen_id"?: string,"created_at"?: string,"file_name"?: string,"file_path"?: string,"file_size"?: number | null,"id"?: string,"mime_type"?: string | null,"title"?: string | null,"uploaded_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"functional_description_versions": {
                  Row: {
                    "created_at": string,"created_by": string | null,"functional_description_id": string,"id": string,"snapshot": NonNullable<Json>,"version_number": number
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"functional_description_id": string,"id"?: string,"snapshot": NonNullable<Json>,"version_number": number
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"functional_description_id"?: string,"id"?: string,"snapshot"?: NonNullable<Json>,"version_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "functional_description_versions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "functional_description_versions_functional_description_id_fkey"
      columns: ["functional_description_id"]
isOneToOne: false
      referencedRelation: "functional_descriptions"
      referencedColumns: ["id"]
    }
                  ]
                },"functional_descriptions": {
                  Row: {
                    "ai_updated_at": string | null,"approved_at": string | null,"citizen_id": string,"created_at": string,"created_by": string | null,"exported_at": string | null,"id": string,"section_1_primary_challenges": string | null,"section_10_development_options": string | null,"section_2_daily_rhythm_routines": string | null,"section_3_shopping_cooking_meals": string | null,"section_4_cleaning_laundry_bedding": string | null,"section_5_personal_care": string | null,"section_6_house_garden_work": string | null,"section_7_transport": string | null,"section_8_communication": string | null,"section_9_social_relations": string | null,"status": Database["public"]['Enums']["functional_description_status"],"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "ai_updated_at"?: string | null,"approved_at"?: string | null,"citizen_id": string,"created_at"?: string,"created_by"?: string | null,"exported_at"?: string | null,"id"?: string,"section_1_primary_challenges"?: string | null,"section_10_development_options"?: string | null,"section_2_daily_rhythm_routines"?: string | null,"section_3_shopping_cooking_meals"?: string | null,"section_4_cleaning_laundry_bedding"?: string | null,"section_5_personal_care"?: string | null,"section_6_house_garden_work"?: string | null,"section_7_transport"?: string | null,"section_8_communication"?: string | null,"section_9_social_relations"?: string | null,"status"?: Database["public"]['Enums']["functional_description_status"],"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "ai_updated_at"?: string | null,"approved_at"?: string | null,"citizen_id"?: string,"created_at"?: string,"created_by"?: string | null,"exported_at"?: string | null,"id"?: string,"section_1_primary_challenges"?: string | null,"section_10_development_options"?: string | null,"section_2_daily_rhythm_routines"?: string | null,"section_3_shopping_cooking_meals"?: string | null,"section_4_cleaning_laundry_bedding"?: string | null,"section_5_personal_care"?: string | null,"section_6_house_garden_work"?: string | null,"section_7_transport"?: string | null,"section_8_communication"?: string | null,"section_9_social_relations"?: string | null,"status"?: Database["public"]['Enums']["functional_description_status"],"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "functional_descriptions_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "functional_descriptions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "functional_descriptions_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "body": string,"citizen_id": string,"created_at": string,"id": string,"read_at": string | null,"sender_id": string
                  }
                  Insert: {
                    "body": string,"citizen_id": string,"created_at"?: string,"id"?: string,"read_at"?: string | null,"sender_id": string
                  }
                  Update: {
                    "body"?: string,"citizen_id"?: string,"created_at"?: string,"id"?: string,"read_at"?: string | null,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"pdf_exports": {
                  Row: {
                    "citizen_id": string,"created_at": string,"document_type": string,"exported_by": string,"file_name": string,"file_path": string | null,"id": string,"options": Json | null,"period_end": string | null,"period_start": string | null,"version_number": number
                  }
                  Insert: {
                    "citizen_id": string,"created_at"?: string,"document_type": string,"exported_by": string,"file_name": string,"file_path"?: string | null,"id"?: string,"options"?: Json | null,"period_end"?: string | null,"period_start"?: string | null,"version_number"?: number
                  }
                  Update: {
                    "citizen_id"?: string,"created_at"?: string,"document_type"?: string,"exported_by"?: string,"file_name"?: string,"file_path"?: string | null,"id"?: string,"options"?: Json | null,"period_end"?: string | null,"period_start"?: string | null,"version_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "pdf_exports_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "pdf_exports_exported_by_fkey"
      columns: ["exported_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"practice_periods": {
                  Row: {
                    "citizen_id": string,"contact_person": string | null,"created_at": string,"created_by": string | null,"end_date": string | null,"friday_minutes": number | null,"id": string,"monday_minutes": number | null,"notes": string | null,"practice_place": string | null,"start_date": string | null,"status": string,"title": string,"updated_at": string,"wednesday_minutes": number | null,"weekly_hours": number | null
                  }
                  Insert: {
                    "citizen_id": string,"contact_person"?: string | null,"created_at"?: string,"created_by"?: string | null,"end_date"?: string | null,"friday_minutes"?: number | null,"id"?: string,"monday_minutes"?: number | null,"notes"?: string | null,"practice_place"?: string | null,"start_date"?: string | null,"status"?: string,"title"?: string,"updated_at"?: string,"wednesday_minutes"?: number | null,"weekly_hours"?: number | null
                  }
                  Update: {
                    "citizen_id"?: string,"contact_person"?: string | null,"created_at"?: string,"created_by"?: string | null,"end_date"?: string | null,"friday_minutes"?: number | null,"id"?: string,"monday_minutes"?: number | null,"notes"?: string | null,"practice_place"?: string | null,"start_date"?: string | null,"status"?: string,"title"?: string,"updated_at"?: string,"wednesday_minutes"?: number | null,"weekly_hours"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "practice_periods_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "practice_periods_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"practice_schedule": {
                  Row: {
                    "active_from": string,"active_to": string | null,"citizen_id": string,"created_at": string,"id": string,"planned_hours": number,"weekday": number
                  }
                  Insert: {
                    "active_from"?: string,"active_to"?: string | null,"citizen_id": string,"created_at"?: string,"id"?: string,"planned_hours"?: number,"weekday": number
                  }
                  Update: {
                    "active_from"?: string,"active_to"?: string | null,"citizen_id"?: string,"created_at"?: string,"id"?: string,"planned_hours"?: number,"weekday"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "practice_schedule_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string | null,"full_name": string,"id": string,"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"email"?: string | null,"full_name": string,"id": string,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"representative_applications": {
                  Row: {
                    "admin_note": string | null,"applicant_user_id": string | null,"city_area": string | null,"company_name": string | null,"created_at": string,"cvr": string | null,"decided_at": string | null,"decided_by": string | null,"email": string,"id": string,"invited_user_id": string | null,"name": string,"onboarding_unlocked": boolean,"phone": string,"profile_text": string | null,"reason": string,"role_title": string,"status": string,"updated_at": string,"website": string | null
                  }
                  Insert: {
                    "admin_note"?: string | null,"applicant_user_id"?: string | null,"city_area"?: string | null,"company_name"?: string | null,"created_at"?: string,"cvr"?: string | null,"decided_at"?: string | null,"decided_by"?: string | null,"email": string,"id"?: string,"invited_user_id"?: string | null,"name": string,"onboarding_unlocked"?: boolean,"phone": string,"profile_text"?: string | null,"reason": string,"role_title": string,"status"?: string,"updated_at"?: string,"website"?: string | null
                  }
                  Update: {
                    "admin_note"?: string | null,"applicant_user_id"?: string | null,"city_area"?: string | null,"company_name"?: string | null,"created_at"?: string,"cvr"?: string | null,"decided_at"?: string | null,"decided_by"?: string | null,"email"?: string,"id"?: string,"invited_user_id"?: string | null,"name"?: string,"onboarding_unlocked"?: boolean,"phone"?: string,"profile_text"?: string | null,"reason"?: string,"role_title"?: string,"status"?: string,"updated_at"?: string,"website"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "representative_applications_applicant_user_id_fkey"
      columns: ["applicant_user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "representative_applications_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "representative_applications_invited_user_id_fkey"
      columns: ["invited_user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"representative_invitations": {
                  Row: {
                    "created_at": string,"email": string,"expires_at": string | null,"id": string,"invitation_code": string,"representative_id": string,"status": string
                  }
                  Insert: {
                    "created_at"?: string,"email": string,"expires_at"?: string | null,"id"?: string,"invitation_code": string,"representative_id": string,"status"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"expires_at"?: string | null,"id"?: string,"invitation_code"?: string,"representative_id"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "representative_invitations_representative_id_fkey"
      columns: ["representative_id"]
isOneToOne: false
      referencedRelation: "representative_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"representative_profiles": {
                  Row: {
                    "accepts_new_clients": boolean,"approved_by_admin": boolean,"area": string | null,"city": string | null,"company_name": string | null,"created_at": string,"cvr": string | null,"display_name": string,"email": string,"id": string,"phone": string | null,"price_text": string | null,"profile_text": string | null,"public_profile": boolean,"specialties": (string)[],"suspended": boolean,"updated_at": string,"user_id": string,"verified": boolean,"website": string | null
                  }
                  Insert: {
                    "accepts_new_clients"?: boolean,"approved_by_admin"?: boolean,"area"?: string | null,"city"?: string | null,"company_name"?: string | null,"created_at"?: string,"cvr"?: string | null,"display_name": string,"email": string,"id"?: string,"phone"?: string | null,"price_text"?: string | null,"profile_text"?: string | null,"public_profile"?: boolean,"specialties"?: (string)[],"suspended"?: boolean,"updated_at"?: string,"user_id": string,"verified"?: boolean,"website"?: string | null
                  }
                  Update: {
                    "accepts_new_clients"?: boolean,"approved_by_admin"?: boolean,"area"?: string | null,"city"?: string | null,"company_name"?: string | null,"created_at"?: string,"cvr"?: string | null,"display_name"?: string,"email"?: string,"id"?: string,"phone"?: string | null,"price_text"?: string | null,"profile_text"?: string | null,"public_profile"?: boolean,"specialties"?: (string)[],"suspended"?: boolean,"updated_at"?: string,"user_id"?: string,"verified"?: boolean,"website"?: string | null
                  }
                  Relationships: [

                  ]
                },"representative_requests": {
                  Row: {
                    "citizen_id": string,"created_at": string,"handled_at": string | null,"id": string,"message": string | null,"representative_id": string,"status": string
                  }
                  Insert: {
                    "citizen_id": string,"created_at"?: string,"handled_at"?: string | null,"id"?: string,"message"?: string | null,"representative_id": string,"status"?: string
                  }
                  Update: {
                    "citizen_id"?: string,"created_at"?: string,"handled_at"?: string | null,"id"?: string,"message"?: string | null,"representative_id"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "representative_requests_citizen_id_fkey"
      columns: ["citizen_id"]
isOneToOne: false
      referencedRelation: "citizens"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "representative_requests_representative_id_fkey"
      columns: ["representative_id"]
isOneToOne: false
      referencedRelation: "representative_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"work_tasks": {
                  Row: {
                    "created_at": string,"diary_entry_id": string,"id": string,"limitation_description": string | null,"status": Database["public"]['Enums']["task_status"],"support_description": string | null,"task_description": string
                  }
                  Insert: {
                    "created_at"?: string,"diary_entry_id": string,"id"?: string,"limitation_description"?: string | null,"status": Database["public"]['Enums']["task_status"],"support_description"?: string | null,"task_description": string
                  }
                  Update: {
                    "created_at"?: string,"diary_entry_id"?: string,"id"?: string,"limitation_description"?: string | null,"status"?: Database["public"]['Enums']["task_status"],"support_description"?: string | null,"task_description"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "work_tasks_diary_entry_id_fkey"
      columns: ["diary_entry_id"]
isOneToOne: false
      referencedRelation: "diary_entries"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_representative_request":
{ Args: { "p_request_id": string }; Returns: string
                           },
"admin_set_representative_state":
{ Args: { "p_accepts_new_clients"?: boolean,"p_approved"?: boolean,"p_promote_to_representative"?: boolean,"p_public_profile"?: boolean,"p_suspended"?: boolean,"p_user_id": string,"p_verified"?: boolean }; Returns: undefined
                           },
"can_access_citizen":
{ Args: { "citizen_uuid": string }; Returns: boolean
                           },
"can_edit_diary_entry":
{ Args: { "entry_date": string }; Returns: boolean
                           },
"can_represent_citizen":
{ Args: { "citizen_uuid": string }; Returns: boolean
                           },
"complete_representative_onboarding":
{ Args: { "p_accepts_new_clients"?: boolean,"p_area"?: string,"p_city"?: string,"p_company_name"?: string,"p_cvr"?: string,"p_display_name": string,"p_phone"?: string,"p_price_text"?: string,"p_profile_text"?: string,"p_public_profile"?: boolean,"p_specialties"?: (string)[],"p_website"?: string }; Returns: string
                           },
"current_user_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"is_administrator":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_platform_administrator":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_representative":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"owns_citizen":
{ Args: { "citizen_uuid": string }; Returns: boolean
                           },
"reject_representative_request":
{ Args: { "p_request_id": string }; Returns: undefined
                           },
"safe_uuid":
{ Args: { "p_value": string }; Returns: string
                           },
"submit_representative_application":
{ Args: { "p_city_area"?: string,"p_company_name"?: string,"p_cvr"?: string,"p_email": string,"p_name": string,"p_phone": string,"p_profile_text"?: string,"p_reason"?: string,"p_role_title": string,"p_website"?: string }; Returns: string
                           },
"write_audit_log":
{ Args: { "p_action": string,"p_citizen_id"?: string,"p_metadata"?: Json,"p_record_id"?: string,"p_table_name"?: string }; Returns: string
                           }
          }
          Enums: {
            "attachment_context": "diary_day"|"practice_day"|"functional_description","deletion_request_status": "requested"|"processing"|"completed"|"rejected","diary_status": "draft"|"completed"|"reviewed_by_administrator"|"locked","functional_description_status": "draft"|"for_review"|"approved"|"exported","task_status": "completed"|"partially_completed"|"attempted_but_stopped"|"skipped"|"completed_with_support","user_role": "citizen"|"administrator"|"representative"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {

          }
        },"public": {
          Enums: {
            "attachment_context": ["diary_day", "practice_day", "functional_description"],"deletion_request_status": ["requested", "processing", "completed", "rejected"],"diary_status": ["draft", "completed", "reviewed_by_administrator", "locked"],"functional_description_status": ["draft", "for_review", "approved", "exported"],"task_status": ["completed", "partially_completed", "attempted_but_stopped", "skipped", "completed_with_support"],"user_role": ["citizen", "administrator", "representative"]
          }
        }
} as const
