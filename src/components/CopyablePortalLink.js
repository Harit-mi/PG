"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyablePortalLink({ label, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={url} 
          readOnly 
          style={{ 
            flex: 1, 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid var(--border)', 
            color: 'white', 
            fontSize: '0.875rem',
            outline: 'none'
          }} 
        />
        <button 
          onClick={handleCopy}
          style={{ 
            background: copied ? 'var(--success)' : 'rgba(255,255,255,0.05)', 
            color: 'white', 
            border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`, 
            padding: '0 1rem', 
            borderRadius: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            minWidth: '90px'
          }}
        >
          {copied ? (
            <>
              <Check size={16} style={{ marginRight: '4px' }} /> Copied
            </>
          ) : (
            <>
              <Copy size={16} style={{ marginRight: '4px' }} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
