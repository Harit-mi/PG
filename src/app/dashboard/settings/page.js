import styles from "./page.module.css";
import { Check, CreditCard, Shield, User, ExternalLink, Building2, ArrowRight } from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";
import PaymentMethodsManager from "@/components/PaymentMethodsManager";
import RoomTypesManager from "@/components/RoomTypesManager";
import CopyablePortalLink from "@/components/CopyablePortalLink";
import { getPaymentMethods, getRoomTypes } from "@/app/actions";
import { cookies, headers } from "next/headers";
import { supabase } from "@/utils/supabase";

export default async function SettingsPage() {
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
      <div className={styles.header}>
        <h1 className={styles.title}>Settings & Billing</h1>
        <p className={styles.subtitle}>Manage your account and subscription plan.</p>
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
                label="Tenant Leave Request Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal/leaves`} 
              />
              <CopyablePortalLink 
                label="Tenant Rent & Invoices Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal/rent`} 
              />
              <CopyablePortalLink 
                label="Tenant Visitor Gate-Pass Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal/visitors`} 
              />
              <CopyablePortalLink 
                label="Tenant Complaint Portal" 
                url={`${baseUrl}/pg/${propertyId}/tenant-portal/complaints`} 
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
              <CheckoutButton planName="Growth" price={699} buttonClass={`${styles.planBtn} ${styles.btnPrimary}`} />
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
              <CheckoutButton planName="Pro" price={1499} buttonClass={`${styles.planBtn} ${styles.btnOutline}`} />
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
