const fs = require('fs');
const file = 'src/app/globals.css';
let css = fs.readFileSync(file, 'utf8');

if (!css.includes('[data-theme="dark"]')) {
  const darkModeVars = `
[data-theme="dark"] {
  --background: #0B1120;
  --foreground: #F8FAFC;
  --primary: #38BDF8;
  --primary-hover: #7DD3FC;
  --surface: #1E293B;
  --border: #334155;
  --border-light: rgba(255, 255, 255, 0.1);
  --text-muted: #94A3B8;
  --card-bg: #1E293B;
  
  --cst-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  --cst-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -6px rgba(0, 0, 0, 0.6);
}
`;
  
  // Insert dark mode vars right after :root block
  css = css.replace(/(:root\s*\{[^}]*\})/, '$1' + darkModeVars);
  
  // Also fix inputs in dark mode
  css = css.replace(/input,\s*select,\s*textarea\s*\{([\s\S]*?background: )#FFFFFF;/g, 'input, select, textarea {$1var(--surface);');
  
  fs.writeFileSync(file, css);
}
