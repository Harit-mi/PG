const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching properties...");
  const { data: properties, error: propError } = await supabase.from('properties').select('*');
  if (propError) console.error("propError:", propError);
  else console.log("Properties:", JSON.stringify(properties, null, 2));

  console.log("Fetching organizations...");
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
  if (orgError) console.error("orgError:", orgError);
  else console.log("Organizations:", JSON.stringify(orgs, null, 2));
}

main();
