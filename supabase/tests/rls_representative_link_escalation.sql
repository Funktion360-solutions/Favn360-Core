\set ON_ERROR_STOP on

begin;

create or replace function pg_temp.pass(description text)
returns void
language plpgsql
as $$
begin
  raise notice 'PASS: %', description;
end;
$$;

-- ============================================================
-- Fixtures
-- ============================================================

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
  '10000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'link-citizen@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  '10000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'link-representative@favn360.test',
  '',
  now(),
  now(),
  now()
);

insert into public.profiles (
  id,
  email,
  full_name,
  role
)
values
(
  '10000000-0000-0000-0000-000000000021',
  'link-citizen@favn360.test',
  'Link Citizen',
  'citizen'
),
(
  '10000000-0000-0000-0000-000000000022',
  'link-representative@favn360.test',
  'Link Representative',
  'representative'
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
values (
  '20000000-0000-0000-0000-000000000021',
  '10000000-0000-0000-0000-000000000021',
  'Unrelated Citizen'
);

insert into public.representative_profiles (
  id,
  user_id,
  display_name,
  email,
  verified,
  approved_by_admin,
  suspended
)
values (
  '30000000-0000-0000-0000-000000000021',
  '10000000-0000-0000-0000-000000000022',
  'Link Representative',
  'link-representative@favn360.test',
  true,
  true,
  false
);

-- ============================================================
-- ATTACK
--
-- Representative attempts to create an ACTIVE relationship
-- with a completely unrelated citizen.
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '10000000-0000-0000-0000-000000000022',
    'role', 'authenticated'
  )::text,
  true
);

do $$
begin
  begin
    insert into public.citizen_representative_links (
      citizen_id,
      representative_id,
      status,
      requested_by,
      started_at
    )
    values (
      '20000000-0000-0000-0000-000000000021'::uuid,
      '30000000-0000-0000-0000-000000000021'::uuid,
      'active',
      '10000000-0000-0000-0000-000000000022'::uuid,
      now()
    );

    raise exception
      'SECURITY FAILURE: representative self-authorized access to unrelated citizen';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Representative cannot self-authorize an active citizen relationship'
      );

    when others then
      if SQLERRM =
        'SECURITY FAILURE: representative self-authorized access to unrelated citizen'
      then
        raise;
      end if;

      raise;
  end;
end;
$$;

reset role;

rollback;
