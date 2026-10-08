const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.js', 'utf8');

content = content.replace(
  /const rootDomain = host\.replace\(\/\^\(app\|owner\|admin\|tenant\)\\\.\/,\s*""\);\n\s*redirect\(`\$\{proto\}:\/\/\$\{rootDomain\}\/`\);/,
  `redirect('/');`
);

fs.writeFileSync('src/app/dashboard/layout.js', content);
