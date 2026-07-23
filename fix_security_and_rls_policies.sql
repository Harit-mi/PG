-- Comprehensive Supabase Row-Level Security (RLS) Isolation Migration
-- Run this in your Supabase Project SQL Editor:
-- https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor

-- 1. Helper function for fast, secure organization lookup from JWT claims
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', ''))::uuid,
    'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0'::uuid
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 2. ORGANIZATIONS TABLE POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org read own" ON public.organizations;
DROP POLICY IF EXISTS "Org update own" ON public.organizations;

CREATE POLICY "Org read own" ON public.organizations
    FOR SELECT TO authenticated USING (id = public.get_auth_org_id());

CREATE POLICY "Org update own" ON public.organizations
    FOR UPDATE TO authenticated USING (id = public.get_auth_org_id());


-- 3. PROPERTIES TABLE POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated insert properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated update properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated delete properties" ON public.properties;
DROP POLICY IF EXISTS "Properties select org" ON public.properties;
DROP POLICY IF EXISTS "Properties insert org" ON public.properties;
DROP POLICY IF EXISTS "Properties update org" ON public.properties;
DROP POLICY IF EXISTS "Properties delete org" ON public.properties;

CREATE POLICY "Properties select org" ON public.properties
    FOR SELECT TO authenticated USING (organization_id = public.get_auth_org_id());

CREATE POLICY "Properties insert org" ON public.properties
    FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_auth_org_id());

CREATE POLICY "Properties update org" ON public.properties
    FOR UPDATE TO authenticated USING (organization_id = public.get_auth_org_id());

CREATE POLICY "Properties delete org" ON public.properties
    FOR DELETE TO authenticated USING (organization_id = public.get_auth_org_id());


-- 4. ROOMS TABLE POLICIES
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow authenticated insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Rooms select org" ON public.rooms;
DROP POLICY IF EXISTS "Rooms insert org" ON public.rooms;
DROP POLICY IF EXISTS "Rooms update org" ON public.rooms;
DROP POLICY IF EXISTS "Rooms delete org" ON public.rooms;

CREATE POLICY "Rooms select org" ON public.rooms
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Rooms insert org" ON public.rooms
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Rooms update org" ON public.rooms
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Rooms delete org" ON public.rooms
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 5. TENANTS TABLE POLICIES
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenants select org" ON public.tenants;
DROP POLICY IF EXISTS "Tenants insert org" ON public.tenants;
DROP POLICY IF EXISTS "Tenants update org" ON public.tenants;
DROP POLICY IF EXISTS "Tenants delete org" ON public.tenants;

CREATE POLICY "Tenants select org" ON public.tenants
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Tenants insert org" ON public.tenants
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Tenants update org" ON public.tenants
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Tenants delete org" ON public.tenants
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 6. TRANSACTIONS TABLE POLICIES
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions select org" ON public.transactions;
DROP POLICY IF EXISTS "Transactions insert org" ON public.transactions;
DROP POLICY IF EXISTS "Transactions update org" ON public.transactions;
DROP POLICY IF EXISTS "Transactions delete org" ON public.transactions;

CREATE POLICY "Transactions select org" ON public.transactions
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Transactions insert org" ON public.transactions
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Transactions update org" ON public.transactions
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Transactions delete org" ON public.transactions
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 7. LEAVES TABLE POLICIES
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read leaves" ON public.leaves;
DROP POLICY IF EXISTS "Leaves select org" ON public.leaves;
DROP POLICY IF EXISTS "Leaves insert org" ON public.leaves;
DROP POLICY IF EXISTS "Leaves update org" ON public.leaves;
DROP POLICY IF EXISTS "Leaves delete org" ON public.leaves;

CREATE POLICY "Leaves select org" ON public.leaves
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Leaves insert org" ON public.leaves
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Leaves update org" ON public.leaves
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Leaves delete org" ON public.leaves
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 8. VISITORS TABLE POLICIES
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visitors select org" ON public.visitors;
DROP POLICY IF EXISTS "Visitors insert org" ON public.visitors;
DROP POLICY IF EXISTS "Visitors update org" ON public.visitors;
DROP POLICY IF EXISTS "Visitors delete org" ON public.visitors;

CREATE POLICY "Visitors select org" ON public.visitors
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Visitors insert org" ON public.visitors
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Visitors update org" ON public.visitors
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Visitors delete org" ON public.visitors
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 9. ROOM ASSETS TABLE POLICIES
ALTER TABLE public.room_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Assets select org" ON public.room_assets;
DROP POLICY IF EXISTS "Assets insert org" ON public.room_assets;
DROP POLICY IF EXISTS "Assets update org" ON public.room_assets;
DROP POLICY IF EXISTS "Assets delete org" ON public.room_assets;

CREATE POLICY "Assets select org" ON public.room_assets
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Assets insert org" ON public.room_assets
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Assets update org" ON public.room_assets
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );

CREATE POLICY "Assets delete org" ON public.room_assets
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
    );


-- 10. OUTLET SLOTS & SUBSCRIPTIONS POLICIES
ALTER TABLE public.outlet_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Slots select org" ON public.outlet_slots;
DROP POLICY IF EXISTS "Slots update org" ON public.outlet_slots;

CREATE POLICY "Slots select org" ON public.outlet_slots
    FOR SELECT TO authenticated USING (organization_id = public.get_auth_org_id());

CREATE POLICY "Slots update org" ON public.outlet_slots
    FOR UPDATE TO authenticated USING (organization_id = public.get_auth_org_id());

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subscriptions select org" ON public.subscriptions;

CREATE POLICY "Subscriptions select org" ON public.subscriptions
    FOR SELECT TO authenticated USING (organization_id = public.get_auth_org_id());
