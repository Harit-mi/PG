"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Loader2, BookOpen } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login and redirect to pricing
    setTimeout(() => {
      router.push("/pricing");
    }, 1000);
  };

  return (
    <div className={styles.ledgerWrapper}>
      {/* Physical Ledger Cover styling */}
      <main className={styles.ledgerCover}>
        {/* Spine binding details */}
        <div className={styles.ledgerSpine}>
          <div className={styles.goldStitching}></div>
        </div>

        {/* Outer label card inset */}
        <div className={styles.ledgerLabel}>
          <div className={styles.labelBorder}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', background: 'rgba(185, 141, 62, 0.1)', color: 'var(--brass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--brass)' }}>
                <BookOpen size={24} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 4px' }}>
                PROPERTY REGISTER
              </h1>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-teal)', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
                paying guest SaaS ledger
              </span>
            </div>

            {/* Login form styled as ledger ruled rows */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className={styles.ruledRow}>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  OWNER EMAIL
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="owner@example.com" 
                  className="ledger-mono"
                  style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    border: 'none', 
                    borderBottom: '2px solid var(--border-light)', 
                    borderRadius: '0', 
                    padding: '6px 0', 
                    color: 'var(--foreground)', 
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className={styles.ruledRow}>
                <label style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  PASSWORD
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="ledger-mono"
                  style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    border: 'none', 
                    borderBottom: '2px solid var(--border-light)', 
                    borderRadius: '0', 
                    padding: '6px 0', 
                    color: 'var(--foreground)', 
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.85rem', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  width: '100%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-fraunces), serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(185, 141, 62, 0.2)',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? <Loader2 className="spin" size={18} /> : <>OPEN REGISTER <ArrowRight size={18} /></>}
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Authorized platform operators only.
            </p>

          </div>
        </div>

      </main>
    </div>
  );
}
