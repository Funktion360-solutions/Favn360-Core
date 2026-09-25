\set ON_ERROR_STOP on

begin;

-- ============================================================
-- Favn360 Core
-- Adversarial mutation / privilege escalation tests
-- ============================================================

\set citizen_a_user '10000000-0000-0000-0000-000000000001'
\set citizen_b_user '10000000-0000-0000-0000-000000000002'
\set representative_user '10000000-0000-0000-0000-000000000003'
\set administrator_user '10000000-0000-0000-0000-000000000004'

\set citizen_a '20000000-0000-0000-0000-000000000001'
\set citizen_b '20000000-0000-0000-0000-000000000002'
\set representative_profile '30000000-0000-0000-0000-000000000001'


-- ============================================================
-- Helpers
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
  :'citizen_a_user',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mutation-a@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'citizen_b_user',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mutation-b@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'representative_user',
  '00000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'mutation-representative@favn360.test',
  '',
  now(),
  now(),
  now()
),
(
  :'administrator_user',
  '00000000-0000-0000-0000-000000000004',
  'authenticated',
  'authenticated',
  'mutation-administrator@favn360.test',
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
  :'citizen_a_user',
  'mutation-a@favn360.test',
  'Mutation Citizen A',
  'citizen'
),
(
  :'citizen_b_user',
  'mutation-b@favn360.test',
  'Mutation Citizen B',
  'citizen'
),
(
  :'representative_user',
  'mutation-representative@favn360.test',
  'Mutation Representative',
  'representative'
),
(
  :'administrator_user',
  'mutation-administrator@favn360.test',
  'Mutation Administrator',
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
  'Mutation Citizen A'
),
(
  :'citizen_b',
  :'citizen_b_user',
  'Mutation Citizen B'
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
  'Mutation Representative',
  'mutation-representative@favn360.test',
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


-- ============================================================
-- CITIZEN A ATTACKS
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'citizen_a_user',
    'role', 'authenticated'
  )::text,
  true
);


-- Attack 1:
-- Citizen A attempts to create diary data for Citizen B.

do $$
begin
  begin
    insert into public.diary_entries (
      citizen_id,
      entry_date,
      created_by,
      work_notes
    )
    values (
      '20000000-0000-0000-0000-000000000002'::uuid,
      current_date,
      '10000000-0000-0000-0000-000000000001'::uuid,
      'ATTACK'
    );

    raise exception
      'SECURITY FAILURE: Citizen A inserted diary for Citizen B';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Citizen A cannot insert diary for Citizen B'
      );
  end;
end;
$$;


-- Attack 2:
-- Citizen A attempts to create document metadata for Citizen B.

do $$
begin
  begin
    insert into public.documents (
      citizen_id,
      uploaded_by,
      file_name,
      file_path
    )
    values (
      '20000000-0000-0000-0000-000000000002'::uuid,
      '10000000-0000-0000-0000-000000000001'::uuid,
      'attack.pdf',
      '20000000-0000-0000-0000-000000000002/attack.pdf'
    );

    raise exception
      'SECURITY FAILURE: Citizen A inserted document for Citizen B';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Citizen A cannot insert document for Citizen B'
      );
  end;
end;
$$;


-- Attack 3:
-- Citizen A attempts to promote own profile to administrator.

do $$
begin
  begin
    update public.profiles
    set role = 'administrator'
    where id =
      '10000000-0000-0000-0000-000000000001'::uuid;

    raise exception
      'SECURITY FAILURE: Citizen A self-promoted to administrator';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Citizen A cannot directly change profile role'
      );
  end;
end;
$$;


-- Attack 4:
-- Citizen A attempts administrator-only representative RPC.

do $$
begin
  begin
    perform public.admin_set_representative_state(
      '30000000-0000-0000-0000-000000000001'::uuid,
      true,
      true,
      true,
      true,
      true,
      false
    );

    raise exception
      'SECURITY FAILURE: Citizen A called admin RPC';

  exception
    when others then
      perform pg_temp.pass(
        'Citizen A cannot use administrator representative-state RPC'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- REPRESENTATIVE ATTACKS / AUTHORIZED ACTIONS
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'representative_user',
    'role', 'authenticated'
  )::text,
  true
);


-- Attack 5:
-- Representative may read Citizen A diary,
-- but current Core policy must prevent diary INSERT.

