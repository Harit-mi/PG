import styles from "./page.module.css";
import { Users, DoorOpen, BellRing, TrendingUp, TrendingDown, Clock } from "lucide-react";
import Link from "next/link";

function IndianRupeeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>
    </svg>
  );
}

import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import AddNoticeModal from "@/components/AddNoticeModal";

export const revalidate = 0;

function withProperty(query, propertyId) {
  if (propertyId && propertyId !== 'all') {
    return query.eq('property_id', propertyId);
  }
  return query;
}

export default async function DashboardPage() {
  const propertyId = (await cookies()).get('activePropertyId')?.value;

  if (!propertyId) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back, Owner!</h1>
          <p className={styles.subtitle}>Please select a property from the sidebar to view metrics.</p>
        </div>
      </div>
    );
  }

  // Fetch real counts and aggregates from Supabase dynamically filtered by property
  const [
    { count: totalTenants }, 
    { count: vacantRooms }, 
    { count: totalRooms }, 
    { count: openComplaints }, 
    { data: transactions }, 
    { data: notices }
  ] = await Promise.all([
    withProperty(supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'Active'), propertyId),
    withProperty(supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Vacant'), propertyId),
    withProperty(supabase.from('rooms').select('*', { count: 'exact', head: true }), propertyId),
    withProperty(supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Open'), propertyId),
    withProperty(supabase.from('transactions').select('amount, type, status, category'), propertyId),
    withProperty(supabase.from('notices').select('*'), propertyId).order('created_at', { ascending: false }).limit(3)
  ]);

  const rentCollected = transactions?.filter(t => t.type === 'Income' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0) || 0;
  
  // Pending Dues Math
  const pendingTransactions = transactions?.filter(t => t.type === 'Income' && t.status === 'Pending') || [];
  const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingTenantsCount = new Set(pendingTransactions.filter(t => t.tenant_id).map(t => t.tenant_id)).size;
  
  // Chart Math
  const totalIncome = transactions?.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const maxVal = Math.max(totalIncome, totalExpense, 1);
  const incomeHeight = `${Math.max((totalIncome / maxVal) * 100, 5)}%`;
  const expenseHeight = `${Math.max((totalExpense / maxVal) * 100, 5)}%`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, Owner!</h1>
        <p className={styles.subtitle}>{propertyId === 'all' ? "Here is the aggregated overview of all your PG properties." : "Here is an overview of your PG property today."}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
              <Users size={20} />
            </div>
            <span className={styles.statLabel}>Total Tenants</span>
          </div>
          <div className={styles.statValue}>{totalTenants || 0}</div>
          <div className={styles.statTrend} style={{ color: "var(--success)" }}>
            Active {propertyId === 'all' ? 'across all properties' : 'in this property'}
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
              <DoorOpen size={20} />
            </div>
            <span className={styles.statLabel}>Vacant Rooms</span>
          </div>
          <div className={styles.statValue}>{vacantRooms || 0}</div>
          <div className={styles.statTrend} style={{ color: "var(--text-muted)" }}>
            Out of {totalRooms || 0} total rooms
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
              <IndianRupeeIcon size={20} />
            </div>
            <span className={styles.statLabel}>Rent Collected</span>
          </div>
          <div className={styles.statValue}>₹{(rentCollected || 0).toLocaleString()}</div>
          <div className={styles.statTrend} style={{ color: "var(--text-muted)" }}>
            All time total collected
          </div>
        </div>

        {/* New Pending Payments Card */}
        <Link href="/dashboard/dues" style={{ textDecoration: 'none' }}>
          <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #f59e0b', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div className={styles.statHeader}>
              <div className={styles.iconWrapper} style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                <Clock size={20} />
              </div>
              <span className={styles.statLabel}>Pending Payments</span>
            </div>
            <div className={styles.statValue} style={{ color: "#d97706" }}>₹{(pendingAmount || 0).toLocaleString()}</div>
            <div className={styles.statTrend} style={{ color: "var(--text-muted)" }}>
              From {pendingTenantsCount} tenants
            </div>
          </div>
        </Link>
      </div>

      <div className={styles.bottomSection}>
        <div className={`${styles.chartSection} glass`}>
          <h3>Income vs Expenses (Actual)</h3>
          <div className={styles.mockChart}>
            <div className={styles.barGroup}>
              <div className={styles.barIncome} style={{ height: incomeHeight }} title={`Income: ₹${totalIncome}`}></div>
              <div className={styles.barExpense} style={{ height: expenseHeight }} title={`Expense: ₹${totalExpense}`}></div>
              <span>Total</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px' }}></div>
              <span>Income: ₹{totalIncome.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '2px' }}></div>
              <span>Expenses: ₹{totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.cardHeader}>
            <h3>Recent Notices</h3>
            {propertyId !== 'all' && <AddNoticeModal buttonClass={styles.addNoticeBtn} />}
          </div>
          <div className={styles.noticesList}>
            {notices && notices.length > 0 ? (
              notices.map(notice => (
                <div key={notice.id} className={styles.noticeItem}>
                  <div className={styles.noticeIcon}>
                    <BellRing size={16} />
                  </div>
                  <div className={styles.noticeContent}>
                    <h4>{notice.title}</h4>
                    <p>{notice.content}</p>
                    <span className={styles.noticeTime}>
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No active notices.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
