const fs = require('fs');

let content = fs.readFileSync('src/components/ThemeToggle.js', 'utf8');

content = content.replace('  const { resolvedTheme, setTheme } = useTheme();\n  const isDark = resolvedTheme === "dark";', '  const isDark = resolvedTheme === "dark";');

content = content.replace('  const [mounted, setMounted] = useState(false);\n  ', '  const [mounted, setMounted] = useState(false);\n  const { resolvedTheme, setTheme } = useTheme();\n  ');

fs.writeFileSync('src/components/ThemeToggle.js', content);
