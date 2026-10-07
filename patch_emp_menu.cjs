const fs = require('fs');
let content = fs.readFileSync('src/components/EmployeeActionMenu.js', 'utf8');

content = content.replace(
  /if \(\!result\.success\) \{\n\s*alert\(result\.error \|\| "Failed to delete employee"\);\n\s*\}/,
  `if (!result.success) {\n        alert(result.error || "Failed to delete employee");\n      } else {\n        router.refresh();\n      }`
);

fs.writeFileSync('src/components/EmployeeActionMenu.js', content);
