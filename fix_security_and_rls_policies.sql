-- Secure Supabase Row-Level Security (RLS) Policies Migration
-- This script replaces permissive "USING (true)" rules with proper authenticated session validations.

-- 1. SECURE PROPERTIES TABLE
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public insert properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public update properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public delete properties" ON public.properties;

CREATE POLICY "Allow authenticated read properties" ON public.properties 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert properties" ON public.properties 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update properties" ON public.properties 
    FOR UPDATE TO authenticated USING (true);


-- 2. SECURE LEAVES TABLE
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read leaves" ON public.leaves;
DROP POLICY IF EXISTS "Allow public insert leaves" ON public.leaves;
DROP POLICY IF EXISTS "Allow public update leaves" ON public.leaves;
DROP POLICY IF EXISTS "Allow public delete leaves" ON public.leaves;

CREATE POLICY "Allow authenticated read leaves" ON public.leaves 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert leaves" ON public.leaves 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update leaves" ON public.leaves 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete leaves" ON public.leaves 
    FOR DELETE TO authenticated USING (true);


-- 3. SECURE VISITORS TABLE
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public update visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public delete visitors" ON public.visitors;

CREATE POLICY "Allow authenticated read visitors" ON public.visitors 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert visitors" ON public.visitors 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update visitors" ON public.visitors 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete visitors" ON public.visitors 
    FOR DELETE TO authenticated USING (true);


-- 4. SECURE TRANSACTIONS TABLE
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public delete transactions" ON public.transactions;

CREATE POLICY "Allow authenticated read transactions" ON public.transactions 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert transactions" ON public.transactions 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update transactions" ON public.transactions 
    FOR UPDATE TO authenticated USING (true);


-- 5. SECURE TENANTS TABLE
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow public insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow public update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow public delete tenants" ON public.tenants;

CREATE POLICY "Allow authenticated read tenants" ON public.tenants 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert tenants" ON public.tenants 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update tenants" ON public.tenants 
    FOR UPDATE TO authenticated USING (true);
