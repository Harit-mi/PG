const fs = require('fs');
const file = 'src/components/SidebarNav.js';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ThemeToggle')) {
  code = code.replace(
    'import PropertySelector from "./PropertySelector";',
    'import PropertySelector from "./PropertySelector";\nimport ThemeToggle from "./ThemeToggle";'
  );
  
  code = code.replace(
    /<\/nav>/,
    '</nav>\n      <ThemeToggle />'
  );
  
  fs.writeFileSync(file, code);
}
