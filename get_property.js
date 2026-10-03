const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data } = await supabase.from('properties').select('id').limit(1);
  if (data && data.length > 0) {
    console.log(data[0].id);
  } else {
    console.log("No properties found");
  }
}
run();
