const fs = require('fs');
const file = 'src/app/dashboard/layout.module.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/background-color: #F8FAFC;/g, 'background-color: var(--background);');
content = content.replace(/color: #0F172A;/g, 'color: var(--foreground);');
content = content.replace(/background-color: #FFFFFF;/g, 'background-color: var(--sidebar-bg);');
content = content.replace(/border-right: 1px solid #E2E8F0;/g, 'border-right: 1px solid var(--sidebar-border);');
content = content.replace(/border-top: 1px solid #E2E8F0;/g, 'border-top: 1px solid var(--sidebar-border);');
content = content.replace(/background: #E2E8F0;/g, 'background: var(--border);');
content = content.replace(/scrollbar-color: #CBD5E1 transparent;/g, 'scrollbar-color: var(--text-muted) transparent;');
content = content.replace(/background: linear-gradient\(135deg, #2563EB 0%, #1D4ED8 100%\);/g, 'background: var(--primary);');
content = content.replace(/border: 1px solid rgba\(37, 99, 235, 0.2\);/g, 'border: 1px solid var(--border);');
content = content.replace(/box-shadow: 0 2px 6px rgba\(37, 99, 235, 0.25\);/g, 'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);');
content = content.replace(/color: #0F172A;/g, 'color: var(--foreground);');
content = content.replace(/color: #64748B;/g, 'color: var(--text-muted);');
content = content.replace(/color: #475569;/g, 'color: var(--text-muted);');
content = content.replace(/background-color: #F1F5F9;/g, 'background-color: var(--sidebar-item-hover);');
content = content.replace(/background-color: #EFF6FF;/g, 'background-color: var(--sidebar-item-active);');
content = content.replace(/color: #2563EB;/g, 'color: var(--sidebar-text-active);');
content = content.replace(/background-color: #2563EB;/g, 'background-color: var(--primary);');
content = content.replace(/border-top: 1px solid #E2E8F0;/g, 'border-top: 1px solid var(--border);');
content = content.replace(/background: #F8FAFC;/g, 'background: var(--sidebar-bg);');
content = content.replace(/border-bottom: 1px solid #E2E8F0;/g, 'border-bottom: 1px solid var(--border);');

fs.writeFileSync(file, content);
