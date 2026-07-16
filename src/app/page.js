"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Loader2, Key } from "lucide-react";
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
      <main className={styles.loginCard}>
        {/* Top visual decoration */}
        <div className={styles.topAccentBar}></div>

        <div className={styles.loginContent}>
          {/* Header Branding */}
          <div className={styles.logoHeader}>
            <div className={styles.logoContainer}>
              <Building2 size={28} className={styles.logoIcon} />
            </div>
            <h1 className={styles.mainTitle}>OUR-PG</h1>
            <p className={styles.subTitle}>A perfect hostel management software</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Owner Email
              </label>
              <input 
                id="email"
                type="email" 
                required
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
                <Loader2 className="spin" size={18} />
              ) : (
                <>
                  Login to Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className={styles.footerNote}>
            <Key size={12} />
            <span>Secure operator access portal.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
