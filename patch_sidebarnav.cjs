const fs = require('fs');
const file = 'src/components/SidebarNav.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ThemeToggle')) {
  content = content.replace(
    'import styles from "@/app/dashboard/layout.module.css";',
    'import styles from "@/app/dashboard/layout.module.css";\nimport ThemeToggle from "./ThemeToggle";'
  );

  content = content.replace(
    '<span style={{ fontSize: "0.7rem", color: "#64748B" }}>v2.4</span>',
    '<span style={{ fontSize: "0.7rem", color: "#64748B" }}>v2.4</span>\n          <ThemeToggle />'
  );
  fs.writeFileSync(file, content);
}
