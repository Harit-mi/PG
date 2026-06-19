"use client";

import { useState } from "react";
import { Building2, Mail, KeyRound } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    setLoading(false);
    
    if (error) {
      alert("Error sending OTP: " + error.message);
    } else {
      setStep(2);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    setLoading(false);

    if (error) {
      alert("Invalid OTP: " + error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className={styles.container}>
      <main className={`${styles.main} glass`}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Building2 size={48} className={styles.logo} />
          </div>
          <h1 className={styles.title}>PG Owner Portal</h1>
          <p className={styles.subtitle}>
            Manage your paying guest properties, tenants, and finances securely.
          </p>
        </div>

        <div className={styles.authContainer}>
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={20} className={styles.inputIcon} />
                  <input 
                    type="email" 
                    placeholder="owner@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className={styles.primaryButton}>
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label>Enter OTP sent to {email}</label>
                <div className={styles.inputWrapper}>
                  <KeyRound size={20} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.authActions}>
                <button type="button" onClick={() => setStep(1)} className={styles.backButton}>
                  Back
                </button>
                <button type="submit" disabled={loading} className={styles.primaryButton}>
                  {loading ? "Verifying..." : "Login securely"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
