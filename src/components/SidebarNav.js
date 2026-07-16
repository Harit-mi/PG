"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, DoorOpen, BellRing, Settings, 
  Utensils, FileText, Briefcase, CalendarDays, ChefHat, UserCheck, Package 
} from "lucide-react";
import styles from "@/app/dashboard/layout.module.css";

function IndianRupeeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>
    </svg>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/rooms", label: "Rooms", Icon: DoorOpen },
    { href: "/dashboard/tenants", label: "Tenants", Icon: Users },
    { href: "/dashboard/leaves", label: "Leaves", Icon: CalendarDays },
    { href: "/dashboard/kitchen", label: "Kitchen Board", Icon: ChefHat },
    { href: "/dashboard/employees", label: "Employees", Icon: Briefcase },
    { href: "/dashboard/finances", label: "Finances", Icon: IndianRupeeIcon },
    { href: "/dashboard/complaints", label: "Complaints", Icon: BellRing },
    { href: "/dashboard/menu", label: "Food Menu", Icon: Utensils },
    { href: "/dashboard/dues", label: "Pending Dues", Icon: FileText },
    { href: "/dashboard/visitors", label: "Visitor Logs", Icon: UserCheck },
    { href: "/dashboard/assets", label: "Room Assets", Icon: Package },
    { href: "/dashboard/settings", label: "Settings", Icon: Settings },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.Icon;

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
          >
            <IconComponent size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
