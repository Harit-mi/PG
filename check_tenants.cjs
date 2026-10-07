const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'test1@gmail.com',
    password: '1234567890'
  });
  
  const orgId = authData.user?.user_metadata?.organization_id;
  const { data: properties } = await supabase.from('properties').select('id, name').eq('organization_id', orgId);
  const propertyIds = properties.map(p => p.id);
  
  const { data: tenants } = await supabase.from('tenants').select('*').in('property_id', propertyIds);
  console.log("Tenants:", tenants);
}
checkData();
