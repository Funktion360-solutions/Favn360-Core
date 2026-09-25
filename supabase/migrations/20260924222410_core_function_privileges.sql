-- ============================================================
-- Favn360 Core function privileges
-- ============================================================
--
-- Remove PostgreSQL's broad default EXECUTE exposure and expose
-- only the functions required by authenticated application flows,
-- RLS evaluation, or the explicitly public application flow.
-- ============================================================


-- ------------------------------------------------------------
-- Internal trigger functions
-- ------------------------------------------------------------

-- These functions are invoked by database triggers, not directly
-- by Favn360 clients.

revoke execute on function public.calculate_work_minutes()
from public, anon, authenticated;

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.set_updated_at()
from public, anon, authenticated;


-- ------------------------------------------------------------
-- Authenticated RLS / authorization helpers
-- ------------------------------------------------------------

revoke execute on function public.can_access_citizen(uuid)
from public, anon;

grant execute on function public.can_access_citizen(uuid)
to authenticated;


revoke execute on function public.can_edit_diary_entry(date)
from public, anon;

grant execute on function public.can_edit_diary_entry(date)
to authenticated;


revoke execute on function public.can_represent_citizen(uuid)
from public, anon;

grant execute on function public.can_represent_citizen(uuid)
to authenticated;


revoke execute on function public.current_user_role()
from public, anon;

grant execute on function public.current_user_role()
to authenticated;


revoke execute on function public.is_administrator()
from public, anon;

grant execute on function public.is_administrator()
to authenticated;


revoke execute on function public.is_platform_administrator()
from public, anon;

grant execute on function public.is_platform_administrator()
to authenticated;


revoke execute on function public.is_representative()
from public, anon;

grant execute on function public.is_representative()
to authenticated;


revoke execute on function public.owns_citizen(uuid)
from public, anon;

grant execute on function public.owns_citizen(uuid)
to authenticated;


-- Used by authenticated storage policies to safely parse
-- citizen IDs from object paths.
revoke execute on function public.safe_uuid(text)
from public, anon;

grant execute on function public.safe_uuid(text)
to authenticated;


-- ------------------------------------------------------------
-- Administrative representative state RPC
-- ------------------------------------------------------------

revoke execute on function public.admin_set_representative_state(
  uuid,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
)
from public, anon;

grant execute on function public.admin_set_representative_state(
  uuid,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
)
to authenticated;


-- ------------------------------------------------------------
-- Representative onboarding RPC
-- ------------------------------------------------------------

revoke execute on function public.complete_representative_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text,
  text,
  boolean,
  boolean
)
from public, anon;

grant execute on function public.complete_representative_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text,
  text,
  boolean,
  boolean
)
to authenticated;


-- ------------------------------------------------------------
-- Public representative application RPC
-- ------------------------------------------------------------

-- Intentionally callable without authentication.
-- Direct table access to representative_applications remains
-- unavailable to anon.

revoke execute on function public.submit_representative_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;

grant execute on function public.submit_representative_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to anon, authenticated;


-- ------------------------------------------------------------
-- Audit RPC
-- ------------------------------------------------------------

revoke execute on function public.write_audit_log(
  text,
  uuid,
  text,
  uuid,
  jsonb
)
from public, anon;

grant execute on function public.write_audit_log(
  text,
  uuid,
  text,
  uuid,
  jsonb
)
to authenticated;