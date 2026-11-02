-- These public tables were created without RLS, so the anon and authenticated
-- roles could read and write them through PostgREST. No client reads them yet;
-- the service role bypasses RLS, so backend access is unchanged.
BEGIN;

ALTER TABLE public.venue_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_category_map ENABLE ROW LEVEL SECURITY;

COMMIT;
