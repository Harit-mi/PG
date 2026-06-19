import Link from "next/link";
import { LayoutDashboard, Users, DoorOpen, BellRing, Settings } from "lucide-react";

// Inline Icon component since IndianRupee from lucide needs to be imported separately
function IndianRupeeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>
    </svg>
  );
}
import styles from "./layout.module.css";
import PropertySelector from "@/components/PropertySelector";

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} glass`}>
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
          <Link href="/dashboard/finances" className={styles.navItem}>
            <IndianRupeeIcon size={20} /> Finances
          </Link>
          <Link href="/dashboard/complaints" className={styles.navItem}>
            <BellRing size={20} /> Complaints
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
