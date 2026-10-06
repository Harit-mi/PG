require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  // Get property
  const { data: props } = await supabase.from('properties').select('id').eq('name', 'StayOS Demo PG').limit(1);
  if (!props || props.length === 0) {
    console.log("No demo property found.");
    return;
  }
  const propId = props[0].id;

  // Create room
  const { data: room, error: roomErr } = await supabase.from('rooms').insert([{
    property_id: propId,
    room_number: '101',
    type: '2',
    capacity: 2,
    rent_per_bed: 8000
  }]).select().single();
  
  const roomId = room ? room.id : (await supabase.from('rooms').select('id').eq('property_id', propId).limit(1)).data[0].id;

  // Create tenant
  const { data: tenant, error: tErr } = await supabase.from('tenants').insert([{
    property_id: propId,
    room_id: roomId,
    name: 'Rahul Sharma (Dummy)',
    phone: '9876543210',
    rent_amount: 8000,
    status: 'Active'
  }]).select().single();
  
  if (tErr) console.error("Tenant Error:", tErr);
  const tenantId = tenant ? tenant.id : (await supabase.from('tenants').select('id').eq('property_id', propId).limit(1)).data[0].id;

  // Create due transaction
  const { data: txn, error: txnErr } = await supabase.from('transactions').insert([{
    property_id: propId,
    tenant_id: tenantId,
    type: 'Income',
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
