-- SQL migration to add Rent Verification, Visitor Logs, and Room Assets table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)

-- 1. ALTER TRANSACTIONS TABLE
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;


-- 2. CREATE VISITORS TABLE
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    visit_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Requested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for visitors
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for visitors table
DROP POLICY IF EXISTS "Allow public read visitors" ON public.visitors;
CREATE POLICY "Allow public read visitors" ON public.visitors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert visitors" ON public.visitors;
CREATE POLICY "Allow public insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update visitors" ON public.visitors;
CREATE POLICY "Allow public update visitors" ON public.visitors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete visitors" ON public.visitors;
CREATE POLICY "Allow public delete visitors" ON public.visitors FOR DELETE USING (true);


-- 3. CREATE ROOM_ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.room_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Working',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for room_assets
ALTER TABLE public.room_assets ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for room_assets table
DROP POLICY IF EXISTS "Allow public read room_assets" ON public.room_assets;
CREATE POLICY "Allow public read room_assets" ON public.room_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert room_assets" ON public.room_assets;
CREATE POLICY "Allow public insert room_assets" ON public.room_assets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update room_assets" ON public.room_assets;
CREATE POLICY "Allow public update room_assets" ON public.room_assets FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete room_assets" ON public.room_assets;
CREATE POLICY "Allow public delete room_assets" ON public.room_assets FOR DELETE USING (true);
