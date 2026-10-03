const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log(`Pinging Supabase Project: ${supabaseUrl}...`);
  const startTime = Date.now();
  
  try {
    // Attempt to fetch from a public/anon readable table, or just limit to 1
    const { data, error } = await supabase.from('rooms').select('*').limit(1);
    
    if (error) {
      console.error("❌ Database responded, but threw an error:");
      console.error(error.message);
    } else {
      console.log(`✅ Success! Database is ONLINE and responding (took ${Date.now() - startTime}ms)`);
      console.log(`Returned data:`, data);
    }
  } catch (err) {
    console.error("❌ Fatal Error: Could not connect to Supabase.");
    console.error(err.message);
  }
}

testConnection();
