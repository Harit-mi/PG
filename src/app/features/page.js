import { CheckCircle2 } from "lucide-react";
import styles from "@/app/page.module.css";
import MarketingNavbar from "@/components/MarketingNavbar";

export const metadata = {
  title: "Features | PGPlus",
  description: "Explore all the features PGPlus offers for PG owners and managers.",
};

export default function FeaturesPage() {
  const allFeatures = [
    {
      title: "WhatsApp Rent Reminders",
      description: "Automated, branded rent reminders via WhatsApp Business API. Tenants can pay in 1-click via GPay, PhonePe, or Paytm."
    },
    {
      title: "Automated UPI Reconciliation",
      description: "Stop manually matching bank screenshots. PGPlus automatically detects and marks rent payments as paid."
    },
    {
      title: "Visual Floor Plans",
      description: "A drag-and-drop 2D layout of your PG. See empty beds, upcoming checkouts, and maintenance issues at a glance."
    },
    {
      title: "Multi-Branch Management",
      description: "Manage 5 or 50 buildings from a single login. Consolidated financial reporting across all your properties."
    },
    {
      title: "Tenant Copilot AI",
      description: "Use Gemini AI to instantly draft polite notices, resolve disputes, or analyze monthly revenue metrics."
    },
    {
      title: "Digital KYC & Onboarding",
      description: "Tenants upload their Aadhaar and sign agreements digitally before moving in. Fully paperless."
    },
    {
      title: "Expense Tracking",
      description: "Log daily expenses like groceries, wifi, and electricity. PGPlus calculates your true net profit per bed."
    },
    {
      title: "Staff Accounts & Roles",
      description: "Give your manager restricted access. They can assign beds and log expenses, but cannot view your total revenue."
    }
  ];

  return (
    <div className={styles.container}>
      <MarketingNavbar />
      
      <main className={styles.hero} style={{ paddingBottom: '3rem' }}>
        <div className={styles.badge}>Everything you need</div>
        <h1 className={styles.title} style={{ fontSize: '3rem' }}>
          Built for scale. Designed for simplicity.
        </h1>
        <p className={styles.subtitle}>
          Stop juggling WhatsApp groups, Excel sheets, and paper registers. 
          PGPlus brings your entire operation into one clean interface.
        </p>
      </main>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {allFeatures.map((f, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={24} color="var(--primary)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '600' }}>{f.title}</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {f.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
