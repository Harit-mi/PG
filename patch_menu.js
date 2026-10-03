const fs = require('fs');
const path = 'src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js';
let code = fs.readFileSync(path, 'utf8');

const menuHtml = `
      {/* WEEKLY MENU TAB */}
      {activeTab === 'menu' && (
        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FAIcon icon="utensils" /> Weekly Food Menu
          </h4>
          
          {weeklyMenu && weeklyMenu.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                const dayMenu = weeklyMenu.find(m => m.day_of_week === day);
                return (
                  <div key={day} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: day === new Date().toLocaleDateString('en-US', {weekday:'long'}) ? 'var(--primary)' : 'rgba(30,72,119,0.03)', color: day === new Date().toLocaleDateString('en-US', {weekday:'long'}) ? 'white' : 'inherit', padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.9rem', borderBottom: '1px solid var(--border)' }}>
                      {day} {day === new Date().toLocaleDateString('en-US', {weekday:'long'}) && "(Today)"}
                    </div>
                    <div style={{ padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>BREAKFAST</span>
                        <strong>{dayMenu?.breakfast || 'Standard'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>LUNCH</span>
                        <strong>{dayMenu?.lunch || 'Standard'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>DINNER</span>
                        <strong>{dayMenu?.dinner || 'Standard'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>The weekly menu has not been published yet.</p>
          )}

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'right' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab("home")}
              style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* TODAY'S FOOD MENU & NOTICES */}
`;

code = code.replace('{/* TODAY\'S FOOD MENU & NOTICES */}', menuHtml);
fs.writeFileSync(path, code);
