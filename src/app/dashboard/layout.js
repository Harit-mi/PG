// Next.js layout template for PG Owner dashboard
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import styles from "./layout.module.css";
import PropertySelector from "@/components/PropertySelector";
import SidebarNav from "@/components/SidebarNav";

export const revalidate = 0;

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  let isExpired = false;

  if (propertyId && propertyId !== 'all') {
    const { data: property } = await supabase
      .from("properties")
      .select("subscription_status, expiry_date")
      .eq("id", propertyId)
      .single();

    if (property && (property.subscription_status === 'expired' || (property.expiry_date && new Date(property.expiry_date) < new Date()))) {
      isExpired = true;
    }
  }

  return (
    <div className={styles.layout}>
      {isExpired && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--danger)', color: 'white', textAlign: 'center', padding: '0.5rem', zIndex: 1000, fontWeight: 600 }}>
          Your subscription for this outlet has expired. Access is currently read-only.
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className={styles.mainContent} style={{ paddingTop: isExpired ? '3rem' : '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}
