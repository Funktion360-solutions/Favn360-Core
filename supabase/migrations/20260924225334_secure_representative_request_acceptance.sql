-- ============================================================
-- Favn360 Core
-- Secure representative request acceptance
-- ============================================================

-- Ordinary authenticated users must not create representative links
-- directly. Active relationships are created through the controlled
-- acceptance RPC below.

revoke insert, update
on public.citizen_representative_links
from authenticated;


-- ============================================================
-- Accept representative request
-- ============================================================

create or replace function public.accept_representative_request(
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.representative_requests%rowtype;
  v_link_id uuid;
begin
  select *
  into v_request
  from public.representative_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Representative request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Representative request is not pending';
  end if;

  if not exists (
    select 1
    from public.representative_profiles r
    where r.id = v_request.representative_id
      and r.user_id = auth.uid()
      and r.approved_by_admin = true
      and r.suspended = false
  ) then
    raise exception 'Representative access required';
  end if;

  -- Prevent more than one active representative for a citizen.
  if exists (
    select 1
    from public.citizen_representative_links l
    where l.citizen_id = v_request.citizen_id
      and l.status = 'active'
  ) then
    raise exception 'Citizen already has an active representative';
  end if;

  insert into public.citizen_representative_links (
    citizen_id,
    representative_id,
    status,
    requested_by,
    approved_by,
    started_at
  )
  values (
    v_request.citizen_id,
    v_request.representative_id,
    'active',
    (
      select c.user_id
      from public.citizens c
      where c.id = v_request.citizen_id
    ),
    auth.uid(),
    now()
  )
  returning id into v_link_id;

  update public.representative_requests
  set status = 'accepted'
  where id = v_request.id;

  return v_link_id;
end;
$$;

revoke all
on function public.accept_representative_request(uuid)
from public, anon;

grant execute
on function public.accept_representative_request(uuid)
to authenticated;


-- ============================================================
-- Reject representative request
-- ============================================================

create or replace function public.reject_representative_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.representative_requests%rowtype;
begin
  select *
  into v_request
  from public.representative_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Representative request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Representative request is not pending';
  end if;

  if not exists (
    select 1
    from public.representative_profiles r
    where r.id = v_request.representative_id
      and r.user_id = auth.uid()
      and r.approved_by_admin = true
      and r.suspended = false
  ) then
    raise exception 'Representative access required';
  end if;

  update public.representative_requests
  set status = 'rejected'
  where id = v_request.id;
end;
$$;

revoke all
on function public.reject_representative_request(uuid)
from public, anon;

grant execute
on function public.reject_representative_request(uuid)
to authenticated;
