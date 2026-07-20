"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FAIcon from "./FAIcon";
import styles from "@/app/dashboard/layout.module.css";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "chart-pie" },
    { href: "/dashboard/room-board", label: "Room Board", icon: "key" },
    { href: "/dashboard/rooms", label: "Rooms", icon: "door-open" },
    { href: "/dashboard/tenants", label: "Tenants", icon: "users" },
    { href: "/dashboard/leaves", label: "Leaves", icon: "calendar-days" },
    { href: "/dashboard/kitchen", label: "Kitchen Board", icon: "kitchen-set" },
    { href: "/dashboard/employees", label: "Employees", icon: "briefcase" },
    { href: "/dashboard/finances", label: "Finances", icon: "indian-rupee-sign" },
    { href: "/dashboard/complaints", label: "Complaints", icon: "bell" },
    { href: "/dashboard/menu", label: "Food Menu", icon: "utensils" },
    { href: "/dashboard/dues", label: "Pending Dues", icon: "file-invoice-dollar" },
    { href: "/dashboard/visitors", label: "Visitor Logs", icon: "user-check" },
    { href: "/dashboard/assets", label: "Room Assets", icon: "box" },
    { href: "/dashboard/settings", label: "Settings", icon: "gear" },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
          >
            <FAIcon icon={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
