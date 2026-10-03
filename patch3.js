const fs = require('fs');
let code = fs.readFileSync('src/app/super-admin/actions.js', 'utf8');

const oldAuth = `    const tempSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // We generate a temp org UUID first so we can map the auth user to it
    const tempOrgUuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_id: tempOrgUuid,
          name,
          phone: mobile
        }
      }
    });`;

const newAuth = `    // We generate a temp org UUID first so we can map the auth user to it
    const tempOrgUuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    // Use admin client to create user to bypass rate limits and auto-confirm email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        organization_id: tempOrgUuid,
        name,
        phone: mobile
      }
    });`;

if (code.includes('tempSupabase.auth.signUp')) {
    code = code.replace(oldAuth, newAuth);
    fs.writeFileSync('src/app/super-admin/actions.js', code);
    console.log("Patched actions.js to use auth.admin.createUser");
} else {
    console.log("Could not find oldAuth pattern in actions.js");
}
