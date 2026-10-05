const fs = require('fs');
let content = fs.readFileSync('src/app/page.js', 'utf8');

// Add import
content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { useTheme } from "next-themes";');

// Replace state
content = content.replace('const [theme, setTheme] = useState("dark");', `const { resolvedTheme, setTheme } = useTheme();\n  const theme = resolvedTheme || "dark";`);

// Remove localStorage setting
content = content.replace('const saved = localStorage.getItem("ourpg_theme");', '//');
content = content.replace('if (saved === "dark" || saved === "light") {', 'if (false) {');
content = content.replace('setTheme(saved);', '');
content = content.replace('}', '');

// Replace toggleTheme
const oldToggle = `
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ourpg_theme", next);
  };
`;
const newToggle = `
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
`;
content = content.replace(/const toggleTheme = \(\) => \{[\s\S]*?\};\n/, newToggle);

fs.writeFileSync('src/app/page.js', content);
