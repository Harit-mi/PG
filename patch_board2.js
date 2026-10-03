const fs = require('fs');
const file = 'src/components/RoomBoard.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
  /\.keyTag \{[\s\S]*?\}/,
  match => match.replace('top: 14px;', '')
);

fs.writeFileSync(file, css);
