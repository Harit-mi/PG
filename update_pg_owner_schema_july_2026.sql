BEGIN;

-- 1) Rooms table updates:
-- Add the rent_per_bed column if it does not exist
ALTER TABLE public.rooms 
  ADD COLUMN IF NOT EXISTS rent_per_bed numeric(12,2) NOT NULL DEFAULT 0;

-- Copy any existing data from rent_amount to rent_per_bed
UPDATE public.rooms 
  SET rent_per_bed = COALESCE(rent_amount, 0) 
  WHERE rent_per_bed = 0;

-- Create an index on rooms.rent_per_bed
CREATE INDEX IF NOT EXISTS idx_rooms_rent_per_bed
  ON public.rooms (rent_per_bed);


-- 2) Transactions table updates:
-- Add payment_method and proof_url columns
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Create index for transactions payment_method
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method
  ON public.transactions (payment_method);


-- 3) Room Types table creation:
CREATE TABLE IF NOT EXISTS public.room_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_capacity INTEGER NOT NULL,
  default_rent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for property scoping
CREATE INDEX IF NOT EXISTS idx_room_types_property_id ON public.room_types(property_id);

-- Uniqueness constraint on property_id and name
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_types_property_name
  ON public.room_types(property_id, lower(name));

-- Enable RLS for room_types
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- Enable public RLS policies matching the rest of the application
DROP POLICY IF EXISTS "Allow public read access" ON public.room_types;
CREATE POLICY "Allow public read access" ON public.room_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.room_types;
CREATE POLICY "Allow public insert access" ON public.room_types FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.room_types;
CREATE POLICY "Allow public update access" ON public.room_types FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.room_types;
CREATE POLICY "Allow public delete access" ON public.room_types FOR DELETE USING (true);


-- 4) Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;
