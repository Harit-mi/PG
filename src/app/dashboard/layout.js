import Link from "next/link";
import { LayoutDashboard, Users, DoorOpen, IndianRupee, BellRing, Settings } from "lucide-react";
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
            <IndianRupee size={20} /> Finances
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
