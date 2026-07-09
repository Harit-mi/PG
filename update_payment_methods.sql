-- Run this script in your Supabase SQL Editor to update the schema for Payment Methods
-- This table supports payment methods per PG property with RLS and proper indexing.

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_date DATE;

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT payment_methods_type_check
    CHECK (type IN ('UPI', 'Bank Account', 'Cash', 'Razorpay Link', 'Card', 'Other'))
);

-- Index for scoping to a property
CREATE INDEX IF NOT EXISTS idx_payment_methods_property_id
  ON public.payment_methods(property_id);

-- Index on active payment methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active
  ON public.payment_methods(is_active);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Enable public RLS policies matching the rest of the application
CREATE POLICY "Allow public read access" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.payment_methods FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.payment_methods FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.payment_methods FOR DELETE USING (true);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
