const fs = require('fs');
let content = fs.readFileSync('src/components/TenantActionMenu.js', 'utf8');

content = content.replace(/<button type="button" disabled=\{loading\} onClick=\{handleMoveOut\} className=\{styles\.submitBtn\} style=\{\{ background: 'var\(--rust\)' \}\}>/g, 
  '<button type="button" disabled={loading} onClick={handleMoveOut} className={styles.submitBtn} style={{ background: "var(--rust)" }} autoFocus>');

content = content.replace(/<button type="button" disabled=\{loading\} onClick=\{handleDelete\} className=\{styles\.dangerBtn\}>/g,
  '<button type="button" disabled={loading} onClick={handleDelete} className={styles.dangerBtn} autoFocus>');

fs.writeFileSync('src/components/TenantActionMenu.js', content);
