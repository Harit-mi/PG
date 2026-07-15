-- SQL Migration to support Prepaid Outlet Slots and Subscription Renewals
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)

-- 1. ENSURE COLUMNS EXIST ON PROPERTIES TABLE FIRST
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS expiry_date DATE DEFAULT '2030-12-31',
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) DEFAULT 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

-- 2. CREATE OUTLET SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.outlet_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0',
    plan_name VARCHAR(50) NOT NULL DEFAULT 'Professional', -- Starter, Pro, Enterprise
    status VARCHAR(50) DEFAULT 'Unassigned', -- Unassigned, Assigned, Expired, Refunded
    assigned_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    expiry_date DATE NOT NULL DEFAULT '2030-12-31',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for outlet_slots
ALTER TABLE public.outlet_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read outlet_slots" ON public.outlet_slots;
CREATE POLICY "Allow public read outlet_slots" ON public.outlet_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert outlet_slots" ON public.outlet_slots;
CREATE POLICY "Allow public insert outlet_slots" ON public.outlet_slots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update outlet_slots" ON public.outlet_slots;
CREATE POLICY "Allow public update outlet_slots" ON public.outlet_slots FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete outlet_slots" ON public.outlet_slots;
CREATE POLICY "Allow public delete outlet_slots" ON public.outlet_slots FOR DELETE USING (true);


-- 3. BACKFILL: MIGRATE EXISTING PROPERTIES INTO ASSIGNED SLOTS
-- Ensure we create a slot for every existing property so they keep operational access.
DO $$
DECLARE
    prop_rec RECORD;
    existing_slot_count INTEGER;
BEGIN
    FOR prop_rec IN SELECT id, organization_id, subscription_status, expiry_date FROM public.properties LOOP
        -- Check if a slot is already assigned to this property
        SELECT COUNT(*) INTO existing_slot_count FROM public.outlet_slots WHERE assigned_property_id = prop_rec.id;
        
        IF existing_slot_count = 0 THEN
            INSERT INTO public.outlet_slots (organization_id, plan_name, status, assigned_property_id, expiry_date)
            VALUES (
                COALESCE(prop_rec.organization_id, 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0'),
                'Professional',
                'Assigned',
                prop_rec.id,
                COALESCE(prop_rec.expiry_date, '2030-12-31')
            );
        END IF;
    END LOOP;
END $$;
