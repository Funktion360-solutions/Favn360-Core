-- ============================================================
-- Favn360 Core RLS role normalization
-- ============================================================
--
-- Direct table privileges are already least-privilege.
-- This migration makes authentication requirements explicit
-- in RLS instead of relying on TO public + auth.uid() checks.
-- ============================================================


-- ------------------------------------------------------------
-- Normalize all existing Core policies to authenticated.
-- representative_profiles is handled separately below because
-- it intentionally has an anonymous public-directory policy.
-- ------------------------------------------------------------

do $$
declare
  p record;
begin
  for p in
    select
      schemaname,
      tablename,
      policyname
    from pg_policies
    where schemaname = 'public'
      and roles = array['public']::name[]
      and not (
        tablename = 'representative_profiles'
        and policyname = 'representative profiles public approved select'
      )
  loop
    execute format(
      'alter policy %I on %I.%I to authenticated',
      p.policyname,
      p.schemaname,
      p.tablename
    );
  end loop;
end
$$;


-- ------------------------------------------------------------
-- Representative directory
-- ------------------------------------------------------------

-- The old policy mixed:
--   1. anonymous public-directory access
--   2. representative own-profile access
--   3. administrator access
--
-- Split those concerns explicitly.

drop policy if exists
  "representative profiles public approved select"
on public.representative_profiles;


create policy "representative profiles public directory select"
on public.representative_profiles
for select
to anon
using (
  public_profile = true
  and accepts_new_clients = true
  and approved_by_admin = true
  and suspended = false
);


create policy "representative profiles authenticated select"
on public.representative_profiles
for select
to authenticated
using (
  (
    public_profile = true
    and accepts_new_clients = true
    and approved_by_admin = true
    and suspended = false
  )
  or user_id = auth.uid()
  or is_administrator()
);


-- ------------------------------------------------------------
-- Remove superseded duplicate AI select policy
-- ------------------------------------------------------------

-- The newer authenticated policy "ai analyses select" provides
-- the same citizen / representative / administrator access using
-- the canonical is_administrator() helper.

drop policy if exists
  "ai analyses own representative or administrator select"
on public.ai_analyses;
