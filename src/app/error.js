"use client";

import { useEffect } from "react";
import { logError } from "@/utils/logger";
import FAIcon from "@/components/FAIcon";

export default function Error({ error, reset }) {
  useEffect(() => {
    logError(error, { location: "Root Error Boundary" });
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '20px',
        textAlign: 'center',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(220, 38, 38, 0.1)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          fontSize: '28px'
        }}>
          <FAIcon icon="triangle-exclamation" />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--foreground)' }}>
          Something went wrong!
        </h2>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
          An unhandled error occurred while rendering this page. The error has been logged for system diagnostics.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.5rem',
              borderRadius: '99px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              padding: '0.65rem 1.5rem',
              borderRadius: '99px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
