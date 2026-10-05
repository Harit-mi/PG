require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const email = "test_" + Date.now() + "@example.com";
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Test',
      phone: '1234567890',
      organization_id: '12345678-1234-1234-1234-123456789012',
      pg_name: 'Test PG'
    }
  });

  if (error) {
    console.error("Error creating:", error.message);
  } else {
    console.log("Success creating:", data.user.email);
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}
run();
