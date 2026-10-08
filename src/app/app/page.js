"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { registerOwnerAccount } from "@/app/actions";
import styles from "@/app/page.module.css";
import Link from "next/link";

export default function AppLoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regPgName, setRegPgName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    
    const res = await registerOwnerAccount({
      name: regName,
      pgName: regPgName,
      phone: regPhone,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword
    });

    if (res.success) {
      router.push("/dashboard");
    } else {
      setAuthError(res.error || "Failed to create workspace.");
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <main className="glass" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--foreground)' }}>
            PGPlus Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {authMode === "login" 
              ? "Sign in to manage your properties." 
              : "Set up your PG management workspace."}
          </p>
        </div>

        {authError && <div className={styles.errorBanner}>{authError}</div>}
        {authSuccess && <div className={styles.successBanner}>{authSuccess}</div>}

        {authMode === "login" ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>EMAIL ADDRESS</label>
              <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PASSWORD</label>
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            
            <button type="submit" disabled={authLoading} className={styles.submitBtn} style={{ marginTop: '0.5rem', padding: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
              {authLoading ? <Loader2 className="spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Don't have an account? <button type="button" onClick={() => setAuthMode("register")} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Sign up</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>FULL NAME</label>
              <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PG / HOSTEL NAME</label>
              <input type="text" required value={regPgName} onChange={e => setRegPgName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PHONE</label>
              <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>EMAIL</label>
              <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PASSWORD</label>
                <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>CONFIRM</label>
                <input type="password" required value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} />
              </div>
            </div>
            <button type="submit" disabled={authLoading} className={styles.submitBtn} style={{ marginTop: '0.5rem', padding: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
              {authLoading ? <Loader2 className="spin" size={18} /> : <>Create Workspace <ArrowRight size={18} /></>}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Already have an account? <button type="button" onClick={() => setAuthMode("login")} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Log in</button>
            </div>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to PGPlus.com
          </Link>
        </div>
      </main>
    </div>
  );
}
