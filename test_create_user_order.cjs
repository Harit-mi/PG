require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const newOrgId = crypto.randomUUID();
  const cleanPgName = "Test PG";
  
  // 1. CREATE ORGANIZATION FIRST
  const { error: orgErr } = await supabase.from("organizations").insert([{
    id: newOrgId,
    name: cleanPgName,
    status: "Active"
  }]);

  if (orgErr) {
    console.error("Org Error:", orgErr.message);
    return;
  }

  // 2. CREATE USER SECOND
  const email = "test_" + Date.now() + "@example.com";
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Test',
      phone: '1234567890',
      organization_id: newOrgId,
      pg_name: cleanPgName
    }
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Success creating user:", data.user.email);
    await supabase.auth.admin.deleteUser(data.user.id);
  }
  
  // Cleanup org
  await supabase.from("organizations").delete().eq("id", newOrgId);
}
run();
