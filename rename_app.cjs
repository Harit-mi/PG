const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const filesToFix = execSync('grep -riEl "(StayOS|stayos|PG Management)" src/').toString().split('\n').filter(Boolean);

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Case sensitive replaces first
  content = content.replace(/StayOS/g, "PGPlus");
  content = content.replace(/stayos/g, "pgplus");
  content = content.replace(/PG Management/g, "PGPlus");
  content = content.replace(/PG management/g, "PGPlus");
  
  fs.writeFileSync(file, content);
}