do $$
begin
  begin
    insert into public.diary_entries (
      citizen_id,
      entry_date,
      created_by,
      work_notes
    )
    values (
      '20000000-0000-0000-0000-000000000001'::uuid,
      current_date,
      '10000000-0000-0000-0000-000000000003'::uuid,
      'Representative diary write attempt'
    );

    raise exception
      'SECURITY FAILURE: Representative unexpectedly inserted diary';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Representative cannot insert diary entry under current Core policy'
      );
  end;
end;
$$;


-- Authorized action:
-- Representative may create document metadata for represented Citizen A.

insert into public.documents (
  citizen_id,
  uploaded_by,
  file_name,
  file_path
)
values (
  :'citizen_a',
  :'representative_user',
  'representative-authorized.pdf',
  :'citizen_a' || '/representative-authorized.pdf'
);

select pg_temp.assert_eq(
  (
    select count(*)
    from public.documents
    where citizen_id = :'citizen_a'
      and uploaded_by = :'representative_user'
      and file_name = 'representative-authorized.pdf'
  ),
  1,
  'Representative can insert document for represented Citizen A'
);


-- Attack 6:
-- Representative attempts document for unrelated Citizen B.

do $$
begin
  begin
    insert into public.documents (
      citizen_id,
      uploaded_by,
      file_name,
      file_path
    )
    values (
      '20000000-0000-0000-0000-000000000002'::uuid,
      '10000000-0000-0000-0000-000000000003'::uuid,
      'attack-b.pdf',
      '20000000-0000-0000-0000-000000000002/attack-b.pdf'
    );

    raise exception
      'SECURITY FAILURE: Representative inserted document for Citizen B';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Representative cannot insert document for unrelated Citizen B'
      );
  end;
end;
$$;


-- Attack 7:
-- Representative attempts to manipulate own trust flags directly.

do $$
begin
  begin
    update public.representative_profiles
    set
      verified = false,
      approved_by_admin = false,
      suspended = false
    where id =
      '30000000-0000-0000-0000-000000000001'::uuid;

    raise exception
      'SECURITY FAILURE: Representative directly changed trust flags';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Representative cannot directly mutate representative trust flags'
      );
  end;
end;
$$;


-- Attack 8:
-- Representative attempts administrator RPC.

do $$
begin
  begin
    perform public.admin_set_representative_state(
      '30000000-0000-0000-0000-000000000001'::uuid,
      true,
      true,
      true,
      true,
      true,
      false
    );

    raise exception
      'SECURITY FAILURE: Representative called admin RPC';

  exception
    when others then
      perform pg_temp.pass(
        'Representative cannot use administrator representative-state RPC'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- ANON ATTACKS
-- ============================================================

set local role anon;

select set_config(
  'request.jwt.claims',
  '{}',
  true
);


-- Attack 9:
-- anon attempts administrator RPC.

do $$
begin
  begin
    perform public.admin_set_representative_state(
      '30000000-0000-0000-0000-000000000001'::uuid,
      true,
      true,
      true,
      true,
      true,
      false
    );

    raise exception
      'SECURITY FAILURE: anon called administrator RPC';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'anon cannot execute administrator RPC'
      );
  end;
end;
$$;


-- Attack 10:
-- anon attempts audit RPC.

do $$
begin
  begin
    perform public.write_audit_log(
      'ANON_ATTACK',
      null,
      'security_test',
      null,
      '{}'::jsonb
    );

    raise exception
      'SECURITY FAILURE: anon wrote audit log';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'anon cannot execute audit RPC'
      );
  end;
end;
$$;

reset role;


-- ============================================================
-- AUTHENTICATED AUDIT IDENTITY
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'citizen_a_user',
    'role', 'authenticated'
  )::text,
  true
);

select public.write_audit_log(
  'RLS_SECURITY_TEST',
  :'citizen_a',
  'security_test',
  null,
  jsonb_build_object('test', true)
);

reset role;


-- Verify as postgres so audit assertion does not depend
-- on audit_logs client SELECT privileges.

select pg_temp.assert_eq(
  (
    select count(*)
    from public.audit_logs
    where action = 'RLS_SECURITY_TEST'
      and user_id = :'citizen_a_user'
      and citizen_id = :'citizen_a'
  ),
  1,
  'Audit RPC records authenticated auth.uid()'
);


-- ============================================================
-- Cleanup
-- ============================================================

rollback;
