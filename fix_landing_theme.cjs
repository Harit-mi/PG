const fs = require('fs');
const file = 'src/app/page.module.css';
let content = fs.readFileSync(file, 'utf8');

const newTokens = `
.landingWrapper {
  /* Fonts */
  --font-wide: "Syncopate", sans-serif;
  --font-display: var(--font-space), "Cabinet Grotesk", sans-serif;
  --font-body: "General Sans", var(--font-sora), system-ui, -apple-system, sans-serif;
  --font-mono-stack: var(--font-mono), "JetBrains Mono", monospace;

  /* Theme Tokens mapped to Global Theme */
  --bg-page: var(--background);
  --text-primary: var(--foreground);
  --text-secondary: var(--text-muted);
  --text-muted: var(--text-muted);
  
  /* Accents */
  --accent: var(--primary); 
  --accent-neon: var(--success); 
  --accent-bg: var(--badge-blue-bg, rgba(37, 99, 235, 0.1));
  --accent-hover: var(--primary-hover);
  --accent-glow: transparent;
  --accent-text: #FFFFFF;

  /* HUD Surfaces */
  --card-bg: var(--surface);
  --card-border: var(--border);
  --card-border-glow: var(--primary);
  --card-subtle: var(--surface-muted, var(--border-light));
  --card-hover-border: var(--primary);

  --pill-bg: var(--surface);
  --pill-border: var(--border);
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.05);
  --shadow-window: 0 20px 25px rgba(0,0,0,0.05);

  --phone-bg: var(--background);
  --phone-header: var(--surface);
  --chat-recv: var(--surface);
  --chat-sent: var(--primary);
  
  background-color: var(--bg-page);
  color: var(--text-primary);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
`;

content = content.replace(/\.landingWrapper\s*\{[\s\S]*?min-height:\s*100vh;\s*position:\s*relative;\s*overflow-x:\s*hidden;\s*\}/, newTokens.trim());
fs.writeFileSync(file, content);
console.log("Updated page.module.css");
