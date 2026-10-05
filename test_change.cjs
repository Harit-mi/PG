const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/tenants/page.js', 'utf8');
content = content.replace(/<h1>Tenant Directory<\/h1>/, '<h1>Tenant Directory (Please Refresh)</h1>');
fs.writeFileSync('src/app/dashboard/tenants/page.js', content);
