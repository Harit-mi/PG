const fs = require('fs');
const file = 'src/app/page.module.css';
let content = fs.readFileSync(file, 'utf8');

// Replace the font tokens in landingWrapper
content = content.replace(/--font-wide: "Syncopate", sans-serif;/, '--font-wide: var(--font-space), sans-serif;');
content = content.replace(/--font-display: var\(--font-space\), "Cabinet Grotesk", sans-serif;/, '--font-display: var(--font-space), sans-serif;');
content = content.replace(/--font-body: "General Sans", var\(--font-sora\), system-ui, -apple-system, sans-serif;/, '--font-body: var(--font-sora), system-ui, -apple-system, sans-serif;');
content = content.replace(/--font-mono-stack: var\(--font-mono\), "JetBrains Mono", monospace;/, '--font-mono-stack: var(--font-mono), monospace;');

fs.writeFileSync(file, content);
console.log("Updated fonts in page.module.css");
