"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[OUR-PG Fatal Global Error]", error);
  }, [error]);

  return (
    <html>
      <body style={{
        fontFamily: 'sans-serif',
        background: '#0a1716',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '450px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          background: '#0d1f1e'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Application Error</h2>
          <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '1.5rem' }}>
            A critical application layout error occurred. Please try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#1E4877',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.5rem',
              borderRadius: '99px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
