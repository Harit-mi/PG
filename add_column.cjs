require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addCol() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE employees ADD COLUMN aadhar_url TEXT;' });
  console.log(error || "Column added (or function missing)");
}
addCol();
