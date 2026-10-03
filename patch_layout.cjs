const fs = require('fs');
const file = 'src/app/layout.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import "./globals.css";',
  'import "./globals.css";\nimport { ThemeProvider } from "@/components/ThemeProvider";'
);

content = content.replace(
  '<html lang="en"',
  '<html lang="en" suppressHydrationWarning'
);

content = content.replace(
  '<body>{children}</body>',
  '<body>\n        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>\n          {children}\n        </ThemeProvider>\n      </body>'
);

fs.writeFileSync(file, content);
