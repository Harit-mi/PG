const fs = require('fs');

let content = fs.readFileSync('src/app/actions.js', 'utf8');

const oldCode = `    // 1. Create auth user with pre-confirmed email so they can log in instantly
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        phone: cleanPhone,
        organization_id: newOrgId,
        pg_name: cleanPgName
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // 2. Create organization
    const { error: orgErr } = await adminSupabase.from("organizations").insert([{
      id: newOrgId,
      name: cleanPgName,
      status: "Active"
    }]);

    if (orgErr) throw orgErr;`;

const newCode = `    // 1. Create organization first (to satisfy Postgres foreign key triggers)
    const { error: orgErr } = await adminSupabase.from("organizations").insert([{
      id: newOrgId,
      name: cleanPgName,
      status: "Active"
    }]);

    if (orgErr) throw orgErr;

    // 2. Create auth user with pre-confirmed email so they can log in instantly
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        phone: cleanPhone,
        organization_id: newOrgId,
        pg_name: cleanPgName
      }
    });

    if (authError) {
      // Rollback org if user creation fails
      await adminSupabase.from("organizations").delete().eq("id", newOrgId);
      throw new Error(authError.message);
    }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/app/actions.js', content);
console.log("Fixed actions.js order");
