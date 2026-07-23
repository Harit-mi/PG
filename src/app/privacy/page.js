import Link from "next/link";
import FAIcon from "@/components/FAIcon";

export const metadata = {
  title: "Privacy Policy | OUR-PG Hostel Management SaaS",
  description: "Privacy Policy detailing data processing practices, tenant PII protection, and multi-tenant isolation."
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', color: 'var(--foreground)', lineHeight: '1.7' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
          <FAIcon icon="arrow-left" /> Back to Home
        </Link>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--primary)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Last updated: July 23, 2026</p>
      </div>

      {/* Main Content */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>1. Overview & Data Commitment</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            At <strong>OUR-PG</strong>, we respect the privacy of PG owners, hostel managers, and their residents. This Privacy Policy outlines what information is collected, how it is stored securely, and how tenant personally identifiable information (PII) is protected within our multi-tenant cloud architecture.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>2. Information We Collect & Store</h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
            To operate the hostel management application, the platform stores information entered by PG operators:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>PG Owner & Operator Data:</strong> Business name, owner email address, mobile number, subscription billing history.</li>
            <li><strong>Tenant & Resident Data:</strong> Tenant names, mobile numbers, room allocations, move-in dates, Aadhaar/ID numbers, emergency contact details, workplace details, and rent payment transactions.</li>
            <li><strong>Visitor & Asset Records:</strong> Visitor check-in logs, purpose of visit, room asset inventories, maintenance complaints, and leave requests.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>3. Multi-Tenant Data Isolation & Security</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            All tenant records, transactions, and business logs are protected using Database Row-Level Security (RLS) policies. Data is programmatically isolated by Organization UUIDs so that operators can strictly view and edit only their own property records. Data is encrypted in transit via TLS 1.3 and at rest in our cloud database.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>4. Data Retention & Deletion</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            PG Owners can export resident ledgers and transaction history at any time. When a PG owner requests account deletion or tenant removal, all associated records are permanently purged from active production databases in accordance with our data retention schedules.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>5. Contact Privacy Officer</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            If you have questions regarding data privacy or wish to request data export/deletion, please contact our Privacy Team at <a href="mailto:privacy@pgmanagement.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>privacy@pgmanagement.com</a>.
          </p>
        </section>

      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} OUR-PG Software. All rights reserved. • <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>
      </div>

    </div>
  );
}
