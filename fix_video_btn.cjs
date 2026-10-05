const fs = require('fs');

let content = fs.readFileSync('src/components/VideoGuideButton.js', 'utf8');

// Ensure Info is imported from lucide-react
if (!content.includes('Info')) {
  content = content.replace(/import \{ Video, Play, X, ExternalLink \} from 'lucide-react';/, "import { Video, Play, X, ExternalLink, Info } from 'lucide-react';");
}

const oldButton = `<button 
        type="button"
        onClick={() => setIsOpen(true)}
        title={\`Watch Video Guide for \${section}\`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(30, 72, 119, 0.08)',
          color: 'var(--primary, #1e4877)',
          border: '1px solid rgba(30, 72, 119, 0.25)',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--primary, #1e4877)';
          e.currentTarget.style.color = 'var(--surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(30, 72, 119, 0.08)';
          e.currentTarget.style.color = 'var(--primary, #1e4877)';
        }}
      >
        <span style={{ 
          width: '18px', 
          height: '18px', 
          borderRadius: '50%', 
          background: 'currentColor', 
          color: '#FFFFFF', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 900
        }}>
          i
        </span>
        <span>Video Guide</span>
      </button>`;

const newButton = `<button 
        type="button"
        onClick={() => setIsOpen(true)}
        title={\`Info & Video Guide for \${section}\`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          background: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--surface-muted)';
          e.currentTarget.style.color = 'var(--foreground)';
          e.currentTarget.style.borderColor = 'var(--text-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <Info size={18} />
      </button>`;

if (content.includes(oldButton)) {
    content = content.replace(oldButton, newButton);
    fs.writeFileSync('src/components/VideoGuideButton.js', content);
    console.log("Updated VideoGuideButton successfully");
} else {
    console.log("Could not find oldButton block");
}
