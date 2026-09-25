\set ON_ERROR_STOP on

begin;

-- ============================================================
-- Favn360 Core
-- Representative application security tests
-- ============================================================

create or replace function pg_temp.pass(description text)
returns void
language plpgsql
as $$
begin
  raise notice 'PASS: %', description;
end;
$$;

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


-- ============================================================
-- Fixture: authenticated citizen account
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
values (
  '10000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'application-test@favn360.test',
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
values (
  '10000000-0000-0000-0000-000000000011',
  'application-test@favn360.test',
  'Application Test',
  'citizen'
)
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;


-- ============================================================
-- TEST 1
-- anon must NOT be able to execute submission RPC
-- ============================================================

set local role anon;

select set_config(
  'request.jwt.claims',
  '{}',
  true
);

do $$
begin
  begin
    perform public.submit_representative_application(
      'Anonymous Applicant',
      'anonymous@favn360.test',
      '12345678',
      'Socialrådgiver',
      null,
      null,
      'Aalborg',
      null,
      null,
      'Dette er en anonym ansøgning som skal blive afvist.'
    );

    raise exception
      'SECURITY FAILURE: anon executed representative application RPC';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'anon cannot execute representative application RPC'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- TEST 2
-- authenticated user may submit own application
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '10000000-0000-0000-0000-000000000011',
    'role', 'authenticated',
    'email', 'application-test@favn360.test'
  )::text,
  true
);

select public.submit_representative_application(
  'Application Test',
  'application-test@favn360.test',
  '12345678',
  'Socialrådgiver',
  'Favn360 Test',
  null,
  'Aalborg',
  null,
  'Testprofil',
  'Dette er en gyldig testansøgning til Favn360.'
);

reset role;

select pg_temp.assert_eq(
  (
    select count(*)
    from public.representative_applications
    where applicant_user_id =
      '10000000-0000-0000-0000-000000000011'::uuid
      and email = 'application-test@favn360.test'
      and status = 'pending'
  ),
  1,
  'Authenticated user can submit own representative application'
);


-- ============================================================
-- TEST 3
-- authenticated user cannot spoof another email address
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '10000000-0000-0000-0000-000000000011',
    'role', 'authenticated',
    'email', 'application-test@favn360.test'
  )::text,
  true
);

do $$
begin
  begin
    perform public.submit_representative_application(
      'Application Test',
      'victim@example.test',
      '12345678',
      'Socialrådgiver',
      null,
      null,
      'Aalborg',
      null,
      null,
      'Dette forsøg bruger en anden e-mailadresse end kontoen.'
    );

    raise exception
      'SECURITY FAILURE: authenticated user spoofed application email';

  exception
    when others then

      if SQLERRM = 'SECURITY FAILURE: authenticated user spoofed application email' then
        raise;
      end if;

      perform pg_temp.pass(
        'Authenticated user cannot spoof application email'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- TEST 4
-- authenticated user cannot create another active application
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '10000000-0000-0000-0000-000000000011',
    'role', 'authenticated',
    'email', 'application-test@favn360.test'
  )::text,
  true
);

do $$
begin
  begin
    perform public.submit_representative_application(
      'Application Test',
      'application-test@favn360.test',
      '12345678',
      'Socialrådgiver',
      null,
      null,
      'Aalborg',
      null,
      null,
      'Dette er en ekstra aktiv ansøgning som skal blive afvist.'
    );

    raise exception
      'SECURITY FAILURE: user created duplicate active application';

  exception
    when others then

      if SQLERRM = 'SECURITY FAILURE: user created duplicate active application' then
        raise;
      end if;

      perform pg_temp.pass(
        'Authenticated user cannot create duplicate active application'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- TEST 5
-- applicant_user_id must be derived from auth.uid()
-- ============================================================

select pg_temp.assert_eq(
  (
    select count(*)
    from public.representative_applications
    where applicant_user_id =
      '10000000-0000-0000-0000-000000000011'::uuid
  ),
  1,
  'Application is bound to authenticated auth.uid()'
);


rollback;
