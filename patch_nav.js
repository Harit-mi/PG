const fs = require('fs');
const path = 'src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js';
let code = fs.readFileSync(path, 'utf8');

const navHtml = `
        <button 
          onClick={() => setActiveTab("menu")}
          style={{ 
            background: activeTab === 'menu' ? 'var(--primary)' : 'var(--card-bg)', 
            color: activeTab === 'menu' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="utensils" style={{ fontSize: '20px', color: activeTab === 'menu' ? 'white' : 'var(--accent)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Food Menu</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'menu' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>This week's plan</span>
        </button>

        <button 
          onClick={() => setActiveTab("leave")}
`;

code = code.replace('<button \n          onClick={() => setActiveTab("leave")}', navHtml);
fs.writeFileSync(path, code);
