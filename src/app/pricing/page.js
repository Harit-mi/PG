"use client";

import { useRouter } from "next/navigation";
import FAIcon from "@/components/FAIcon";
import styles from "../page.module.css";

const PLANS = [
  {
    id: "Starter",
    name: "Starter",
    price: "₹1,999",
    desc: "Perfect for single property owners.",
    features: ["Up to 50 Beds", "Tenant Management", "Basic Rent Collection"],
  },
  {
    id: "Pro",
    name: "Professional",
    price: "₹4,999",
    desc: "For growing PG businesses with multiple properties.",
    features: ["Up to 200 Beds", "Automated Rent Reminders", "Complaint Ticketing", "Expense Tracking"],
    isPopular: true,
  },
  {
    id: "Enterprise",
    name: "Enterprise",
    price: "₹14,999",
    desc: "For large operators scaling across cities.",
    features: ["Unlimited Beds", "Multiple Staff Accounts", "Custom Branding", "Priority Support"],
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (plan) => {
    localStorage.setItem("pg_selected_plan", plan);
    router.push("/checkout");
  };

  return (
    <div className={styles.pricingContainer}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Choose your PG Plan
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Select the perfect management plan for your Paying Guest business based on your property size.
        </p>

        <div className={styles.pricingGrid}>
          {PLANS.map((plan) => (
            <div key={plan.id} className={`${styles.pricingCard} ${plan.isPopular ? styles.proCard : ''} glass`}>
              {plan.isPopular && <div className={styles.pricingBadge}>MOST POPULAR</div>}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>{plan.name}</h3>
              <div className="ledger-mono" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: 'var(--foreground)' }}>
                {plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>{plan.desc}</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', alignItems: 'center', color: 'var(--foreground)' }}>
                    <FAIcon icon="check" style={{ color: 'var(--primary)' }} /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`${styles.planButton} ${plan.isPopular ? styles.proButton : ''}`} 
                onClick={() => handleSelectPlan(plan.id)}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
