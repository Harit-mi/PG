const fs = require('fs');
let content = fs.readFileSync('src/app/actions.js', 'utf8');
content = content.replace(/owner_name: cleanName,\s*owner_email: cleanEmail,/g, 'name: cleanName,');
fs.writeFileSync('src/app/actions.js', content);
