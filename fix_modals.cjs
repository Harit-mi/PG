const fs = require('fs');

// Fix AddEmployeeModal.js
let addEmp = fs.readFileSync('src/components/AddEmployeeModal.js', 'utf8');
addEmp = addEmp.replace(/className=\{styles\.modal\}/, 'className={`${styles.modal} glass`}');
addEmp = addEmp.replace(/<input name="name"/, '<input name="name" className={styles.input}');
addEmp = addEmp.replace(/<input \n\s*type="tel"/, '<input className={styles.input}\n                    type="tel"');
addEmp = addEmp.replace(/<select name="role"/, '<select name="role" className={styles.input}');
addEmp = addEmp.replace(/<input name="salary"/, '<input name="salary" className={styles.input}');
addEmp = addEmp.replace(/<textarea name="address"/, '<textarea name="address" className={styles.input}');
addEmp = addEmp.replace(/className=\{styles\.modalFooter\}/, 'className={styles.actions}');
fs.writeFileSync('src/components/AddEmployeeModal.js', addEmp);

// Fix EditEmployeeModal.js
let editEmp = fs.readFileSync('src/components/EditEmployeeModal.js', 'utf8');
editEmp = editEmp.replace(/className=\{styles\.header\}/, 'className={styles.modalHeader}');
editEmp = editEmp.replace(/className=\{styles\.footer\}/, 'className={styles.actions}');
fs.writeFileSync('src/components/EditEmployeeModal.js', editEmp);

