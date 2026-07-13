import Link from "next/link";
import { LayoutDashboard, Users, DoorOpen, BellRing, Settings, Utensils, FileText, Briefcase, CalendarDays, ChefHat, UserCheck, Package } from "lucide-react";

// Inline Icon component since IndianRupee from lucide needs to be imported separately
function IndianRupeeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>
    </svg>
  );
}
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import styles from "./layout.module.css";
import PropertySelector from "@/components/PropertySelector";

export const revalidate = 0;

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
      <aside className={`${styles.sidebar} glass`} style={{ marginTop: isExpired ? '40px' : '0' }}>
        <div className={styles.logo}>PG Owner</div>
        <PropertySelector />
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navItem}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/dashboard/rooms" className={styles.navItem}>
            <DoorOpen size={20} /> Rooms
          </Link>
          <Link href="/dashboard/tenants" className={styles.navItem}>
            <Users size={20} /> Tenants
          </Link>
          <Link href="/dashboard/leaves" className={styles.navItem}>
            <CalendarDays size={20} /> Leaves
          </Link>
          <Link href="/dashboard/kitchen" className={styles.navItem}>
            <ChefHat size={20} /> Kitchen Board
          </Link>
          <Link href="/dashboard/employees" className={styles.navItem}>
            <Briefcase size={20} /> Employees
          </Link>
          <Link href="/dashboard/finances" className={styles.navItem}>
            <IndianRupeeIcon size={20} /> Finances
          </Link>
          <Link href="/dashboard/complaints" className={styles.navItem}>
            <BellRing size={20} /> Complaints
          </Link>
          <Link href="/dashboard/menu" className={styles.navItem}>
            <Utensils size={20} /> Food Menu
          </Link>
          <Link href="/dashboard/dues" className={styles.navItem}>
            <FileText size={20} /> Pending Dues
          </Link>
          <Link href="/dashboard/visitors" className={styles.navItem}>
            <UserCheck size={20} /> Visitor Logs
          </Link>
          <Link href="/dashboard/assets" className={styles.navItem}>
            <Package size={20} /> Room Assets
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>
      <main className={styles.mainContent} style={{ marginTop: isExpired ? '40px' : '0' }}>
        {children}
      </main>
    </div>
  );
}
