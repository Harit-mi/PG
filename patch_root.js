const fs = require('fs');
const file = 'src/app/layout.js';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ThemeProvider')) {
  code = code.replace(
    'import "./globals.css";',
    'import "./globals.css";\nimport { ThemeProvider } from "@/components/ThemeProvider";'
  );
  
  code = code.replace(
    /<html([^>]*)>/,
    '<html$1 suppressHydrationWarning>'
  );
  
  code = code.replace(
    /<body>(.*?)<\/body>/s,
    '<body>\n        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>\n          $1\n        </ThemeProvider>\n      </body>'
  );
  
  fs.writeFileSync(file, code);
}
