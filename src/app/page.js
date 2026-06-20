"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
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
    <div className={styles.container}>
      <main className={`${styles.main} glass`} style={{ maxWidth: '400px', padding: '2.5rem' }}>
        <div className={styles.header} style={{ marginBottom: '2rem' }}>
          <div className={styles.logoContainer} style={{ width: '48px', height: '48px', marginBottom: '1rem' }}>
            <Building2 size={24} className={styles.logo} />
          </div>
          <h1 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p className={styles.subtitle} style={{ fontSize: '0.875rem' }}>
            Sign in to manage your PG properties.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input 
              type="email" 
              required
              placeholder="owner@example.com" 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.primaryButton} 
            style={{ marginTop: '1rem', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}
          >
            {loading ? <Loader2 className="spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign up</span>
        </p>
      </main>
    </div>
  );
}
