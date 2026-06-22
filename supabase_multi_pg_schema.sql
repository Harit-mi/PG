-- Supabase SQL Migration: Multi-PG Support

-- 1. Create the Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  subscription_status TEXT DEFAULT 'active', -- active, expired, trial
  expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert a default "Main PG" property to hold all existing data
INSERT INTO properties (name, address) 
VALUES ('Main PG', 'Primary Location');

-- 3. Add property_id column to all relevant tables and link it to the properties table
ALTER TABLE rooms ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE tenants ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE transactions ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE complaints ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE notices ADD COLUMN property_id UUID REFERENCES properties(id);

-- 4. Set the property_id of all existing data to the "Main PG" we just created
-- We find the ID of the 'Main PG' and update all rows so nothing breaks.
DO $$
DECLARE
  main_pg_id UUID;
BEGIN
  SELECT id INTO main_pg_id FROM properties WHERE name = 'Main PG' LIMIT 1;
  
  UPDATE rooms SET property_id = main_pg_id WHERE property_id IS NULL;
  UPDATE tenants SET property_id = main_pg_id WHERE property_id IS NULL;
  UPDATE transactions SET property_id = main_pg_id WHERE property_id IS NULL;
  UPDATE complaints SET property_id = main_pg_id WHERE property_id IS NULL;
  UPDATE notices SET property_id = main_pg_id WHERE property_id IS NULL;
END $$;
