\set ON_ERROR_STOP on

begin;

-- ============================================================
-- Favn360 Core adversarial RLS tests
-- ============================================================
--
-- LOCAL TEST ONLY.
-- Everything is rolled back at the end.
-- ============================================================


-- ------------------------------------------------------------
-- Deterministic test identities
-- ------------------------------------------------------------

\set citizen_a_user '10000000-0000-0000-0000-000000000001'
\set citizen_b_user '10000000-0000-0000-0000-000000000002'
\set representative_user '10000000-0000-0000-0000-000000000003'
\set administrator_user '10000000-0000-0000-0000-000000000004'

\set citizen_a '20000000-0000-0000-0000-000000000001'
\set citizen_b '20000000-0000-0000-0000-000000000002'

\set representative_profile '30000000-0000-0000-0000-000000000001'


-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------

create or replace function pg_temp.assert_eq(
  actual bigint,
  expected bigint,
  description text
)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception
      'FAILED: % -- expected %, got %',
      description,
      expected,
      actual;
  end if;

  raise notice 'PASS: %', description;
end;
$$;


-- ------------------------------------------------------------
-- Fixtures
-- ------------------------------------------------------------
--
-- Fixture creation runs with postgres privileges before we
-- impersonate Supabase API roles.
-- ------------------------------------------------------------

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values
(
  :'citizen_a_user'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rls-citizen-a@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'citizen_b_user'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rls-citizen-b@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'representative_user'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rls-representative@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'administrator_user'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rls-administrator@favn360.test',
  '',
  now(),
  now(),
  now()
);

-- handle_new_user may already have created profile rows.
insert into public.profiles (
  id,
  email,
  full_name,
  role
)
values
(
  :'citizen_a_user',
  'rls-citizen-a@favn360.test',
  'RLS Citizen A',
  'citizen'
),
(
  :'citizen_b_user',
  'rls-citizen-b@favn360.test',
  'RLS Citizen B',
  'citizen'
),
(
  :'representative_user',
  'rls-representative@favn360.test',
  'RLS Representative',
  'representative'
),
(
  :'administrator_user',
  'rls-administrator@favn360.test',
  'RLS Administrator',
  'administrator'
)
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;

insert into public.citizens (
  id,
  user_id,
  citizen_name
)
values
(
  :'citizen_a',
  :'citizen_a_user',
  'RLS Citizen A'
),
(
  :'citizen_b',
  :'citizen_b_user',
  'RLS Citizen B'
);

insert into public.representative_profiles (
  id,
  user_id,
  display_name,
  email,
  accepts_new_clients,
  public_profile,
  verified,
  approved_by_admin,
  suspended
)
values (
  :'representative_profile',
  :'representative_user',
  'RLS Representative',
  'rls-representative@favn360.test',
  true,
  true,
  true,
  true,
  false
);

insert into public.citizen_representative_links (
  citizen_id,
  representative_id,
  status,
  requested_by,
  approved_by,
  started_at
)
values (
  :'citizen_a',
  :'representative_profile',
  'active',
  :'citizen_a_user',
  :'administrator_user',
  now()
);

insert into public.diary_entries (
  citizen_id,
  entry_date,
  created_by,
  work_notes
)
values
(
  :'citizen_a',
  current_date - 1,
  :'citizen_a_user',
  'Citizen A secret diary data'
),
(
  :'citizen_b',
  current_date - 1,
  :'citizen_b_user',
  'Citizen B secret diary data'
);

insert into public.documents (
  citizen_id,
  uploaded_by,
  file_name,
  file_path
)
values
(
  :'citizen_a',
  :'citizen_a_user',
  'citizen-a.pdf',
  :'citizen_a' || '/citizen-a.pdf'
),
(
  :'citizen_b',
  :'citizen_b_user',
  'citizen-b.pdf',
  :'citizen_b' || '/citizen-b.pdf'
);


-- ============================================================
-- ANON
-- ============================================================

set local role anon;
select set_config('request.jwt.claims', '{}', true);

select pg_temp.assert_eq(
  (select count(*) from public.representative_profiles),
  1,
  'anon can read approved public representative'
);

reset role;


-- ============================================================
-- CITIZEN A
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'citizen_a_user',
    'role', 'authenticated',
    'email', 'rls-citizen-a@favn360.test'
  )::text,
  true
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_a'
  ),
  1,
  'Citizen A can read own citizen record'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_b'
  ),
  0,
  'Citizen A cannot read Citizen B'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id = :'citizen_a'
  ),
  1,
  'Citizen A can read own diary'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id = :'citizen_b'
  ),
  0,
  'Citizen A cannot read Citizen B diary'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.documents
    where citizen_id = :'citizen_b'
  ),
  0,
  'Citizen A cannot read Citizen B documents'
);

reset role;


-- ============================================================
-- CITIZEN B
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'citizen_b_user',
    'role', 'authenticated',
    'email', 'rls-citizen-b@favn360.test'
  )::text,
  true
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_b'
  ),
  1,
  'Citizen B can read own citizen record'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_a'
  ),
  0,
  'Citizen B cannot read Citizen A'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id = :'citizen_a'
  ),
  0,
  'Citizen B cannot read Citizen A diary'
);

reset role;


-- ============================================================
-- REPRESENTATIVE
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'representative_user',
    'role', 'authenticated',
    'email', 'rls-representative@favn360.test'
  )::text,
  true
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_a'
  ),
  1,
  'Representative can read represented Citizen A'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id = :'citizen_b'
  ),
  0,
  'Representative cannot read unrelated Citizen B'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id = :'citizen_a'
  ),
  1,
  'Representative can read Citizen A diary'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id = :'citizen_b'
  ),
  0,
  'Representative cannot read Citizen B diary'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.documents
    where citizen_id = :'citizen_a'
  ),
  1,
  'Representative can read Citizen A documents'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.documents
    where citizen_id = :'citizen_b'
  ),
  0,
  'Representative cannot read Citizen B documents'
);

reset role;


-- ============================================================
-- ADMINISTRATOR
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'administrator_user',
    'role', 'authenticated',
    'email', 'rls-administrator@favn360.test'
  )::text,
  true
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.citizens
    where id in (:'citizen_a', :'citizen_b')
  ),
  2,
  'Administrator can read both citizen records'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.diary_entries
    where citizen_id in (:'citizen_a', :'citizen_b')
  ),
  2,
  'Administrator can read both diaries'
);

reset role;


rollback;
