require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const propId = '8adc39d4-e05f-4382-a7c2-77e7092e4a87';
  
  // Create room
  const { data: room, error: roomErr } = await supabase.from('rooms').insert([{
    property_id: propId,
    room_number: '101',
    type: '2',
    capacity: 2,
    rent_per_bed: 8000
  }]).select().single();
  
  const roomId = room ? room.id : (await supabase.from('rooms').select('id').eq('property_id', propId).limit(1)).data?.[0]?.id;

  if (!roomId) {
     console.log("Failed to create or find room", roomErr);
     return;
  }

  // Create tenant
  const { data: tenant, error: tErr } = await supabase.from('tenants').insert([{
    property_id: propId,
    room_id: roomId,
    name: 'Rahul Sharma (Dummy)',
    phone: '9876543210',
    rent_amount: 8000,
    status: 'Active'
  }]).select().single();
  
  const tenantId = tenant ? tenant.id : (await supabase.from('tenants').select('id').eq('property_id', propId).limit(1)).data?.[0]?.id;

  if (!tenantId) {
     console.log("Failed to create or find tenant", tErr);
     return;
  }

  // Create due transaction
  const { data: txn, error: txnErr } = await supabase.from('transactions').insert([{
    property_id: propId,
    tenant_id: tenantId,
    type: 'Charge',
    category: 'Rent',
    amount: 8000,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    description: 'October 2026 Rent'
  }]).select().single();

  if (txnErr) console.error("Txn Error:", txnErr);
  else console.log("Created dummy due for tenant:", tenantId);
}
run();
