-- ============================================================
-- Favn360 Core role model normalization
-- ============================================================

-- app_role is a legacy enum. No database column uses this type.
drop type if exists public.app_role;

-- is_platform_administrator() duplicates is_administrator().
-- Replace remaining policy dependencies with the canonical helper.

drop policy if exists "ai analyses select" on public.ai_analyses;
create policy "ai analyses select"
on public.ai_analyses
for select
to authenticated
using (
  exists (
    select 1
    from public.citizens c
    where c.id = ai_analyses.citizen_id
      and c.user_id = auth.uid()
  )
  or public.can_represent_citizen(citizen_id)
  or public.is_administrator()
);

-- ============================================================
-- Favn360 Core role model normalization
-- ============================================================

-- Legacy enum from an earlier role model.
-- No database columns use this type.
drop type if exists public.app_role;