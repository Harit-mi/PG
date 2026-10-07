require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const propId = '8adc39d4-e05f-4382-a7c2-77e7092e4a87'; // The "sgg" active property used previously
  
  // 1. Create the tenant with the specific phone number
  const { data: tenant, error: tErr } = await supabase.from('tenants').insert([{
    property_id: propId,
    name: 'Harit (Reminder Test)',
    phone: '8320721616',
    room_number: '202',
    status: 'Active',
    move_in_date: new Date().toISOString().split('T')[0]
  }]).select().single();
  
  if (tErr) {
    console.error("Failed to create tenant:", tErr);
    return;
  }

  // 2. Create a pending due for rent
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
