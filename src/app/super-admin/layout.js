"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, ShieldAlert, LogOut, ArrowLeftRight } from "lucide-react";
import styles from "../dashboard/layout.module.css";

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If we're on the login page, no need to check
    if (pathname === "/super-admin/login") {
      setChecking(false);
      return;
    }

    const session = localStorage.getItem("super_admin_session");
    if (!session) {
      router.push("/super-admin/login");
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("super_admin_session");
    router.push("/super-admin/login");
  };

  if (pathname === "/super-admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Validating administration session...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} glass`}>
        <div className={styles.logo}>PG Super Admin</div>
        
        <nav className={styles.nav}>
          <Link href="/super-admin" className={`${styles.navItem} ${pathname === '/super-admin' ? styles.active : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/super-admin/customers" className={`${styles.navItem} ${pathname.startsWith('/super-admin/customers') ? styles.active : ''}`}>
            <Users size={20} /> Customers
          </Link>
          <Link href="/super-admin/tickets" className={`${styles.navItem} ${pathname.startsWith('/super-admin/tickets') ? styles.active : ''}`}>
            <MessageSquare size={20} /> Support Tickets
          </Link>
          <Link href="/super-admin/audits" className={`${styles.navItem} ${pathname.startsWith('/super-admin/audits') ? styles.active : ''}`}>
            <ShieldAlert size={20} /> Audit Logs
          </Link>
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }}></div>

          <Link href="/dashboard" className={styles.navItem} style={{ color: 'var(--accent)' }}>
            <ArrowLeftRight size={20} /> Customer App
          </Link>
          <button 
            onClick={handleLogout} 
            className={styles.navItem} 
            style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: 'var(--danger)' }}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
