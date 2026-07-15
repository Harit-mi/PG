const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['organizations', 'subscriptions', 'support_tickets', 'ticket_messages', 'admin_audit_logs'];
  
  for (const table of tables) {
    console.log(`Checking table public.${table}...`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error on public.${table}:`, error.message);
    } else {
      console.log(`Table public.${table} is successfully verified!`);
    }
  }

  // Also check column organization_id on properties
  console.log("Checking properties.organization_id column...");
  const { data: prop, error: propError } = await supabase
    .from('properties')
    .select('id, organization_id')
    .limit(1);

  if (propError) {
    console.error("Properties Column Error:", propError.message);
  } else {
    console.log("properties.organization_id is successfully verified!");
  }
}

check();
