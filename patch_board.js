const fs = require('fs');
const file = 'src/components/RoomBoard.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
  /\.keyTag \{[\s\S]*?position: absolute;[\s\S]*?\}/,
  match => match.replace('position: absolute;', 'position: relative; margin-top: 14px;')
);

fs.writeFileSync(file, css);
