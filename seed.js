const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Rooms...");
  const { data: rooms, error: roomError } = await supabase.from('rooms').insert([
    { room_number: "101", type: "Single", rent_per_bed: 8000, capacity: 1, status: "Occupied", amenities: ["AC", "Attached Bath"] },
    { room_number: "102", type: "Double", rent_per_bed: 6000, capacity: 2, status: "Partially Occupied", amenities: ["AC", "Balcony"] },
    { room_number: "103", type: "Triple", rent_per_bed: 5000, capacity: 3, status: "Vacant", amenities: ["Non-AC"] },
    { room_number: "104", type: "Double", rent_per_bed: 6000, capacity: 2, status: "Occupied", amenities: ["AC", "Attached Bath"] }
  ]).select();

  if (roomError) {
    console.error("Error seeding rooms:", roomError);
  } else {
    console.log("Rooms seeded successfully.");
  }

  console.log("Seeding Tenants...");
  const { data: tenants, error: tenantError } = await supabase.from('tenants').insert([
    { name: "Rahul Sharma", phone: "+91 98765 43210", room_number: "101", status: "Active", move_in_date: "2026-01-01" },
    { name: "Aman Gupta", phone: "+91 87654 32109", room_number: "102", status: "Active", move_in_date: "2026-02-15" },
    { name: "Vikram Singh", phone: "+91 76543 21098", room_number: "104", status: "Active", move_in_date: "2026-03-10" },
    { name: "Sneha Desai", phone: "+91 65432 10987", room_number: "104", status: "Notice Period", move_in_date: "2026-04-05" }
  ]).select();

  if (tenantError) {
    console.error("Error seeding tenants:", tenantError);
  } else {
    console.log("Tenants seeded successfully.");
  }
}

seed();
