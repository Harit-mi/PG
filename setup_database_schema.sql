-- Supabase Schema Setup Script for PG Leave & Kitchen Tracker
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)

-- 1. CREATE LEAVES TABLE
CREATE TABLE IF NOT EXISTS public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    breakfast BOOLEAN DEFAULT TRUE,
    lunch BOOLEAN DEFAULT TRUE,
    dinner BOOLEAN DEFAULT TRUE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on leaves
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies matching your existing tables
DROP POLICY IF EXISTS "Allow public read leaves" ON public.leaves;
CREATE POLICY "Allow public read leaves" ON public.leaves FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert leaves" ON public.leaves;
CREATE POLICY "Allow public insert leaves" ON public.leaves FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update leaves" ON public.leaves;
CREATE POLICY "Allow public update leaves" ON public.leaves FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete leaves" ON public.leaves;
CREATE POLICY "Allow public delete leaves" ON public.leaves FOR DELETE USING (true);


-- 2. ADD MISSING TICKET_ID COLUMN TO COMPLAINTS TABLE
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(50);
