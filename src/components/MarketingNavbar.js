"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Moon, Sun, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { registerOwnerAccount } from "@/app/actions";
import styles from "@/app/page.module.css";

const supabase = createClient();

export default function MarketingNavbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const theme = resolvedTheme || "dark";

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPgName, setRegPgName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccess("");
    setIsAuthOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      setAuthError(err.message || "Invalid credentials.");
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await registerOwnerAccount({
        name: regName,
        phone: regPhone,
        pgName: regPgName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (!res.success) throw new Error(res.error || "Failed to create account.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPassword
      });

      if (signInError) throw signInError;
      router.push("/dashboard");
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navActions} style={{ flex: 1 }}>
          <Link href="/" className={styles.brand} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Building2 size={24} />
            StayOS
          </Link>
        </div>
        
        <div className={styles.navActions} style={{ flex: 2, justifyContent: 'center', gap: '2rem' }}>
          <Link href="/features" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>Features</Link>
          <Link href="/pricing" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>Pricing</Link>
        </div>

        <div className={styles.navActions} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => openAuth("login")} className={styles.btnSecondary}>
            Log in
          </button>
          <button onClick={() => openAuth("register")} className={styles.btnPrimary}>
            Sign up
          </button>
        </div>
      </nav>

      {isAuthOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAuthOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsAuthOpen(false)}>
              <X size={20} />
            </button>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {authMode === "login" ? "Welcome back" : "Create your workspace"}
              </h2>
              <p className={styles.modalSubtitle}>
                {authMode === "login" 
                  ? "Enter your credentials to access your command center." 
                  : "Setup takes 60 seconds. Zero payment details required."}
              </p>
            </div>

            <div className={styles.modalBody}>
              {authError && <div className={styles.errorBanner}>{authError}</div>}
              {authSuccess && <div className={styles.successBanner}>{authSuccess}</div>}

              {authMode === "login" ? (
                <form onSubmit={handleLogin}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email address</label>
                    <input 
                      type="email" 
                      required 
                      className={styles.input} 
                      value={loginEmail} 
                      onChange={e => setLoginEmail(e.target.value)} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <input 
                      type="password" 
                      required 
                      className={styles.input} 
                      value={loginPassword} 
                      onChange={e => setLoginPassword(e.target.value)} 
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className={styles.submitBtn}>
                    {authLoading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                  </button>
                  <div className={styles.authFooter}>
                    Don't have an account? <button type="button" onClick={() => setAuthMode("register")} className={styles.authLink}>Sign up</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input type="text" required className={styles.input} value={regName} onChange={e => setRegName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>PG/Hostel Name</label>
                    <input type="text" required className={styles.input} value={regPgName} onChange={e => setRegPgName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input type="tel" required className={styles.input} value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email address</label>
                    <input type="email" required className={styles.input} value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <input type="password" required className={styles.input} value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <input type="password" required className={styles.input} value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} />
                  </div>
                  <button type="submit" disabled={authLoading} className={styles.submitBtn}>
                    {authLoading ? <Loader2 className="animate-spin" size={18} /> : "Create Workspace"}
                  </button>
                  <div className={styles.authFooter}>
                    Already have an account? <button type="button" onClick={() => setAuthMode("login")} className={styles.authLink}>Log in</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
