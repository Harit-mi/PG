import styles from "./page.module.css";
import { Users, DoorOpen, IndianRupee, BellRing, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
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
          <div className={styles.statValue}>42</div>
          <div className={styles.statTrend} style={{ color: "var(--success)" }}>
            <TrendingUp size={16} /> +2 this month
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
              <DoorOpen size={20} />
            </div>
            <span className={styles.statLabel}>Vacant Rooms</span>
          </div>
          <div className={styles.statValue}>3</div>
          <div className={styles.statTrend} style={{ color: "var(--text-muted)" }}>
            Out of 25 total rooms
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
              <IndianRupee size={20} />
            </div>
            <span className={styles.statLabel}>Rent Collected</span>
          </div>
          <div className={styles.statValue}>₹1,45,000</div>
          <div className={styles.statTrend} style={{ color: "var(--danger)" }}>
            <TrendingDown size={16} /> ₹12,000 pending
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
              <BellRing size={20} />
            </div>
            <span className={styles.statLabel}>Open Complaints</span>
          </div>
          <div className={styles.statValue}>4</div>
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
        
        <div className={`${styles.noticesSection} glass`}>
          <div className={styles.sectionHeader}>
            <h3>Recent Notices</h3>
            <button className={styles.textBtn}>View All</button>
          </div>
          <div className={styles.noticeList}>
            <div className={styles.noticeItem}>
              <h4>Water supply interruption</h4>
              <p>Maintenance work on main tank tomorrow from 10 AM to 2 PM.</p>
              <span className={styles.noticeDate}>Today, 9:00 AM</span>
            </div>
            <div className={styles.noticeItem}>
              <h4>Rent Reminder</h4>
              <p>Please clear pending dues for this month by the 5th.</p>
              <span className={styles.noticeDate}>2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
