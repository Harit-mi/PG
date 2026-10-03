require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data } = await supabase.from('properties').select('id').limit(1);
  if (data && data.length > 0) {
    console.log("PROPERTY_ID=" + data[0].id);
  } else {
    console.log("NO_PROPERTIES_FOUND");
  }
}
run();
