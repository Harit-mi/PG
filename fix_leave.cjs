const fs = require('fs');
let content = fs.readFileSync('src/components/AddLeaveModal.js', 'utf8');

// Remove defaultButtonStyle
content = content.replace(/const defaultButtonStyle = \{[\s\S]*?\};\n\n/, '');
content = content.replace(/style=\{buttonClass \? \{\} : defaultButtonStyle\}/, '');

fs.writeFileSync('src/components/AddLeaveModal.js', content);
