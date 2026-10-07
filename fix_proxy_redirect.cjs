const fs = require('fs');
let content = fs.readFileSync('src/proxy.js', 'utf8');

content = content.replace(
  /return NextResponse\.redirect\(\`\\\$\\{proto\\}:\/\/\\\$\\{rootDomain\\}\/\`\);/g,
  "return NextResponse.redirect(new URL('/', `${proto}://${rootDomain}`));"
);

fs.writeFileSync('src/proxy.js', content);
