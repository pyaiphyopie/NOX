-- NOX Platform — Schema Gap Fill (Additive)
-- Date: 2026-08-14
-- Purpose: Close gaps between current initial schema and Master Engineering Prompt data model.
-- Strategy: Additive only. No destructive changes. Backward compatible with existing data.
-- Apply after: 20260802000000_initial_schema.sql

BEGIN;

-- ============================================================
-- 1. ENUM EXTENSIONS (safe additive values)
-- ============================================================

-- event_status: add pending_review + unpublished
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'unpublished';

-- ============================================================
-- 2. PROFILES (1:1 extension of users)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  date_of_birth DATE,
  gender TEXT,
  preferred_genres TEXT[] DEFAULT '{}',
  city TEXT DEFAULT 'Yangon',
  country TEXT DEFAULT 'MM',
  language TEXT DEFAULT 'en',
  notification_prefs JSONB DEFAULT '{"push": true, "email": false, "sms": false}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city) WHERE deleted_at IS NULL;

-- ============================================================
-- 3. ROLES & CAPABILITIES (capability-based RBAC foundation)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  tenant_type TEXT,
  tenant_id UUID,
  granted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, role_id, tenant_type, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON public.user_roles(tenant_type, tenant_id) WHERE deleted_at IS NULL;

INSERT INTO public.roles (name, description) VALUES
  ('consumer', 'Default end-user'),
  ('organizer', 'Event organizer / promoter'),
  ('venue', 'Venue owner / manager'),
  ('scanner', 'Check-in device / staff'),
  ('admin', 'Platform administrator'),
  ('super_admin', 'Full platform control')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (code, description) VALUES
  ('events:create', 'Create events'),
  ('events:update', 'Update own/tenant events'),
  ('events:publish', 'Publish events'),
  ('events:moderate', 'Moderate any event'),
  ('tickets:view', 'View tickets'),
  ('tickets:validate', 'Validate / check-in tickets'),
  ('tickets:refund', 'Issue refunds'),
  ('analytics:view', 'View analytics'),
  ('venue:update', 'Update venue profile'),
  ('team:manage', 'Manage staff'),
  ('users:moderate', 'Moderate users'),
  ('venues:verify', 'Verify venues'),
  ('organizers:verify', 'Verify organizers'),
  ('audit:view', 'View audit logs')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 4. VERIFICATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.venue_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_verifications_venue ON public.venue_verifications(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_verifications_status ON public.venue_verifications(status);

CREATE TABLE IF NOT EXISTS public.organizer_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizer_verifications_org ON public.organizer_verifications(organizer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_verifications_status ON public.organizer_verifications(status);

-- ============================================================
-- 5. ORGANIZER STAFF
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organizer_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organizer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organizer_staff_org ON public.organizer_staff(organizer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizer_staff_user ON public.organizer_staff(user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- 6. EVENT CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_category_map (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.event_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);

INSERT INTO public.event_categories (name, slug, sort_order) VALUES
  ('EDM', 'edm', 10),
  ('Hip-Hop', 'hip-hop', 20),
  ('Rock', 'rock', 30),
  ('Techno', 'techno', 40),
  ('Live Band', 'live-band', 50),
  ('Underground', 'underground', 60),
  ('Campus', 'campus', 70),
  ('Festivals', 'festivals', 80),
  ('Afterparty', 'afterparty', 90)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  currency TEXT NOT NULL DEFAULT 'MMK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_type ON public.order_items(ticket_type_id);

-- ============================================================
-- 8. TICKET TRANSFERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  from_user_id UUID NOT NULL REFERENCES public.users(id),
  to_user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
  transfer_code TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON public.ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to_user ON public.ticket_transfers(to_user_id);

-- ============================================================
-- 9. PAYMENT WEBHOOKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider payment_provider NOT NULL,
  provider_event_id TEXT,
  idempotency_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB,
  signature TEXT,
  signature_valid BOOLEAN,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  payment_id UUID REFERENCES public.payments(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON public.payment_webhooks(processing_status);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider_event ON public.payment_webhooks(provider, provider_event_id);

-- ============================================================
-- 10. SCANNER DEVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scanner_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_uid TEXT NOT NULL UNIQUE,
  name TEXT,
  event_id UUID REFERENCES public.events(id),
  venue_id UUID REFERENCES public.venues(id),
  registered_by UUID REFERENCES public.users(id),
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  offline_capable BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scanner_devices_event ON public.scanner_devices(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scanner_devices_active ON public.scanner_devices(is_active) WHERE deleted_at IS NULL;

-- ============================================================
-- 11. FOLLOWED ORGANIZERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.followed_organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, organizer_id)
);

CREATE INDEX IF NOT EXISTS idx_followed_organizers_user ON public.followed_organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_followed_organizers_org ON public.followed_organizers(organizer_id);

-- ============================================================
-- 12. REPORTS & MODERATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.users(id),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES public.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_resource ON public.reports(resource_type, resource_id);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_actor ON public.moderation_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_resource ON public.moderation_actions(resource_type, resource_id);

-- ============================================================
-- 13. UPDATED_AT TRIGGERS
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'roles', 'venue_verifications', 'organizer_verifications',
    'organizer_staff', 'event_categories', 'order_items', 'ticket_transfers',
    'payment_webhooks', 'scanner_devices'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ============================================================
-- 14. RLS ENABLE + BASIC POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own follows"
  ON public.followed_organizers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
        AND o.deleted_at IS NULL
    )
  );

CREATE POLICY "Transfer participants can view"
  ON public.ticket_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

COMMIT;
