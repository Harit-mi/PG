const fs = require('fs');

let content = fs.readFileSync('src/components/MarketingNavbar.js', 'utf8');

const loginRedirect = `
      setTimeout(() => {
        // Redirect to the 'app.' subdomain
        const currentHost = window.location.host; // e.g. localhost:3000 or stayos.in
        const proto = window.location.protocol; // http: or https:
        // Strip any existing subdomains if they exist, to get root domain
        const rootDomain = currentHost.replace(/^(app|owner|admin|tenant)\\./, '');
        
        const session = data.session;
        let hash = '';
        if (session) {
           hash = \`#access_token=\${session.access_token}&refresh_token=\${session.refresh_token}&expires_in=\${session.expires_in}&token_type=bearer&type=recovery\`; 
        }
        
        window.location.href = \`\${proto}//app.\${rootDomain}/\${hash}\`;
      }, 1000);`;

// We need to replace the existing setTimeout block
content = content.replace(/      setTimeout\(\(\) => \{\n        \/\/ Redirect to the 'app\.' subdomain[\s\S]*?window\.location\.href = `\$\{proto\}\/\/app\.\$\{rootDomain\}\/`;\n      \}, 1000\);/, loginRedirect);

fs.writeFileSync('src/components/MarketingNavbar.js', content);
