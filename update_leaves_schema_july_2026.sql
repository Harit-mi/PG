-- Create Leaves Table
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  breakfast BOOLEAN DEFAULT true,
  lunch BOOLEAN DEFAULT true,
  dinner BOOLEAN DEFAULT true,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for property-scoped queries
CREATE INDEX IF NOT EXISTS idx_leaves_property_id ON public.leaves(property_id);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant_id ON public.leaves(tenant_id);

-- Enable RLS for leaves
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Enable public RLS policies
DROP POLICY IF EXISTS "Allow public read access" ON public.leaves;
CREATE POLICY "Allow public read access" ON public.leaves FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.leaves;
CREATE POLICY "Allow public insert access" ON public.leaves FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.leaves;
CREATE POLICY "Allow public update access" ON public.leaves FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.leaves;
CREATE POLICY "Allow public delete access" ON public.leaves FOR DELETE USING (true);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
