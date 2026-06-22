-- Supabase SQL Update v1.0
-- 1. Reload schema to fix previous cache errors
NOTIFY pgrst, 'reload schema';

-- 2. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  role TEXT NOT NULL,
  salary INTEGER NOT NULL,
  joining_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active', -- Active, Inactive
  photo_url TEXT,
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Add employee_id to transactions for Salary linking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- 4. Enable RLS and add public policies for Employees (Development)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access" ON employees FOR ALL USING (true) WITH CHECK (true);

-- 5. Reload Schema again just in case
NOTIFY pgrst, 'reload schema';
