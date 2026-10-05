require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const newOrgId = crypto.randomUUID();
  const { data, error } = await supabase.from("organizations").insert([{
    id: newOrgId,
    owner_name: "Admin",
    owner_email: "test@stayos.in",
    status: "Active"
  }]).select();
  console.log("Org creation:", error || data);
}
run();
