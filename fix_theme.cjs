const fs = require('fs');

let content = fs.readFileSync('src/components/ThemeToggle.js', 'utf8');
content = content.replace('const { theme, setTheme } = useTheme();', '');
content = content.replace('const { theme, resolvedTheme, setTheme } = useTheme();', 'const { resolvedTheme, setTheme } = useTheme();');
fs.writeFileSync('src/components/ThemeToggle.js', content);
