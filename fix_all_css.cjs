const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('grep -rnE "#F8FAFC|#FFFFFF|#0F172A|#1E293B|#E2E8F0|#64748B|#475569|#2563EB" src/app/ src/components/ | cut -d: -f1 | sort | uniq').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/background-color:\s*#F8FAFC/g, 'background-color: var(--background)');
  content = content.replace(/background:\s*#F8FAFC/g, 'background: var(--background)');
  content = content.replace(/background-color:\s*#FFFFFF/g, 'background-color: var(--surface)');
  content = content.replace(/background:\s*#FFFFFF/g, 'background: var(--surface)');
  
  content = content.replace(/color:\s*#0F172A/g, 'color: var(--foreground)');
  content = content.replace(/color:\s*#1E293B/g, 'color: var(--foreground)');
  content = content.replace(/color:\s*#64748B/g, 'color: var(--text-muted)');
  content = content.replace(/color:\s*#475569/g, 'color: var(--text-muted)');
  
  content = content.replace(/border:\s*1px solid #E2E8F0/g, 'border: 1px solid var(--border)');
  content = content.replace(/border-color:\s*#E2E8F0/g, 'border-color: var(--border)');
  content = content.replace(/border-bottom:\s*1px solid #E2E8F0/g, 'border-bottom: 1px solid var(--border)');
  content = content.replace(/border-top:\s*1px solid #E2E8F0/g, 'border-top: 1px solid var(--border)');
  
  content = content.replace(/color:\s*#2563EB/g, 'color: var(--primary)');
  content = content.replace(/background-color:\s*#2563EB/g, 'background-color: var(--primary)');
  content = content.replace(/background:\s*#2563EB/g, 'background: var(--primary)');
  
  fs.writeFileSync(file, content);
}
