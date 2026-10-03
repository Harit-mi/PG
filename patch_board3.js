const fs = require('fs');
const file = 'src/components/RoomBoard.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
  /\.keyTag \{[\s\S]*?position: absolute;\s*top: 14px;[\s\S]*?\}/,
  match => match.replace('position: absolute;', 'position: relative;').replace('top: 14px;', 'margin-top: 14px;')
);

fs.writeFileSync(file, css);
