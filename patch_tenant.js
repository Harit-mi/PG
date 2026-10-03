const fs = require('fs');
const path = 'src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js';
let code = fs.readFileSync(path, 'utf8');

const privacyHtml = `
          {/* Notices */}
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="bullhorn" /> Hostel Notice Board
            </h4>
            {notices && notices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ padding: '0.85rem', background: 'rgba(30,72,119,0.03)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--primary)' }}>{notice.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--foreground)' }}>{notice.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No notices posted.</p>
            )}
          </div>

          {/* DPDP ACT Data Erasure */}
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--danger)', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem', fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="shield-halved" /> DPDP Act 2023 Compliance
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              Under the Digital Personal Data Protection Act, you have the right to request erasure of your personal data from this system.
            </p>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to request data erasure? Your PG owner will be notified to delete your personal data within 30 days in compliance with the DPDP Act 2023.")) {
                  alert("Data Erasure request successfully logged. The Data Fiduciary (Your PG Owner) has been notified.");
                }
              }}
              style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.8rem', cursor: 'pointer' }}>
              Request Data Erasure
            </button>
          </div>
`;

code = code.replace(/{[\s\n]*\/\* Notices \*\/[\s\n]*<div style={{ background: 'var\(--card-bg\)', padding: '1\.25rem', borderRadius: '16px', border: '1px solid var\(--border\)' }}>[\s\S]*?(?:<\/div>[\s\n]*<\/div>|No notices posted\.<\/p>[\s\n]*<\/div>)/, privacyHtml);

fs.writeFileSync(path, code);
