require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const propId = '8adc39d4-e05f-4382-a7c2-77e7092e4a87'; // The "sgg" active property used previously
  
  // 1. Ensure we have a room
  let roomId;
  const { data: existingRooms } = await supabase.from('rooms').select('id').eq('property_id', propId).limit(1);
  
  if (existingRooms && existingRooms.length > 0) {
    roomId = existingRooms[0].id;
  } else {
    const { data: newRoom } = await supabase.from('rooms').insert([{
      property_id: propId,
      room_number: '202',
      type: '2',
      capacity: 2,
      rent_per_bed: 8000
    }]).select().single();
    roomId = newRoom.id;
  }

  // 2. Create the tenant with the specific phone number
  const { data: tenant, error: tErr } = await supabase.from('tenants').insert([{
    property_id: propId,
    room_id: roomId,
    name: 'Harit (Reminder Test)',
    phone: '8320721616',
    rent_amount: 9500,
    status: 'Active'
  }]).select().single();
  
  if (tErr) {
    console.error("Failed to create tenant:", tErr);
    return;
  }

  // 3. Create a pending due for rent
  const { data: txn, error: txnErr } = await supabase.from('transactions').insert([{
    property_id: propId,
    tenant_id: tenant.id,
    type: 'Income',
    category: 'Rent',
    amount: 9500,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    description: 'November 2026 Rent'
  }]).select().single();

  if (txnErr) {
    console.error("Failed to create transaction:", txnErr);
  } else {
    console.log("Successfully created tenant and pending rent for reminder testing!");
  }
}
run();
