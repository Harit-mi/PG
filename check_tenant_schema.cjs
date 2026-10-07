require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('tenants').select('*').limit(1);
  console.log("schema:", data ? (data.length > 0 ? Object.keys(data[0]) : "Empty but exists") : error);
}
run();
