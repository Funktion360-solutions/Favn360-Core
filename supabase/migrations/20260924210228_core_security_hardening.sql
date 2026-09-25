-- Favn360 Core
-- Security hardening
--
-- This migration:
--   1. Secures representative applications with RLS.
--   2. Provides a constrained public RPC for submitting applications.
--   3. Hardens SECURITY DEFINER functions.
--   4. Prevents users from changing their own authorization role.
--   5. Restricts audit-log writes to the audit RPC.
--
-- Storage hardening is intentionally handled separately after the
-- application storage paths have been verified.

-- ============================================================
-- 1. Harden SECURITY DEFINER functions
-- ============================================================

alter function public.can_access_citizen(uuid)
  set search_path = public;

alter function public.can_represent_citizen(uuid)
  set search_path = public;

alter function public.current_user_role()
  set search_path = public;

alter function public.handle_new_user()
  set search_path = public;

alter function public.is_administrator()
  set search_path = public;

alter function public.is_platform_administrator()
  set search_path = public;

alter function public.is_representative()
  set search_path = public;

alter function public.owns_citizen(uuid)
  set search_path = public;


-- ============================================================
-- 2. representative_applications
-- ============================================================

alter table public.representative_applications
  enable row level security;

-- Direct anonymous access to the table is not required.
-- Applications are submitted through the constrained RPC below.

revoke all on table public.representative_applications from anon;

-- Authenticated users need SELECT for their own application and
-- administrators need SELECT/UPDATE for application processing.

revoke all on table public.representative_applications from authenticated;

grant select, update
on table public.representative_applications
to authenticated;


-- Administrators may read applications.

drop policy if exists representative_applications_admin_select
on public.representative_applications;

create policy representative_applications_admin_select
on public.representative_applications
for select
to authenticated
using (
  public.is_administrator()
);


-- An authenticated applicant may read an application matching the
-- authenticated user's email address.
--
-- auth.jwt()->>'email' is supplied by Supabase Auth. lower() keeps
-- comparison consistent with the application endpoint.

drop policy if exists representative_applications_own_select
on public.representative_applications;

create policy representative_applications_own_select
on public.representative_applications
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);


-- Only administrators may update applications.

drop policy if exists representative_applications_admin_update
on public.representative_applications;

create policy representative_applications_admin_update
on public.representative_applications
for update
to authenticated
using (
  public.is_administrator()
)
with check (
  public.is_administrator()
);


-- ============================================================
-- 3. Controlled representative-application submission
-- ============================================================

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
begin
  -- Server-side defensive validation. The application also validates
  -- input with Zod, but the database must not rely on the client.

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
    trim(p_name),
    lower(trim(p_email)),
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
) from public;

revoke all on function public.submit_representative_application(
  text, text, text, text, text, text, text, text, text, text
) from authenticated;

