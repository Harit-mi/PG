// Next.js layout template for PG Owner dashboard
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import styles from "./layout.module.css";
import PropertySelector from "@/components/PropertySelector";

export const revalidate = 0;

import SidebarNav from "@/components/SidebarNav";

export default async function DashboardLayout({ children }) {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  let isExpired = false;

  if (propertyId) {
    const { data: property } = await supabase
      .from("properties")
      .select("subscription_status, expiry_date")
      .eq("id", propertyId)
      .single();

    if (property && (property.subscription_status === 'expired' || new Date(property.expiry_date) < new Date())) {
      isExpired = true;
    }
  }

  return (
    <div className={styles.layout}>
      {isExpired && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--danger)', color: 'white', textAlign: 'center', padding: '0.5rem', zIndex: 1000, fontWeight: 600 }}>
          Your subscription has expired. The dashboard is now in Read-Only mode. Please renew your plan.
        </div>
      )}
      
      {/* Mobile Top Header */}
      <header className={styles.mobileHeader} style={{ top: isExpired ? '40px' : '0' }}>
        <div className={styles.mobileLogo}>PG Owner</div>
        <PropertySelector />
      </header>

      <aside className={`${styles.sidebar} glass`} style={{ marginTop: isExpired ? '40px' : '0' }}>
        <div className={styles.logo}>PG Owner</div>
        <div className={styles.sidebarSelector}>
          <PropertySelector />
        </div>
        <SidebarNav />
      </aside>
      <main className={styles.mainContent} style={{ marginTop: isExpired ? '100px' : '0' }}>
        {children}
      </main>
    </div>
  );
}
