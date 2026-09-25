-- ============================================================
-- Favn360 Core
-- Lock down representative request mutations
-- ============================================================

-- Request state transitions are handled exclusively through
-- controlled SECURITY DEFINER RPC functions.

revoke update
on public.representative_requests
from authenticated;

-- Remove the now-unused direct UPDATE policy.
drop policy if exists "representative requests update"
on public.representative_requests;
