const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/background-color: #F8FAFC;/g, 'background-color: var(--background);');
  content = content.replace(/background: #F8FAFC;/g, 'background: var(--background);');
  content = content.replace(/background-color: #FFFFFF;/g, 'background-color: var(--surface);');
  content = content.replace(/background: #FFFFFF;/g, 'background: var(--surface);');
  content = content.replace(/color: #0F172A;/g, 'color: var(--foreground);');
  content = content.replace(/color: #1E293B;/g, 'color: var(--foreground);');
  content = content.replace(/color: #64748B;/g, 'color: var(--text-muted);');
  content = content.replace(/color: #475569;/g, 'color: var(--text-muted);');
  content = content.replace(/border: 1px solid #E2E8F0;/g, 'border: 1px solid var(--border);');
  content = content.replace(/border-color: #E2E8F0;/g, 'border-color: var(--border);');
  content = content.replace(/border-bottom: 1px solid #E2E8F0;/g, 'border-bottom: 1px solid var(--border);');
  content = content.replace(/background: #F1F5F9;/g, 'background: var(--surface-muted);');
  content = content.replace(/background-color: #F1F5F9;/g, 'background-color: var(--surface-muted);');
  fs.writeFileSync(file, content);
}

patchFile('src/app/dashboard/page.module.css');
patchFile('src/app/globals.css');
patchFile('src/app/dashboard/settings/page.module.css');
