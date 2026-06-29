-- Room Types Table
CREATE TABLE IF NOT EXISTS room_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_capacity INTEGER NOT NULL,
  default_rent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON room_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON room_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON room_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON room_types FOR DELETE USING (true);
