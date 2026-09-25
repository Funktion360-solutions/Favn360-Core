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
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at
)
values
(
  '10000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'flow-citizen@favn360.test', '', now(), now(), now()
),
(
  '10000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'flow-rep@favn360.test', '', now(), now(), now()
),
(
  '10000000-0000-0000-0000-000000000033',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'wrong-rep@favn360.test', '', now(), now(), now()
);

update public.profiles
set
  full_name = 'Flow Citizen',
  role = 'citizen'
where id = '10000000-0000-0000-0000-000000000031';

update public.profiles
set
  full_name = 'Flow Representative',
  role = 'representative'
where id = '10000000-0000-0000-0000-000000000032';

update public.profiles
set
  full_name = 'Wrong Representative',
  role = 'representative'
where id = '10000000-0000-0000-0000-000000000033';

insert into public.citizens (id, user_id, citizen_name)
values (
  '20000000-0000-0000-0000-000000000031',
  '10000000-0000-0000-0000-000000000031',
  'Flow Citizen'
);

insert into public.representative_profiles (
  id, user_id, display_name, email,
  verified, approved_by_admin, suspended
)
values
(
  '30000000-0000-0000-0000-000000000031',
  '10000000-0000-0000-0000-000000000032',
  'Flow Representative',
  'flow-rep@favn360.test',
  true, true, false
),
(
  '30000000-0000-0000-0000-000000000032',
  '10000000-0000-0000-0000-000000000033',
  'Wrong Representative',
  'wrong-rep@favn360.test',
  true, true, false
);

-- ============================================================
-- 1. Citizen creates legitimate request
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000031","role":"authenticated"}',
  true
);

insert into public.representative_requests (
  id,
  citizen_id,
  representative_id,
  status
)
values (
  '40000000-0000-0000-0000-000000000031',
  '20000000-0000-0000-0000-000000000031',
  '30000000-0000-0000-0000-000000000031',
  'pending'
);

reset role;

select pg_temp.pass(
  'Citizen can create a pending representative request'
);

-- ============================================================
-- 2. Wrong representative cannot accept it
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000033","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.accept_representative_request(
      '40000000-0000-0000-0000-000000000031'
    );

    raise exception 'SECURITY FAILURE: wrong representative accepted request';

  exception
    when others then
      if SQLERRM = 'SECURITY FAILURE: wrong representative accepted request' then
        raise;
      end if;

      perform pg_temp.pass(
        'Wrong representative cannot accept another representative request'
      );
  end;
end;
$$;

reset role;

-- ============================================================
-- 3. Direct UPDATE is denied
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000032","role":"authenticated"}',
  true
);

do $$
begin
  begin
    update public.representative_requests
    set status = 'accepted'
    where id = '40000000-0000-0000-0000-000000000031';

    raise exception 'SECURITY FAILURE: representative directly updated request';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'Representative cannot directly update representative_requests'
      );
  end;
end;
$$;

reset role;

-- ============================================================
-- 4. Correct representative accepts through RPC
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000032","role":"authenticated"}',
  true
);

select public.accept_representative_request(
  '40000000-0000-0000-0000-000000000031'
);

reset role;

do $$
begin
  if not exists (
    select 1
    from public.representative_requests
    where id = '40000000-0000-0000-0000-000000000031'
      and status = 'accepted'
  ) then
    raise exception 'FAILED: request was not marked accepted';
  end if;

  perform pg_temp.pass(
    'Correct representative can accept pending request'
  );
end;
$$;

-- ============================================================
-- 5. Active relationship was created correctly
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from public.citizen_representative_links
    where citizen_id =
      '20000000-0000-0000-0000-000000000031'
      and representative_id =
      '30000000-0000-0000-0000-000000000031'
      and status = 'active'
  ) then
    raise exception 'FAILED: active representative link was not created';
  end if;

  perform pg_temp.pass(
    'Acceptance creates active citizen representative relationship'
  );
end;
$$;

-- ============================================================
-- 6. Accepted request cannot be accepted twice
-- ============================================================

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000032","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.accept_representative_request(
      '40000000-0000-0000-0000-000000000031'
    );

    raise exception 'SECURITY FAILURE: accepted request was accepted twice';

  exception
    when others then
      if SQLERRM = 'SECURITY FAILURE: accepted request was accepted twice' then
        raise;
      end if;

      perform pg_temp.pass(
        'Accepted request cannot be accepted twice'
      );
  end;
end;
$$;

reset role;

-- ============================================================
-- 7. anon cannot execute acceptance RPC
-- ============================================================

set local role anon;

select set_config('request.jwt.claims', '{}', true);

do $$
begin
  begin
    perform public.accept_representative_request(
      '40000000-0000-0000-0000-000000000031'
    );

    raise exception 'SECURITY FAILURE: anon executed acceptance RPC';

  exception
    when insufficient_privilege then
      perform pg_temp.pass(
        'anon cannot execute representative acceptance RPC'
      );
  end;
end;
$$;

reset role;

rollback;
