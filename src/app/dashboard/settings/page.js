import styles from "./page.module.css";
import { Check, CreditCard, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings & Billing</h1>
        <p className={styles.subtitle}>Manage your account and subscription plan.</p>
      </div>

      <div className={styles.content}>
        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <User size={20} className={styles.icon} />
            <h2>Profile Settings</h2>
          </div>
          <div className={styles.formGroup}>
            <label>Owner Name</label>
            <input type="text" value="Harit Mishra" readOnly className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Registered Phone Number</label>
            <input type="text" value="+91 98765 43210" readOnly className={styles.input} />
          </div>
        </section>

        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <Shield size={20} className={styles.icon} />
            <h2>Subscription Plans</h2>
          </div>
          <p className={styles.planDesc}>You are currently on the <strong>Free Trial</strong>. Upgrade to manage more PG properties and tenants.</p>
          
          <div className={styles.pricingGrid}>
            {/* Starter Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.planName}>Starter</h3>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>299</span>
                <span className={styles.period}>/mo</span>
              </div>
              <ul className={styles.features}>
                <li><Check size={16} className={styles.check} /> 1 PG Property</li>
                <li><Check size={16} className={styles.check} /> Up to 20 Tenants</li>
                <li><Check size={16} className={styles.check} /> Basic Reporting</li>
                <li><Check size={16} className={styles.check} /> Email Support</li>
              </ul>
              <button className={`${styles.planBtn} ${styles.btnPrimary}`}>Upgrade to Starter</button>
            </div>

            {/* Growth Plan */}
            <div className={`${styles.pricingCard} ${styles.popular}`}>
              <div className={styles.popularBadge}>Most Popular</div>
              <h3 className={styles.planName}>Growth</h3>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>699</span>
                <span className={styles.period}>/mo</span>
              </div>
              <ul className={styles.features}>
                <li><Check size={16} className={styles.check} /> Up to 3 PG Properties</li>
                <li><Check size={16} className={styles.check} /> Up to 60 Tenants</li>
                <li><Check size={16} className={styles.check} /> WhatsApp Reminders</li>
                <li><Check size={16} className={styles.check} /> Priority Support</li>
              </ul>
              <button className={`${styles.planBtn} ${styles.btnPrimary}`}>Upgrade to Growth</button>
            </div>

            {/* Pro Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.planName}>Pro</h3>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>1,499</span>
                <span className={styles.period}>/mo</span>
              </div>
              <ul className={styles.features}>
                <li><Check size={16} className={styles.check} /> Unlimited Properties</li>
                <li><Check size={16} className={styles.check} /> Unlimited Tenants</li>
                <li><Check size={16} className={styles.check} /> Automated Billing</li>
                <li><Check size={16} className={styles.check} /> 24/7 Phone Support</li>
              </ul>
              <button className={`${styles.planBtn} ${styles.btnOutline}`}>Upgrade to Pro</button>
            </div>
          </div>
        </section>

        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <CreditCard size={20} className={styles.icon} />
            <h2>Payment Methods</h2>
          </div>
          <p className={styles.textMuted}>Payments are securely processed by Razorpay.</p>
          <button className={`${styles.actionBtn} ${styles.btnOutline}`}>Add Payment Method</button>
        </section>
      </div>
    </div>
  );
}
