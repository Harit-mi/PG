const fs = require('fs');
const path = 'src/components/AddTenantModal.js';
let code = fs.readFileSync(path, 'utf8');

const checkboxHtml = `
              <div className={styles.formGroup} style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                  <input type="checkbox" name="dpdp_consent" required style={{ marginTop: '0.2rem', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>DPDP Act Compliance:</strong> I confirm that I have obtained explicit, clear, and informed consent from this individual to collect and process their digital personal data for the purpose of hostel management, as required by the Digital Personal Data Protection Act, 2023.
                  </span>
                </label>
              </div>

              <div className={styles.actions}>
`;

code = code.replace('<div className={styles.actions}>', checkboxHtml);
fs.writeFileSync(path, code);
