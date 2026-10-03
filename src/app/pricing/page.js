"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "@/app/page.module.css";
import MarketingNavbar from "@/components/MarketingNavbar";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  const features = [
    "Unlimited active beds",
    "Multi-branch dashboard",
    "WhatsApp rent reminders",
    "Automated UPI reconciliation",
    "Visual floor plan & drag-and-drop",
    "Digital KYC onboarding",
    "Unlimited Manager accounts",
    "Expense tracking & P&L reports",
    "Tenant Copilot AI"
  ];

  const monthlyPrice = 499;
  const yearlyPrice = 4499;

  return (
    <div className={styles.container}>
      <MarketingNavbar />
      
      <main className={styles.hero} style={{ paddingBottom: '2rem' }}>
        <div className={styles.badge}>Fair & Transparent</div>
        <h1 className={styles.title} style={{ fontSize: '3rem' }}>
          One simple plan. Unlimited access.
        </h1>
        <p className={styles.subtitle}>
          No complex tiers. No hidden fees. Get access to all features to manage your entire PG operation seamlessly.
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--surface)',
          padding: '0.5rem',
          borderRadius: '99px',
          border: '1px solid var(--border)',
          marginTop: '1rem'
        }}>
          <button 
            onClick={() => setIsYearly(false)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '99px',
              border: 'none',
              background: !isYearly ? 'var(--foreground)' : 'transparent',
              color: !isYearly ? 'var(--background)' : 'var(--text-muted)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '99px',
              border: 'none',
              background: isYearly ? 'var(--foreground)' : 'transparent',
              color: isYearly ? 'var(--background)' : 'var(--text-muted)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Yearly
            <span style={{
              background: isYearly ? 'var(--background)' : 'var(--surface-muted)',
              color: isYearly ? 'var(--foreground)' : 'var(--text-muted)',
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
              fontWeight: '600'
            }}>SAVE 25%</span>
          </button>
        </div>
      </main>

      <section style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem 8rem', width: '100%' }}>
        <div style={{ 
          background: 'var(--surface)', 
          padding: '3rem 2.5rem', 
          borderRadius: '24px', 
          border: '2px solid var(--border)',
          boxShadow: 'var(--cst-shadow-hover)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>StayOS Pro</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Everything you need to run your business</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              ₹{isYearly ? yearlyPrice.toLocaleString() : monthlyPrice}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {isYearly ? '/year' : '/month'}
            </span>
            {isYearly && (
              <div style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.5rem' }}>
                (Equivalent to ₹{Math.round(yearlyPrice / 12)}/month)
              </div>
            )}
          </div>
          
          <button className={styles.btnPrimary} style={{ width: '100%', marginBottom: '3rem', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px' }}>
            Start your free 14-day trial
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {features.map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '1rem', color: 'var(--foreground)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
