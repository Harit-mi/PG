const fs = require('fs');
let content = fs.readFileSync('src/components/AddEmployeeModal.js', 'utf8');

const fileInput = `
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Aadhar Card (PDF or Photo)</label>
                  <input type="file" name="aadhar_card" accept="image/*,application/pdf" className={styles.input} style={{ background: 'transparent', padding: '0.5rem 0' }} />
                </div>
              </div>`;

content = content.replace(/<\/div>\s*<div className=\{styles\.modalFooter\}>/, fileInput + '\n              <div className={styles.modalFooter}>');

// Change saveBtn to submitBtn
content = content.replace(/className=\{styles\.saveBtn\}/g, "className={styles.submitBtn}");

fs.writeFileSync('src/components/AddEmployeeModal.js', content);
