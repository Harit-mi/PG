import styles from "./page.module.css";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import ExportPdfButton from "@/components/ExportPdfButton";
import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // Disable caching

export default async function FinancesPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;

  let txQuery = supabase
    .from('transactions')
    .select('*, tenants(name, room_number), employees(name, role)')
    .order('date', { ascending: false });

  let tenantsQuery = supabase.from('tenants').select('id, name, room_number').order('name');
  let employeesQuery = supabase.from('employees').select('id, name, role').order('name');

  if (propertyId && propertyId !== 'all') {
    txQuery = txQuery.eq('property_id', propertyId);
    tenantsQuery = tenantsQuery.eq('property_id', propertyId);
    employeesQuery = employeesQuery.eq('property_id', propertyId);
  }

  const { data: transactions, error } = await txQuery;
  const { data: tenants } = await tenantsQuery;
  const { data: employees } = await employeesQuery;

  if (error) {
    console.error("Error fetching transactions:", error);
  }

  const displayTxns = transactions?.length > 0 ? transactions : [];

  let totalIncome = 0;
  let totalExpenses = 0;
  
  displayTxns.forEach(txn => {
    if (txn.type === "Income") totalIncome += txn.amount;
    else if (txn.type === "Expense") totalExpenses += txn.amount;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Finances</h1>
          <p className={styles.subtitle}>Track rent collection and log PG expenses.</p>
        </div>
        <div className={styles.actions}>
          <ExportPdfButton transactions={displayTxns} className={`${styles.actionBtn} ${styles.btnOutline}`} />
          <AddTransactionModal buttonClass={`${styles.actionBtn} ${styles.btnPrimary}`} tenants={tenants || []} employees={employees || []} />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} glass`}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
            <ArrowUpRight size={24} />
          </div>
          <div className={styles.cardData}>
            <p className={styles.cardLabel}>Rent Collected</p>
            <h2 className={styles.cardValue}>₹{totalIncome.toLocaleString()}</h2>
            <p className={styles.cardContext}>All Time</p>
          </div>
        </div>

        <div className={`${styles.summaryCard} glass`}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
            <ArrowDownRight size={24} />
          </div>
          <div className={styles.cardData}>
            <p className={styles.cardLabel}>Total Expenses</p>
            <h2 className={styles.cardValue}>₹{totalExpenses.toLocaleString()}</h2>
            <p className={styles.cardContext}>All Time</p>
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
            {displayTxns.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }} className={styles.textMuted}>
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              displayTxns.map((txn) => (
                <tr key={txn.id}>
                  <td className={styles.textMuted}>{txn.id.substring(0, 8)}</td>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td className={styles.fw600}>
                    {txn.tenants ? `${txn.tenants.name} (${txn.tenants.room_number})` : 
                     txn.employees ? `Salary: ${txn.employees.name}` : 
                     txn.category}
                  </td>
                  <td>{txn.category}</td>
                  <td className={txn.type === "Income" ? styles.textSuccess : styles.textDanger}>
                    {txn.type === "Income" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.Completed}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
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
