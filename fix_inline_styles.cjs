const fs = require('fs');
const { execSync } = require('child_process');

const filesCmd = 'find src/app src/components -type f \\( -name "*.js" -o -name "*.css" \\)';
const files = execSync(filesCmd).toString().trim().split('\n');

let changesMade = 0;

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // We replace the hex codes globally, regardless of case, inside the files.
  // Using global regex with case-insensitive flag.
  // For #FFFFFF, it might be in CSS (background: #FFFFFF) or JS (background: '#FFFFFF')
  // We want to replace just the hex code with var(--variable)
  // BUT we must be careful not to replace it if it's already inside var(--text-muted, #64748b)
  
  // Safe replacement function that ignores if it's inside var(...)
  const replaceSafe = (str, hex, replacement) => {
    const regex = new RegExp(`(?<!var\\([^)]*)${hex}\\b`, 'gi');
    return str.replace(regex, replacement);
  };

  newContent = replaceSafe(newContent, '#F8FAFC', 'var(--background)');
  newContent = replaceSafe(newContent, '#FFFFFF', 'var(--surface)');
  newContent = replaceSafe(newContent, '#0F172A', 'var(--foreground)');
  newContent = replaceSafe(newContent, '#1E293B', 'var(--foreground)');
  newContent = replaceSafe(newContent, '#64748B', 'var(--text-muted)');
  newContent = replaceSafe(newContent, '#475569', 'var(--text-muted)');
  newContent = replaceSafe(newContent, '#E2E8F0', 'var(--border)');
  newContent = replaceSafe(newContent, '#2563EB', 'var(--primary)');
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changesMade++;
  }
}

console.log(`Updated ${changesMade} files.`);
