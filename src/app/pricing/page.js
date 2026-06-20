"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import styles from "../page.module.css";

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (plan) => {
    localStorage.setItem("pg_selected_plan", plan);
    router.push("/checkout");
  };

  return (
    <div className={styles.container} style={{ minHeight: '100vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className={styles.title} style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>Choose your PG Plan</h1>
        <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          Select the perfect management plan for your Paying Guest business based on your property size.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Starter Plan */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Starter</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0' }}>₹1,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Perfect for single property owners.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Up to 50 Beds</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Tenant Management</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Basic Rent Collection</li>
            </ul>
            
            <button className={styles.primaryButton} onClick={() => handleSelectPlan('Starter')} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Select Starter</button>
          </div>

          {/* Pro Plan */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid var(--primary)', position: 'relative', transform: 'scale(1.05)', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Professional</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0' }}>₹4,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>For growing PG businesses with multiple properties.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Up to 200 Beds</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Automated Rent Reminders</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> <strong>Complaint Ticketing</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> <strong>Expense Tracking</strong></li>
            </ul>
            
            <button className={styles.primaryButton} onClick={() => handleSelectPlan('Pro')}>Select Professional</button>
          </div>

          {/* Enterprise Plan */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Enterprise</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0' }}>₹14,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>For large operators scaling across cities.</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Unlimited Beds</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Multiple Staff Accounts</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Custom Branding</li>
              <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}><Check size={16} color="var(--primary)" /> Priority Support</li>
            </ul>
            
            <button className={styles.primaryButton} onClick={() => handleSelectPlan('Enterprise')} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Select Enterprise</button>
          </div>
        </div>
      </div>
    </div>
  );
}
