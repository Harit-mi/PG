const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking visitors table...");
  const { data: visitors, error: visitorsError } = await supabase
    .from('visitors')
    .select('*')
    .limit(1);

  if (visitorsError) {
    console.error("Visitors Table Error:", visitorsError.message);
  } else {
    console.log("Visitors Table is successfully accessible!");
  }

  console.log("Checking transactions columns...");
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('id, payment_reference, payment_screenshot_url')
    .limit(1);

  if (transactionsError) {
    console.error("Transactions Columns Error:", transactionsError.message);
  } else {
    console.log("Transactions columns (payment_reference, payment_screenshot_url) are successfully accessible!");
  }
}

check();
