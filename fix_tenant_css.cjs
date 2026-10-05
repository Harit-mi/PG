const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/tenants/page.module.css', 'utf8');

content = content.replace(/background-color: #FFFFFF;/g, 'background-color: var(--surface);');
content = content.replace(/\.searchBar \{\n  display: flex;\n  align-items: center;\n  background-color: #FFFFFF;/g, '.searchBar {\n  display: flex;\n  align-items: center;\n  background-color: var(--surface);');

fs.writeFileSync('src/app/dashboard/tenants/page.module.css', content);
