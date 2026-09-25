-- ============================================================
-- Favn360 Core least-privilege table grants
-- ============================================================

-- Remove direct client privileges inherited from the imported
-- legacy schema. Explicit grants are restored below.

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;

-- ------------------------------------------------------------
-- Anonymous access
-- ------------------------------------------------------------

-- Public representative directory.
-- RLS continues to restrict this to approved public profiles.
grant select on public.representative_profiles to anon;

-- ------------------------------------------------------------
-- Authenticated Core access
-- ------------------------------------------------------------

grant select, insert, update
  on public.ai_analyses
  to authenticated;

grant select
  on public.ai_summaries
  to authenticated;

grant select
  on public.attachments
  to authenticated;

grant select, insert, update, delete
  on public.calendar_events
  to authenticated;

grant select, insert
  on public.citizen_case_notes
  to authenticated;

grant select, insert, delete
  on public.citizen_consents
  to authenticated;

grant select, insert, delete
  on public.citizen_contacts
  to authenticated;

grant select, insert, delete
  on public.citizen_employment
  to authenticated;

grant select, insert, delete
  on public.citizen_function_profile
  to authenticated;

grant select, insert, delete
  on public.citizen_goals
  to authenticated;

grant select, insert, update
  on public.citizen_onboarding
  to authenticated;

grant select, insert
  on public.citizen_representative_links
  to authenticated;

grant select, insert
  on public.citizens
  to authenticated;

grant select, insert, update
  on public.diary_entries
  to authenticated;

grant select
  on public.diary_notes
  to authenticated;

grant select, insert, delete
  on public.documents
  to authenticated;

grant select, insert, update
  on public.messages
  to authenticated;

grant select, insert, delete
  on public.pdf_exports
  to authenticated;

grant select
  on public.profiles
  to authenticated;

grant select, update
  on public.representative_applications
  to authenticated;

grant select
  on public.representative_profiles
  to authenticated;

grant select, insert, update
  on public.representative_requests
  to authenticated;
