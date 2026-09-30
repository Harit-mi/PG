"use client";

import { useRouter } from "next/navigation";
import FAIcon from "@/components/FAIcon";
import styles from "../page.module.css";

const PLANS = [
  {
    id: "Monthly",
    name: "Monthly Plan",
    price: "₹499",
    period: "/mo",
    desc: "Complete PG management suite with month-to-month flexibility.",
    features: [
      "All Features Included",
      "Unlimited Rooms & Tenants",
      "Automated WhatsApp Rent Reminders",
      "Resident Self-Service Portal",
      "Kitchen Meal & Leaves Tracker",
      "Visitor Passes & Maintenance Desk"
    ],
  },
  {
    id: "Yearly",
    name: "Yearly Plan (Entire Year)",
    price: "₹4,499",
    period: "/year",
    desc: "Best value package — get 12 months access and save ~25% off monthly pricing.",
    features: [
      "Everything in Monthly Plan",
      "Full 12 Months Access (~₹375/mo)",
      "Multi-Outlet PG Management",
      "Priority WhatsApp & Phone Support",
      "Free Data Import & Setup Help",
      "Free Future Updates & Features"
    ],
    isPopular: true,
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
                {plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>{plan.period}</span>
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
