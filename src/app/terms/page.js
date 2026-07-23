import Link from "next/link";
import FAIcon from "@/components/FAIcon";

export const metadata = {
  title: "Terms of Service | OUR-PG Hostel Management SaaS",
  description: "Terms of Service and legal agreement for PG owners using OUR-PG hostel management platform."
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', color: 'var(--foreground)', lineHeight: '1.7' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
          <FAIcon icon="arrow-left" /> Back to Home
        </Link>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--primary)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Last updated: July 23, 2026</p>
      </div>

      {/* Main Content */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>1. Agreement to Terms</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            By accessing or using <strong>OUR-PG</strong> ("Platform", "We", "Us"), provided as a hostel and PG management software platform, you ("Customer", "PG Owner", "Operator") agree to be bound by these Terms of Service. If you are registering an account on behalf of an organization or PG business, you represent that you have authority to bind that entity.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>2. Data Controller vs. Data Processor Roles</h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
            Under applicable data protection frameworks (including the Digital Personal Data Protection Act, 2023):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>PG Owner as Data Controller:</strong> You control the personal data of your residents, tenants, employees, and visitors (such as Aadhaar numbers, phone numbers, rent ledgers, and workplace details). You are responsible for obtaining valid consent from your tenants.</li>
            <li><strong>OUR-PG as Data Processor:</strong> We process resident data solely on your instructions to deliver cloud hostel management services, occupancy tracking, payment accounting, and notification workflows.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>3. Subscriptions & Billing</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Subscriptions are billed on a Monthly or Yearly cycle per active outlet slot. Access remains active according to the selected plan. If a subscription expires or enters Billing Hold, the platform reserves the right to switch access to read-only mode or restrict management tools until renewed.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>4. Acceptable Use & Account Security</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            You are responsible for maintaining the confidentiality of your login credentials. You agree not to attempt unauthorized access to other organizations' data, bypass Row-Level Security controls, or use the platform for unlawful purposes.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>5. Limitation of Liability</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            To the maximum extent permitted by law, OUR-PG shall not be liable for indirect, incidental, or consequential damages resulting from loss of tenant records, payment gateway downtime, or unverified rent collections recorded manually by operators.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>6. Contact Information</h2>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            For legal inquiries, terms compliance, or data processing agreements, contact our support team at <a href="mailto:support@pgmanagement.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@pgmanagement.com</a>.
          </p>
        </section>

      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} OUR-PG Software. All rights reserved. • <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
      </div>

    </div>
  );
}
