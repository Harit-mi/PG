const fs = require('fs');
let content = fs.readFileSync('src/app/page.module.css', 'utf8');

content = content.replace(/\.landingWrapper\[data-theme="light"\]\s*\{[\s\S]*?--grid-line:[^}]*\}\s*/, '');
fs.writeFileSync('src/app/page.module.css', content);
