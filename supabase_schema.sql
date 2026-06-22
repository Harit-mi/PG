-- PG Owner App Database Schema

-- 1. Tenants Table
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  aadhaar_number TEXT,
  room_number TEXT,
  move_in_date DATE DEFAULT CURRENT_DATE,
  emergency_contact TEXT,
  status TEXT DEFAULT 'Active', -- Active, Notice Period, Past
  permanent_address TEXT,
  father_mother_name TEXT,
  parent_contact_number TEXT,
  blood_group TEXT,
  workplace_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Rooms Table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- Single, Double, Triple
  rent_per_bed INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'Vacant', -- Vacant, Occupied, Partially Occupied
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Finances (Transactions) Table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- Income, Expense
  category TEXT NOT NULL, -- Rent, Electricity, Maintenance, etc.
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'Completed',
  proof_url TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Complaints Table
CREATE TABLE complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id TEXT UNIQUE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium', -- High, Medium, Low
  status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS) but allow anonymous access for now (since we don't have full auth setup yet)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Create basic public policies for development
CREATE POLICY "Allow public read access" ON tenants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON tenants FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON transactions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON complaints FOR UPDATE USING (true);

-- 5. Food Menus Table
CREATE TABLE food_menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  week_start_date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  evening_snack TEXT,
  dinner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(property_id, week_start_date, day_of_week)
);

ALTER TABLE food_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON food_menus FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON food_menus FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON food_menus FOR UPDATE USING (true);
