-- Run this script in your Supabase SQL Editor to update the schema for Payment Methods

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_date DATE;

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON payment_methods FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON payment_methods FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON payment_methods FOR DELETE USING (true);
