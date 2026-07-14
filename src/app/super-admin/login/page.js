"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import styles from "../../page.module.css";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Predefined secure admin login for platform owner
    if (email === "admin@pgmanagement.com" && password === "adminpassword") {
      setTimeout(() => {
        localStorage.setItem("super_admin_session", JSON.stringify({ email, role: "SuperAdmin" }));
        router.push("/super-admin");
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError("Invalid administrative credentials.");
      }, 1000);
    }
  };

  return (
    <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <main className="glass" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '20px' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--foreground)' }}>Super Admin Portal</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Enter your platform administrator credentials
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Admin Email</label>
            <input 
              type="email" 
              required
              placeholder="admin@pgmanagement.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '99px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Master Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '99px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.85rem', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem', 
              width: '100%', 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '99px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)'
            }}
          >
            {loading ? <Loader2 className="spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
