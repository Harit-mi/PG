const fs = require('fs');
const file = 'src/app/dashboard/layout.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
  /\.sidebar \{\s*position: fixed;\s*bottom: 0;/g,
  '.sidebar {\n    position: fixed;\n    top: auto;\n    bottom: 0;'
);

fs.writeFileSync(file, css);
