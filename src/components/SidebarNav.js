"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  KeyRound, 
  DoorOpen, 
  Users, 
  CalendarRange, 
  ChefHat, 
  Briefcase, 
  IndianRupee, 
  AlertCircle, 
  UtensilsCrossed, 
  Receipt, 
  UserCheck, 
  Boxes, 
  Settings,
  Building2,
  ExternalLink
} from "lucide-react";
import PropertySelector from "./PropertySelector";
import styles from "@/app/dashboard/layout.module.css";

const navGroups = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/room-board", label: "Room Board", icon: KeyRound },
    ]
  },
  {
    title: "Residents & Property",
    items: [
      { href: "/dashboard/rooms", label: "Rooms & Beds", icon: DoorOpen },
      { href: "/dashboard/tenants", label: "Tenant Directory", icon: Users },
      { href: "/dashboard/menu", label: "Food Menu", icon: UtensilsCrossed },
      { href: "/dashboard/kitchen", label: "Kitchen Board", icon: ChefHat },
      { href: "/dashboard/leaves", label: "Leave Requests", icon: CalendarRange },
      { href: "/dashboard/visitors", label: "Visitor Logs", icon: UserCheck },
    ]
  },
  {
    title: "Finance & Admin",
    items: [
      { href: "/dashboard/dues", label: "Pending Dues", icon: Receipt },
      { href: "/dashboard/finances", label: "Finances & P&L", icon: IndianRupee },
      { href: "/dashboard/complaints", label: "Complaints", icon: AlertCircle },
      { href: "/dashboard/employees", label: "Staff & Payroll", icon: Briefcase },
      { href: "/dashboard/assets", label: "Room Assets", icon: Boxes },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  }
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileLogo}>
          <Building2 size={20} />
          <span>OUR-PG</span>
        </div>
        <Link href="/dashboard/settings" style={{ color: "#94A3B8" }} aria-label="Settings">
          <Settings size={20} />
        </Link>
      </header>

      {/* Main Desktop & Mobile Sidebar */}
      <aside className={styles.sidebar}>
        {/* Brand Identity */}
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.brand}>
            <div className={styles.brandIcon}>
              <Building2 size={18} />
            </div>
            <span className={styles.brandText}>OUR-PG</span>
          </Link>
          <span className={styles.brandBadge}>PRO</span>
        </div>

        {/* Property Switcher */}
        <div className={styles.sidebarSelector}>
          <PropertySelector />
        </div>

        {/* Categorized Nav Rail */}
        <nav className={styles.navContainer} aria-label="Dashboard navigation">
          {navGroups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <div className={styles.groupTitle}>{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.activeNavItem : ""}`}
                  >
                    {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Quick Link */}
        <div className={styles.sidebarFooter}>
          <Link 
            href="/pg/demo-123/tenant-portal" 
            target="_blank" 
            className={styles.footerTenantLink}
            title="Preview public tenant portal"
          >
            <span>Tenant Portal</span>
            <ExternalLink size={12} />
          </Link>
          <span style={{ fontSize: "0.7rem", color: "#64748B" }}>v2.4</span>
        </div>
      </aside>
    </>
  );
}
