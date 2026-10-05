const fs = require('fs');
const file = 'src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

// The most robust way is to just replace the entire :root block with the known correct one.
const correctRoot = `:root {
  --background: #F8FAFC;
  --foreground: #0F172A;
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --surface: #FFFFFF;
  --border: #E2E8F0;
  --border-light: #F1F5F9;
  --text-muted: #64748B;
  
  --success: #10B981;
  --danger: #EF4444;
  --warning: #F59E0B;
  --accent: #2563EB;
  --card-bg: #FFFFFF;

  --brass: #D97706;
  --rust: #E11D48;
  --slate-teal: #059669;

  --cst-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px -2px rgba(15, 23, 42, 0.02);
  --cst-shadow-hover: 0 4px 16px -2px rgba(15, 23, 42, 0.06);
  
  --sidebar-bg: #FFFFFF;
  --sidebar-border: #E2E8F0;
  --sidebar-text: #475569;
  --sidebar-text-active: #0F172A;
  --sidebar-item-hover: #F1F5F9;
  --sidebar-item-active: #EFF6FF;
  --surface-muted: #F8FAFC;
  --surface-elevated: #FFFFFF;

  --badge-emerald-bg: #ECFDF5;
  --badge-emerald-text: #059669;
  --badge-amber-bg: #FFFBEB;
  --badge-amber-text: #D97706;
  --badge-rose-bg: #FFF1F2;
  --badge-rose-text: #E11D48;
  --badge-blue-bg: #EFF6FF;
  --badge-blue-text: #2563EB;

  --font-wide: "Space Grotesk", sans-serif;
  --font-ui: "General Sans", var(--font-sora), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: "Cabinet Grotesk", var(--font-space), "General Sans", sans-serif;
  --font-mono-stack: var(--font-mono), "JetBrains Mono", monospace;
}`;

content = content.replace(/:root\s*\{[\s\S]*?(?=\n\.tabular-nums)/, correctRoot);

fs.writeFileSync(file, content);
