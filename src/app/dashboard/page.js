import styles from "./page.module.css";
import { Users, DoorOpen, BellRing, TrendingUp, TrendingDown } from "lucide-react";

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
import AddNoticeModal from "@/components/AddNoticeModal";

export const revalidate = 0; // Disable caching

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

  // Fetch real counts and aggregates from Supabase filtered by property
  const [{ count: totalTenants }, { count: vacantRooms }, { count: totalRooms }, { count: openComplaints }, { data: transactions }, { data: notices }] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'Active').eq('property_id', propertyId),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Vacant').eq('property_id', propertyId),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('property_id', propertyId),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Open').eq('property_id', propertyId),
    supabase.from('transactions').select('amount, type').eq('property_id', propertyId),
    supabase.from('notices').select('*').eq('property_id', propertyId).order('created_at', { ascending: false }).limit(3)
  ]);

  const rentCollected = transactions
    ?.filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, Owner!</h1>
        <p className={styles.subtitle}>Here is an overview of your PG properties today.</p>
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
            Active across all properties
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
            All time total
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
              <BellRing size={20} />
            </div>
            <span className={styles.statLabel}>Open Complaints</span>
          </div>
          <div className={styles.statValue}>{openComplaints || 0}</div>
          <div className={styles.statTrend} style={{ color: "var(--danger)" }}>
            2 require urgent attention
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={`${styles.chartSection} glass`}>
          <h3>Income vs Expenses (Mock)</h3>
          <div className={styles.mockChart}>
            {/* Simple CSS-based mock chart */}
            <div className={styles.barGroup}>
              <div className={styles.barIncome} style={{ height: "80%" }}></div>
              <div className={styles.barExpense} style={{ height: "30%" }}></div>
              <span>Jan</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.barIncome} style={{ height: "90%" }}></div>
              <div className={styles.barExpense} style={{ height: "40%" }}></div>
              <span>Feb</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.barIncome} style={{ height: "85%" }}></div>
              <div className={styles.barExpense} style={{ height: "35%" }}></div>
              <span>Mar</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.barIncome} style={{ height: "100%" }}></div>
              <div className={styles.barExpense} style={{ height: "45%" }}></div>
              <span>Apr</span>
            </div>
          </div>
        </div>
        
        <div className={`${styles.chartCard} glass`}>
          <div className={styles.cardHeader}>
            <h3>Recent Notices</h3>
            <AddNoticeModal buttonClass={styles.addNoticeBtn} />
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
