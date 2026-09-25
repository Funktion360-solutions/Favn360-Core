-- ============================================================
-- Favn360 Core
-- Secure representative application identity
-- ============================================================

alter table public.representative_applications
add column applicant_user_id uuid;

alter table public.representative_applications
add constraint representative_applications_applicant_user_id_fkey
foreign key (applicant_user_id)
references public.profiles(id)
on delete set null;


-- Existing rows are intentionally allowed to remain NULL.
-- New submissions through the RPC always receive auth.uid().


create unique index representative_applications_one_open_per_user
on public.representative_applications (applicant_user_id)
where applicant_user_id is not null
  and status in ('pending', 'approved');


create or replace function public.submit_representative_application(
  p_name text,
  p_email text,
  p_phone text,
  p_role_title text,
  p_company_name text default null,
  p_cvr text default null,
  p_city_area text default null,
  p_website text default null,
  p_profile_text text default null,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_user_id uuid;
  v_account_email text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(trim(email))
  into v_account_email
  from public.profiles
  where id = v_user_id;

  if v_account_email is null then
    raise exception 'Profile not found';
  end if;

  if lower(trim(coalesce(p_email, ''))) <> v_account_email then
    raise exception 'Application email must match authenticated account';
  end if;

  if exists (
    select 1
    from public.representative_applications
    where applicant_user_id = v_user_id
      and status in ('pending', 'approved')
  ) then
    raise exception 'An active application already exists';
  end if;

  if length(trim(coalesce(p_name, ''))) < 2
     or length(trim(p_name)) > 120 then
    raise exception 'Invalid name';
  end if;

  if length(trim(coalesce(p_email, ''))) < 3
     or length(trim(p_email)) > 254
     or position('@' in p_email) <= 1 then
    raise exception 'Invalid email';
  end if;

  if length(trim(coalesce(p_phone, ''))) < 7
     or length(trim(p_phone)) > 30 then
    raise exception 'Invalid phone';
  end if;

  if length(trim(coalesce(p_role_title, ''))) < 2
     or length(trim(p_role_title)) > 120 then
    raise exception 'Invalid role title';
  end if;

  if length(trim(coalesce(p_reason, ''))) < 20
     or length(trim(p_reason)) > 5000 then
    raise exception 'Invalid reason';
  end if;

  if length(coalesce(p_company_name, '')) > 160
     or length(coalesce(p_cvr, '')) > 20
     or length(coalesce(p_city_area, '')) > 120
     or length(coalesce(p_website, '')) > 500
     or length(coalesce(p_profile_text, '')) > 3000 then
    raise exception 'Invalid application data';
  end if;

  insert into public.representative_applications (
    applicant_user_id,
    name,
    email,
    phone,
    role_title,
    company_name,
    cvr,
    city_area,
    website,
    profile_text,
    reason,
    status,
    admin_note,
    decided_at,
    decided_by,
    invited_user_id,
    onboarding_unlocked
  )
  values (
    v_user_id,
    trim(p_name),
    v_account_email,
    trim(p_phone),
    trim(p_role_title),
    nullif(trim(coalesce(p_company_name, '')), ''),
    nullif(trim(coalesce(p_cvr, '')), ''),
    nullif(trim(coalesce(p_city_area, '')), ''),
    nullif(trim(coalesce(p_website, '')), ''),
    nullif(trim(coalesce(p_profile_text, '')), ''),
    trim(p_reason),
    'pending',
    null,
    null,
    null,
    null,
    false
  )
  returning id into v_id;

  return v_id;
end;
$$;


revoke all on function public.submit_representative_application(
  text, text, text, text, text, text, text, text, text, text
)
from public, anon;

grant execute on function public.submit_representative_application(
  text, text, text, text, text, text, text, text, text, text
)
to authenticated;