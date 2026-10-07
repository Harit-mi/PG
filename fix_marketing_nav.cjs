const fs = require('fs');
let content = fs.readFileSync('src/components/MarketingNavbar.js', 'utf8');

// Replace router.push("/dashboard") with absolute URL redirect to app subdomain
const replacement = `      setTimeout(() => {
        // Redirect to the 'app.' subdomain
        const currentHost = window.location.host; // e.g. localhost:3000 or stayos.in
        const proto = window.location.protocol; // http: or https:
        // Strip any existing subdomains if they exist, to get root domain
        const rootDomain = currentHost.replace(/^(app|owner|admin|tenant)\\./, '');
        window.location.href = \`\${proto}//app.\${rootDomain}/\`;
      }, 1000);`;

content = content.replace(/      setTimeout\(\(\) => \{\n        router\.push\("\/dashboard"\);\n      \}, 1000\);/g, replacement);

// We need to also add a button to go directly to the app if they are already logged in?
// The user said: "landing page should have link of app but make app different".
// This might mean "if they are already logged in, show 'Go to App' instead of 'Log in', and it should link to app.stayos.in".
// Actually, let's just make the login redirect work first.

fs.writeFileSync('src/components/MarketingNavbar.js', content);
