import { CheckCircle2 } from "lucide-react";
import styles from "@/app/page.module.css";
import MarketingNavbar from "@/components/MarketingNavbar";

export const metadata = {
  title: "Pricing | StayOS",
  description: "Simple, transparent pricing for PG owners of all sizes.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "₹999",
      period: "/month",
      description: "Perfect for a single PG with up to 50 beds.",
      features: [
        "Up to 50 active beds",
        "WhatsApp rent reminders",
        "Visual floor plan",
        "Expense tracking",
        "1 Manager account"
      ]
    },
    {
      name: "Growth",
      price: "₹2,499",
      period: "/month",
      description: "For scaling operators with multiple properties.",
      popular: true,
      features: [
        "Up to 250 active beds",
        "Automated UPI reconciliation",
        "Multi-branch dashboard",
        "Digital KYC onboarding",
        "Up to 3 Manager accounts",
        "Email support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large operators running 250+ beds.",
      features: [
        "Unlimited active beds",
        "Unlimited Manager accounts",
        "Copilot AI (Unlimited queries)",
        "API access & webhooks",
        "Custom branding",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <MarketingNavbar />
      
      <main className={styles.hero} style={{ paddingBottom: '3rem' }}>
        <div className={styles.badge}>Fair & Transparent</div>
        <h1 className={styles.title} style={{ fontSize: '3rem' }}>
          Pricing that scales with you.
        </h1>
        <p className={styles.subtitle}>
          No hidden setup fees. Cancel anytime. Pay only for the beds you actively manage.
        </p>
      </main>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 8rem', display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'stretch' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{ 
            background: 'var(--surface)', 
            padding: '2.5rem 2rem', 
            borderRadius: '16px', 
            border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'var(--background)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                Most Popular
              </div>
            )}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{plan.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '40px' }}>{plan.description}</p>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{plan.price}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{plan.period}</span>
            </div>
            
            <button className={plan.popular ? styles.btnPrimary : styles.btnSecondary} style={{ width: '100%', marginBottom: '2rem', border: plan.popular ? 'none' : '1px solid var(--border)' }}>
              {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--foreground)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
