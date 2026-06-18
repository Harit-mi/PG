import styles from "./page.module.css";
import { ArrowUpRight, ArrowDownRight, Download, Plus } from "lucide-react";

export default function FinancesPage() {
  const transactions = [
    { id: "TXN001", type: "Income", category: "Rent", amount: 8000, date: "05 Jun 2026", status: "Completed", name: "Rahul Sharma (101)" },
    { id: "TXN002", type: "Expense", category: "Electricity", amount: 2500, date: "04 Jun 2026", status: "Completed", name: "TSEB" },
    { id: "TXN003", type: "Income", category: "Rent", amount: 6000, date: "02 Jun 2026", status: "Completed", name: "Aman Gupta (102)" },
    { id: "TXN004", type: "Expense", category: "Maintenance", amount: 1200, date: "01 Jun 2026", status: "Completed", name: "Plumber" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Finances</h1>
          <p className={styles.subtitle}>Track rent collection and log PG expenses.</p>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.btnOutline}`}>
            <Download size={18} /> Export PDF
          </button>
          <button className={`${styles.actionBtn} ${styles.btnPrimary}`}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} glass`}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
            <ArrowUpRight size={24} />
          </div>
          <div className={styles.cardData}>
            <p className={styles.cardLabel}>Rent Collected</p>
            <h2 className={styles.cardValue}>₹14,000</h2>
            <p className={styles.cardContext}>This Month</p>
          </div>
        </div>

        <div className={`${styles.summaryCard} glass`}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
            <ArrowDownRight size={24} />
          </div>
          <div className={styles.cardData}>
            <p className={styles.cardLabel}>Total Expenses</p>
            <h2 className={styles.cardValue}>₹3,700</h2>
            <p className={styles.cardContext}>This Month</p>
          </div>
        </div>

        <div className={`${styles.summaryCard} glass`}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
            <IndianRupeeIcon size={24} />
          </div>
          <div className={styles.cardData}>
            <p className={styles.cardLabel}>Pending Dues</p>
            <h2 className={styles.cardValue}>₹11,000</h2>
            <p className={styles.cardContext}>Across 2 Tenants</p>
          </div>
        </div>
      </div>

      <div className={`${styles.ledgerContainer} glass`}>
        <div className={styles.ledgerHeader}>
          <h3>Recent Transactions</h3>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className={styles.textMuted}>{txn.id}</td>
                <td>{txn.date}</td>
                <td className={styles.fw600}>{txn.name}</td>
                <td>{txn.category}</td>
                <td className={txn.type === "Income" ? styles.textSuccess : styles.textDanger}>
                  {txn.type === "Income" ? "+" : "-"}₹{txn.amount}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.Completed}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline Icon component since IndianRupee from lucide needs to be imported separately
function IndianRupeeIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>
    </svg>
  );
}
