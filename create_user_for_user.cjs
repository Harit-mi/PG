require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const newOrgId = crypto.randomUUID();
  const cleanEmail = "admin@stayos.in";
  
  // Create org
  await supabase.from("organizations").insert([{
    id: newOrgId,
    name: "Admin Org",
    status: "Active"
  }]);

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: cleanEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Admin',
      phone: '9999999999',
      organization_id: newOrgId,
      pg_name: 'StayOS Demo PG'
    }
  });

  if (error) {
    console.error("User Error:", error);
    return;
  }

  // Create subscription
  const expiryStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await supabase.from("subscriptions").insert([{
    organization_id: newOrgId,
    plan_name: "Pro Trial",
    status: "Active",
    expiry_date: expiryStr
  }]);

  // Create property
  const { data: prop } = await supabase.from("properties").insert([{
    name: "StayOS Demo PG",
    address: "Demo Address",
    organization_id: newOrgId,
    subscription_status: "Active",
    expiry_date: expiryStr
  }]).select().single();

  console.log("Created successfully! Email:", cleanEmail, "Password: password123");
}
run();
