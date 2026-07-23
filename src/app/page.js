"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FAIcon from "@/components/FAIcon";
import { supabase } from "@/utils/supabase";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check organization status if organization_id exists in user metadata
      const user = data.user;
      const orgId = user?.user_metadata?.organization_id;

      if (orgId) {
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .select("status")
          .eq("id", orgId)
          .single();

        if (!orgErr && org) {
          if (org.status !== 'Active') {
            await supabase.auth.signOut();
            setError(`Your account status is currently "${org.status}". Access has been restricted. Please contact admin support.`);
            setLoading(false);
            return;
          }
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.ledgerWrapper}>
      <main className={styles.loginCard}>
        {/* Top visual decoration */}
        <div className={styles.topAccentBar}></div>

        <div className={styles.loginContent}>
          {/* Header Branding */}
          <div className={styles.logoHeader}>
            <div className={styles.logoContainer}>
              <FAIcon icon="building" style={{ fontSize: "28px" }} className={styles.logoIcon} />
            </div>
            <h1 className={styles.mainTitle}>OUR-PG</h1>
            <p className={styles.subTitle}>A perfect hostel management software</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className={styles.loginForm}>
            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600, background: 'rgba(230, 43, 57, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(230, 43, 57, 0.15)' }}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Owner Email
              </label>
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com" 
                className={styles.textField}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.fieldLabel}>
                Password
              </label>
              <input 
                id="password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className={styles.textField}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.loginBtn}
            >
              {loading ? (
                <FAIcon icon="spinner fa-spin" />
              ) : (
                <>
                  Login to Dashboard <FAIcon icon="arrow-right" />
                </>
              )}
            </button>
          </form>
          
          <div className={styles.footerNote}>
            <FAIcon icon="key" />
            <span>Secure operator access portal.</span>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
