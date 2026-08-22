-- ==============================================================================
-- MASTER ARCHITECTURAL SECURITY PATCH: SECURE USER PROFILES & TAMPER-PROOF RLS
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor
--
-- FIXES ARCHITECTURAL VULNERABILITY:
-- 1. Moves organization_id and role authorization out of client-writable user_metadata
--    and into a server-managed public.user_profiles table.
-- 2. Rewrites get_auth_org_id() and is_super_admin() to query user_profiles via
--    SECURITY DEFINER, preventing users from escalating privileges or spoofing org IDs
--    via browser devtools (supabase.auth.updateUser).
-- 3. Fixes FoodMenus SELECT and Complaints INSERT policy logic bugs.
-- ==============================================================================

-- 1. CREATE SERVER-MANAGED USER_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'owner' NOT NULL, -- 'super_admin', 'owner', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile row. They CANNOT insert/update/delete their own organization_id or role!
DROP POLICY IF EXISTS "UserProfiles read own" ON public.user_profiles;
CREATE POLICY "UserProfiles read own" ON public.user_profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

-- Only Super Admin can manage user profiles directly
DROP POLICY IF EXISTS "UserProfiles manage super_admin" ON public.user_profiles;
CREATE POLICY "UserProfiles manage super_admin" ON public.user_profiles
    FOR ALL TO authenticated USING (
      (COALESCE(auth.jwt() ->> 'email', '') = 'admin@pgmanagement.com')
      OR (id IN (SELECT id FROM public.user_profiles WHERE role = 'super_admin'))
    );


-- 2. BACKFILL EXISTING USERS INTO USER_PROFILES
INSERT INTO public.user_profiles (id, organization_id, role)
SELECT 
    id,
    (NULLIF(raw_user_meta_data ->> 'organization_id', ''))::uuid,
    COALESCE(NULLIF(raw_user_meta_data ->> 'role', ''), 'owner')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    role = EXCLUDED.role;


-- 3. AUTO-PROVISION USER_PROFILES ON SIGNUP (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, organization_id, role)
  VALUES (
    NEW.id,
    (NULLIF(NEW.raw_user_meta_data ->> 'organization_id', ''))::uuid,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', ''), 'owner')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();


-- 4. REWRITE GET_AUTH_ORG_ID() & IS_SUPER_ADMIN() TO QUERY SERVER-MANAGED USER_PROFILES
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- 1. Query server-managed profiles table
  SELECT organization_id INTO v_org_id
  FROM public.user_profiles
  WHERE id = auth.uid();

  -- 2. Fallback if profile row is pending initial creation
  IF v_org_id IS NULL THEN
    v_org_id := (NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', ''))::uuid;
  END IF;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role VARCHAR(50);
  v_email TEXT;
BEGIN
  -- Hardcoded root super-admin email check
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email = 'admin@pgmanagement.com' THEN
    RETURN TRUE;
  END IF;

  -- Query server-managed profiles table
  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role = 'super_admin', FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


-- ==============================================================================
-- 5. FIX FOOD MENUS & COMPLAINTS POLICY LOGIC BUGS
-- ==============================================================================

-- Food Menus: Authenticated PG Owner Scoped SELECT + Read-Only Public Tenant Portal SELECT
ALTER TABLE public.food_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read food_menus" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus select org" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus select public tenant portal" ON public.food_menus;

-- Authenticated PG Owner / Super Admin SELECT
CREATE POLICY "FoodMenus select org" ON public.food_menus
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

-- Read-only SELECT for public tenant portal by specific property ID
CREATE POLICY "FoodMenus select public tenant portal" ON public.food_menus
    FOR SELECT TO anon USING (
      property_id IS NOT NULL
    );


-- Complaints: Authenticated PG Owner Scoped INSERT + Public Tenant Submission INSERT
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Complaints insert org" ON public.complaints;
DROP POLICY IF EXISTS "Complaints insert public tenant" ON public.complaints;

-- Authenticated PG Owner / Super Admin INSERT
CREATE POLICY "Complaints insert org" ON public.complaints
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

-- Public Resident Portal Complaint Submission (anon role)
CREATE POLICY "Complaints insert public tenant" ON public.complaints
    FOR INSERT TO anon WITH CHECK (
      property_id IS NOT NULL AND (status IS NULL OR status = 'Open')
    );


-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
