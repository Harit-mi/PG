const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.js', 'utf8');

const replacement = `  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const headersList = await require("next/headers").headers();
    const host = headersList.get("host") || "";
    const proto = host.includes("localhost") ? "http" : "https";
    const rootDomain = host.replace(/^(app|owner|admin|tenant)\\./, "");
    redirect(\`\${proto}://\${rootDomain}/\`);
  }`;

content = content.replace(/  const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\n  if \(\!user\) \{\n    redirect\("\/"\);\n  \}/, replacement);

fs.writeFileSync('src/app/dashboard/layout.js', content);
