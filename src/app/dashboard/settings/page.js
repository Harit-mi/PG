import styles from "./page.module.css";
import { Check, CreditCard, Shield, User, ExternalLink, Building2, ArrowRight } from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";
import VideoGuideButton from "@/components/VideoGuideButton";
import PaymentMethodsManager from "@/components/PaymentMethodsManager";
import RoomTypesManager from "@/components/RoomTypesManager";
import CopyablePortalLink from "@/components/CopyablePortalLink";
import { getPaymentMethods, getRoomTypes } from "@/app/actions";
import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: initialMethods } = await getPaymentMethods();
  const { data: initialRoomTypes } = await getRoomTypes();

  const cookieStore = await cookies();
  const propertyId = cookieStore.get("activePropertyId")?.value;

  let activeProperty = null;
  if (propertyId && propertyId !== 'all') {
    const { data } = await supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single();
    activeProperty = data;
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Settings & Billing</h1>
          <p className={styles.subtitle}>Manage your account and subscription plan.</p>
        </div>
        <VideoGuideButton section="Settings" />
      </div>

      <div className={styles.content}>
        {/* SaaS Outlets Control Link */}
        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <Building2 size={20} className={styles.icon} />
            <h2>Outlet & Subscription Management</h2>
          </div>
          <p className={styles.textMuted} style={{ marginBottom: '1rem' }}>
            Review, cancel, deactivate, and reactivate individual Paying Guest property locations and their associated subscription periods.
          </p>
          <a 
            href="/dashboard/settings/outlets" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '8px 18px', 
              borderRadius: '99px', 
              fontWeight: 600, 
              textDecoration: 'none', 
              fontSize: '0.85rem' 
            }}
          >
            Manage Outlets <ArrowRight size={14} />
          </a>
        </section>
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

        {/* Tenant Portals */}
        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <ExternalLink size={20} className={styles.icon} />
            <h2>Tenant Portal URLs</h2>
          </div>
          {activeProperty ? (
            <div>
              <p className={styles.textMuted} style={{ marginBottom: '1rem' }}>
                Share these outlet-specific links with the residents of <strong>{activeProperty.name}</strong>. They can verify their identity using their registered mobile number.
              </p>
              <CopyablePortalLink 
                label="Main Tenant Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal`} 
              />
              <CopyablePortalLink 
                label="Tenant Leave Request Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=leave`} 
              />
              <CopyablePortalLink 
                label="Tenant Rent & Invoices Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=payments`} 
              />
              <CopyablePortalLink 
                label="Tenant Visitor Gate-Pass Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=visitor`} 
              />
              <CopyablePortalLink 
                label="Tenant Complaint Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=complaint`} 
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>Please select a specific property from the sidebar to view tenant portal links.</p>
            </div>
          )}
        </section>

        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <Shield size={20} className={styles.icon} />
            <h2>Subscription Plans</h2>
          </div>
          <p className={styles.planDesc}>Upgrade your PG management subscription. Choose between monthly flexibility or annual savings.</p>
          
          <div className={styles.pricingGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* Monthly Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.planName}>Monthly Plan</h3>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>499</span>
                <span className={styles.period}>/month</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Full access billed month-to-month. Cancel anytime.
              </p>
              <ul className={styles.features}>
                <li><Check size={16} className={styles.check} /> Unlimited Rooms & Tenants</li>
                <li><Check size={16} className={styles.check} /> Kitchen & Leave Tracker</li>
                <li><Check size={16} className={styles.check} /> 1-Click WhatsApp Dues Alerts</li>
                <li><Check size={16} className={styles.check} /> Resident Self-Service Portal</li>
                <li><Check size={16} className={styles.check} /> Visitor Passes & Complaints Desk</li>
                <li><Check size={16} className={styles.check} /> Standard Email & Chat Support</li>
              </ul>
              <CheckoutButton planName="Monthly Plan" price={499} buttonClass={`${styles.planBtn} ${styles.btnPrimary}`} />
            </div>

            {/* Annual Plan (Entire Year) */}
            <div className={`${styles.pricingCard} ${styles.popular}`}>
              <div className={styles.popularBadge}>Best Value • Save 25%</div>
              <h3 className={styles.planName}>Yearly Plan</h3>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>4,499</span>
                <span className={styles.period}>/entire year</span>
              </div>
              <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Just ~₹375/month • Pay once for all 12 months
              </p>
              <ul className={styles.features}>
                <li><Check size={16} className={styles.check} /> <strong>Everything in Monthly Plan</strong></li>
                <li><Check size={16} className={styles.check} /> Full 12 Months Continuous Access</li>
                <li><Check size={16} className={styles.check} /> Multi-Outlet Support</li>
                <li><Check size={16} className={styles.check} /> Priority WhatsApp & Call Support</li>
                <li><Check size={16} className={styles.check} /> Free Data Import & Onboarding Assist</li>
                <li><Check size={16} className={styles.check} /> Free Access to Upcoming Updates</li>
              </ul>
              <CheckoutButton planName="Yearly Plan" price={4499} buttonClass={`${styles.planBtn} ${styles.btnPrimary}`} />
            </div>
          </div>
        </section>

        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <CreditCard size={20} className={styles.icon} />
            <h2>Payment Methods</h2>
          </div>
          <p className={styles.textMuted}>Manage how your tenants can pay you.</p>
          <PaymentMethodsManager initialMethods={initialMethods || []} />
        </section>

        <section className={`${styles.section} glass`}>
          <div className={styles.sectionHeader}>
            <Shield size={20} className={styles.icon} />
            <h2>Legal & Privacy Agreements</h2>
          </div>
          <p className={styles.textMuted}>Review terms of service, data processor responsibilities, and tenant privacy commitments.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a 
              href="/terms" 
              target="_blank"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '99px', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}
            >
              Terms of Service ↗
            </a>
            <a 
              href="/privacy" 
              target="_blank"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '99px', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}
            >
              Privacy Policy ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
