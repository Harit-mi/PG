require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(data.length > 0 ? Object.keys(data[0]) : "No data, but table exists. Columns unknown unless we query information_schema");
  }
}
check();
