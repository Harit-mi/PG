const fs = require('fs');
const file = 'src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

// Fix infinite loop variables in light mode
content = content.replace('--background: var(--background);', '--background: #F8FAFC;');
content = content.replace('--surface: var(--surface);', '--surface: #FFFFFF;');
content = content.replace('--sidebar-bg: var(--surface);', '--sidebar-bg: #FFFFFF;');
content = content.replace('--card-bg: var(--surface);', '--card-bg: #FFFFFF;');
content = content.replace('--surface-elevated: var(--surface);', '--surface-elevated: #FFFFFF;');

// Check if there are any other broken vars in :root
content = content.replace('--border-light: var(--surface-muted);', '--border-light: #F1F5F9;');

fs.writeFileSync(file, content);
