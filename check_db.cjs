const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test1@gmail.com',
    password: '1234567890'
  });
  
  if (authError) {
    console.log("Auth Error:", authError.message);
    return;
  }
  
  const orgId = authData.user?.user_metadata?.organization_id;
  console.log("Logged in. Org ID:", orgId);
  
  if (orgId) {
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', orgId);
      
    if (propError) console.log("Prop Error:", propError);
    console.log("Properties found:", properties?.length);
    if (properties?.length > 0) {
       console.log("First property:", properties[0].name, properties[0].id);
    }
  } else {
    console.log("No org_id in user_metadata!");
  }
}
checkData();