grant execute on function public.submit_representative_application(
  text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;


-- ============================================================
-- 4. Authorization and representative onboarding
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
-- Profiles contain the authorization role. Ordinary users must never
-- be able to modify that role directly.

revoke insert, update, delete, truncate
on table public.profiles
from anon;

revoke insert, update, delete, truncate
on table public.profiles
from authenticated;

-- Profiles are created by the auth.users trigger. Core currently does
-- not require direct profile writes from authenticated users.


-- ------------------------------------------------------------
-- representative_profiles
-- ------------------------------------------------------------
-- Trust fields such as verified, approved_by_admin and suspended must
-- never be writable by an ordinary representative.

revoke insert, update, delete, truncate
on table public.representative_profiles
from anon;

revoke insert, update, delete, truncate
on table public.representative_profiles
from authenticated;

-- Existing representatives may update only ordinary public/profile
-- information. Authorization/trust columns are intentionally excluded.

grant update (
  display_name,
  email,
  phone,
  company_name,
  cvr,
  city,
  area,
  profile_text,
  specialties,
  price_text,
  website,
  accepts_new_clients,
  public_profile,
  updated_at
)
on table public.representative_profiles
to authenticated;


-- ------------------------------------------------------------
-- Controlled representative onboarding
-- ------------------------------------------------------------

create or replace function public.complete_representative_onboarding(
  p_display_name text,
  p_phone text default null,
  p_company_name text default null,
  p_cvr text default null,
  p_city text default null,
  p_area text default null,
  p_profile_text text default null,
  p_specialties text[] default '{}'::text[],
  p_price_text text default null,
  p_website text default null,
  p_accepts_new_clients boolean default false,
  p_public_profile boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_email text;
  v_profile_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(email)
    into v_email
  from public.profiles
  where id = v_user_id;

  if v_email is null then
    raise exception 'Profile not found';
  end if;

  if not exists (
    select 1
    from public.representative_applications
    where lower(email) = v_email
      and status = 'approved'
      and onboarding_unlocked = true
  ) then
    raise exception 'Representative onboarding is not authorized';
  end if;

  if length(trim(coalesce(p_display_name, ''))) < 2
     or length(trim(p_display_name)) > 120 then
    raise exception 'Invalid display name';
  end if;

  if exists (
    select 1
    from public.representative_profiles
    where user_id = v_user_id
  ) then
    raise exception 'Representative profile already exists';
  end if;

  insert into public.representative_profiles (
    user_id,
    display_name,
    email,
    phone,
    company_name,
    cvr,
    city,
    area,
    profile_text,
    specialties,
    price_text,
    website,
    accepts_new_clients,
    public_profile,
    verified,
    approved_by_admin,
    suspended
  )
  values (
    v_user_id,
    trim(p_display_name),
    v_email,
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_company_name, '')), ''),
    nullif(trim(coalesce(p_cvr, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_area, '')), ''),
    nullif(trim(coalesce(p_profile_text, '')), ''),
    coalesce(p_specialties, '{}'::text[]),
    nullif(trim(coalesce(p_price_text, '')), ''),
    nullif(trim(coalesce(p_website, '')), ''),
    coalesce(p_accepts_new_clients, false),
    coalesce(p_public_profile, false),
    true,
    true,
    false
  )
  returning id into v_profile_id;

  update public.profiles
  set
    role = 'representative',
    updated_at = now()
  where id = v_user_id;

  return v_profile_id;
end;
$$;

revoke all on function public.complete_representative_onboarding(
  text, text, text, text, text, text, text, text[], text, text, boolean, boolean
) from public;

revoke all on function public.complete_representative_onboarding(
  text, text, text, text, text, text, text, text[], text, text, boolean, boolean
) from anon;

grant execute on function public.complete_representative_onboarding(
  text, text, text, text, text, text, text, text[], text, text, boolean, boolean
) to authenticated;

-- ------------------------------------------------------------
-- Controlled administrator management of representatives
-- ------------------------------------------------------------

create or replace function public.admin_set_representative_state(
  p_user_id uuid,
  p_approved boolean default null,
  p_verified boolean default null,
  p_suspended boolean default null,
  p_public_profile boolean default null,
  p_accepts_new_clients boolean default null,
  p_promote_to_representative boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_administrator() then
    raise exception 'Administrator access required';
  end if;

  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  update public.representative_profiles
  set
    approved_by_admin = coalesce(p_approved, approved_by_admin),
    verified = coalesce(p_verified, verified),
    suspended = coalesce(p_suspended, suspended),
    public_profile = coalesce(p_public_profile, public_profile),
    accepts_new_clients = coalesce(
      p_accepts_new_clients,
      accepts_new_clients
    ),
    updated_at = now()
  where user_id = p_user_id;

  if p_promote_to_representative then
    update public.profiles
    set
      role = 'representative',
      updated_at = now()
    where id = p_user_id;
  end if;
end;
$$;

revoke all on function public.admin_set_representative_state(
  uuid, boolean, boolean, boolean, boolean, boolean, boolean
) from public;

revoke all on function public.admin_set_representative_state(
  uuid, boolean, boolean, boolean, boolean, boolean, boolean
) from anon;

grant execute on function public.admin_set_representative_state(
  uuid, boolean, boolean, boolean, boolean, boolean, boolean
) to authenticated;


-- ============================================================
-- 5. Audit log hardening
-- ============================================================

-- Applications must write audit records through write_audit_log().
-- Direct INSERT would allow callers to fabricate audit metadata.

-- The RPC performs the privileged INSERT. The function itself derives
-- the actor from auth.uid() and rejects unauthenticated calls.

alter function public.write_audit_log(
  text,
  uuid,
  text,
  uuid,
  jsonb
)
security definer;

alter function public.write_audit_log(
  text,
  uuid,
  text,
  uuid,
  jsonb
)
set search_path = public;

drop policy if exists audit_logs_insert_authenticated
on public.audit_logs;

revoke insert, update, delete, truncate
on table public.audit_logs
from anon;

revoke insert, update, delete, truncate
on table public.audit_logs
from authenticated;

revoke all on function public.write_audit_log(
  text, uuid, text, uuid, jsonb
) from public;

revoke all on function public.write_audit_log(
  text, uuid, text, uuid, jsonb
) from anon;

grant execute on function public.write_audit_log(
  text, uuid, text, uuid, jsonb
) to authenticated;

-- ============================================================
-- 6. Document storage
-- ============================================================

-- Favn360 Core uses one private document bucket.
--
-- Object paths must follow:
--
--   <citizen_uuid>/<unique_file_name>
--
-- Authorization is enforced independently by Storage RLS. Application
-- checks are defense in depth and are not the security boundary.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'favn360-documents',
  'favn360-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- Remove any Favn360 Core policies with these names before recreating
-- them. Legacy funktion360-* policies are deliberately not modified by
-- this migration.

drop policy if exists favn360_documents_select
on storage.objects;

drop policy if exists favn360_documents_insert
on storage.objects;

drop policy if exists favn360_documents_update
on storage.objects;

drop policy if exists favn360_documents_delete
on storage.objects;

-- ============================================================
-- Safe Storage path parsing
-- ============================================================

create or replace function public.safe_uuid(p_value text)
returns uuid
language plpgsql
immutable
strict
set search_path = public
as $$
begin
  return p_value::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on function public.safe_uuid(text) from public;
revoke all on function public.safe_uuid(text) from anon;
grant execute on function public.safe_uuid(text) to authenticated;

-- ------------------------------------------------------------
-- READ
-- ------------------------------------------------------------

create policy favn360_documents_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'favn360-documents'
  and (storage.foldername(name))[1] is not null
  and (
    public.can_access_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
    or public.can_represent_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
  )
);


