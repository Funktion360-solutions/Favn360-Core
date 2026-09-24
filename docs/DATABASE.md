# Database boundary

Favn360 currently uses hosted Supabase services for authentication, Postgres, Storage and the Data API. The public repository intentionally has no `supabase/` directory.

The removed SQL files were not a reliable migration history: application code referenced tables and columns that were absent from the files, several auxiliary tables lacked documented RLS, and the role model differed from the generated database types. Publishing them as an installable schema would create a false security guarantee.

## Private infrastructure repository requirements

The private migration repository must be the source of truth and must contain:

- immutable, ordered migrations;
- explicit grants and RLS for every table/view in an exposed schema;
- Storage policies and proof that document buckets are private;
- `SECURITY DEFINER` review, fixed `search_path` and explicit `REVOKE EXECUTE FROM PUBLIC` where applicable;
- allow/deny tests for `anon`, citizen, representative, administrator and service roles;
- retention and deletion jobs;
- backup, restore and point-in-time recovery runbooks;
- generated TypeScript types updated after every schema release.

Run Supabase Security Advisor and database tests before every production change. Removing the public folder does not remove the operational obligation to maintain migrations.

The legacy `citizen_consents.data_processing` field is used by this public code as a privacy-notice acknowledgement, not as a blanket legal basis for all processing. Rename and migrate that field in the private schema so its meaning cannot be misunderstood, and retain notice version and timestamp evidence.
