const fs = require('fs');
const { execSync } = require('child_process');

const filesCmd = 'find src/app src/components -type f \\( -name "*.js" -o -name "*.css" \\)';
const files = execSync(filesCmd).toString().trim().split('\n');

let changesMade = 0;

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Restore color: var(--surface) and color: var(--background) to color: white
  newContent = newContent.replace(/color:\s*var\(--surface\)/g, 'color: #FFFFFF');
  newContent = newContent.replace(/color:\s*'var\(--surface\)'/g, "color: '#FFFFFF'");
  newContent = newContent.replace(/color:\s*var\(--background\)/g, 'color: #FFFFFF');
  newContent = newContent.replace(/color:\s*'var\(--background\)'/g, "color: '#FFFFFF'");
  
  // Also fix stroke and fill
  newContent = newContent.replace(/fill:\s*var\(--surface\)/g, 'fill: #FFFFFF');
  newContent = newContent.replace(/fill:\s*'var\(--surface\)'/g, "fill: '#FFFFFF'");
  newContent = newContent.replace(/stroke:\s*var\(--surface\)/g, 'stroke: #FFFFFF');
  newContent = newContent.replace(/stroke:\s*'var\(--surface\)'/g, "stroke: '#FFFFFF'");

  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changesMade++;
  }
}

console.log(`Updated ${changesMade} files.`);