-- ------------------------------------------------------------
-- UPLOAD
-- ------------------------------------------------------------

create policy favn360_documents_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'favn360-documents'
  and (storage.foldername(name))[1] is not null
  and (
    public.can_access_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
    or public.can_represent_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
  )
);


-- ------------------------------------------------------------
-- UPDATE
-- ------------------------------------------------------------
-- Core currently uploads with upsert=false, but retaining a protected
-- UPDATE policy allows controlled future metadata/object operations.

create policy favn360_documents_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'favn360-documents'
  and (storage.foldername(name))[1] is not null
  and (
    public.can_access_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
    or public.can_represent_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
  )
)
with check (
  bucket_id = 'favn360-documents'
  and (storage.foldername(name))[1] is not null
  and (
    public.can_access_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
    or public.can_represent_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
  )
);


-- ------------------------------------------------------------
-- DELETE
-- ------------------------------------------------------------

create policy favn360_documents_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'favn360-documents'
  and (storage.foldername(name))[1] is not null
  and (
    public.can_access_citizen(
      public.safe_uuid((storage.foldername(name))[1])
    )
    or public.can_represent_citizen(
          public.safe_uuid((storage.foldername(name))[1])
    )
  )
);


-- ============================================================
-- 7. Remove superseded Core policies
-- ============================================================

-- profiles.role is authorization state and may only be changed through
-- controlled privileged functions.

drop policy if exists profiles_update_own
on public.profiles;


-- Representative profiles are created through controlled onboarding.
-- Ordinary profile editing is restricted by column privileges.

drop policy if exists "representative profiles own insert"
on public.representative_profiles;


-- Keep an UPDATE policy for representatives editing their own ordinary
-- profile fields. Column privileges prevent modification of trust fields.

drop policy if exists "representative profiles own update"
on public.representative_profiles;

create policy "representative profiles own update"
on public.representative_profiles
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);


-- Legacy Funktion360 Storage policies are not part of Favn360 Core.
-- Core uses the favn360-documents bucket exclusively.

drop policy if exists authenticated_can_delete_storage
on storage.objects;

drop policy if exists authenticated_can_read_own_storage
on storage.objects;

drop policy if exists authenticated_can_update_storage
on storage.objects;

drop policy if exists authenticated_can_upload_attachments
on storage.objects;


-- Legacy/demo helper with hard-coded schedule dates.
-- It is not used by Favn360 Core.

drop function if exists public.create_default_practice_schedule(uuid);



-- ============================================================
-- End Favn360 Core security hardening
-- ============================================================
