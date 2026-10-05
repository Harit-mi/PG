const fs = require('fs');
const { execSync } = require('child_process');

const filesCmd = 'find src/app src/components src/utils -type f \\( -name "*.js" -o -name "*.css" \\)';
const files = execSync(filesCmd).toString().trim().split('\n');

let changesMade = 0;

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Case sensitive replaces for standard strings
  newContent = newContent.replace(/OUR-PG/g, 'StayOS');
  newContent = newContent.replace(/OUR PG/g, 'StayOS');
  newContent = newContent.replace(/Our PG/g, 'StayOS');
  newContent = newContent.replace(/Our-PG/g, 'StayOS');
  newContent = newContent.replace(/OURPG/g, 'StayOS');
  newContent = newContent.replace(/ourpg\.com/g, 'stayos.com');
  newContent = newContent.replace(/ourpg_theme/g, 'stayos_theme');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changesMade++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${changesMade} files.`);
