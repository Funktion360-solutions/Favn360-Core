-- ============================================================
-- Favn360 Core canonical administrator helper
-- ============================================================
--
-- is_administrator() is the canonical authorization helper.
-- The legacy is_platform_administrator() name remains temporarily
-- as a compatibility wrapper for existing RLS policies.
-- ============================================================

create or replace function public.is_platform_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_administrator();
$$;

revoke all on function public.is_platform_administrator()
from public, anon;

grant execute on function public.is_platform_administrator()
to authenticated;