-- ============================================================
-- Favn360 Core boundary
--
-- Remove database objects that belong to legacy beta/product
-- operations or managed commercial services rather than the
-- self-hostable Favn360 Core product.
--
-- This migration is intended for the public Core schema.
-- It must not be pushed to the existing Funktion360 production
-- project without a separate migration plan.
-- ============================================================

drop table if exists public.bugs;
drop table if exists public.beta_users;
drop table if exists public.feedback_items;
drop table if exists public.subscription_accounts;