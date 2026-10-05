const fs = require('fs');
const { execSync } = require('child_process');

const filesCmd = 'find src/app src/components -type f \\( -name "*.js" -o -name "*.css" \\)';
const files = execSync(filesCmd).toString().trim().split('\n');

let changesMade = 0;

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  const replaceSafe = (str, hex, replacement) => {
    const regex = new RegExp(`(?<!var\\([^)]*)${hex}\\b`, 'gi');
    return str.replace(regex, replacement);
  };

  newContent = replaceSafe(newContent, '#F1F5F9', 'var(--surface-muted)');
  newContent = replaceSafe(newContent, '#F59E0B', 'var(--warning)');
  newContent = replaceSafe(newContent, '#10B981', 'var(--success)');
  newContent = replaceSafe(newContent, '#EF4444', 'var(--danger)');
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changesMade++;
  }
}

console.log(`Updated ${changesMade} files.`);
