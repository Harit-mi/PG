import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import styles from "../../tenants/page.module.css";
import { ArrowLeft, UserCircle, Briefcase, Phone, MapPin, IndianRupee, Calendar } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function EmployeeProfilePage({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch Employee Data
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*, properties(name)')
    .eq('id', id)
    .single();

  if (error || !employee) {
    notFound();
  }

  // Fetch Salary History
  const { data: salaryHistory } = await supabase
    .from('transactions')
    .select('*')
    .eq('employee_id', id)
    .eq('type', 'Expense')
    .eq('category', 'Salary')
    .order('date', { ascending: false });

  const history = salaryHistory || [];

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/dashboard/employees" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Back to Employees
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Profile Card */}
        <div className="glass" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <UserCircle size={64} style={{ color: "var(--primary)", margin: "0 auto 0.5rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>{employee.name}</h2>
            <span className={`${styles.statusPill} ${employee.status === 'Active' ? styles.active : styles.notice}`} style={{ marginTop: "0.5rem", display: "inline-block" }}>
              {employee.status}
            </span>
          </div>

          <div style={{ paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Briefcase size={18} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Role & Designation</div>
                <div style={{ fontWeight: "600" }}>{employee.role}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Phone size={18} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Contact Number</div>
                <div style={{ fontWeight: "600" }}>{employee.phone}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <MapPin size={18} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Assigned Outlet</div>
                <div style={{ fontWeight: "600" }}>{employee.properties?.name || "All Outlets"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <IndianRupee size={18} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Monthly Base Salary</div>
                <div style={{ fontWeight: "700", color: "var(--accent)" }}>₹{employee.salary || 0}/mo</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar size={18} style={{ color: "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Joining Date</div>
                <div style={{ fontWeight: "600" }}>{employee.joining_date || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Ledger */}
        <div className="glass" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Salary Payment History</h3>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date Paid</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>{tx.category}</td>
                    <td>{tx.payment_method || "Bank Transfer"}</td>
                    <td style={{ fontWeight: "700", color: "#EF4444" }}>₹{tx.amount}</td>
                    <td>
                      <span className={`${styles.statusPill} ${styles.active}`}>Paid</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No salary transactions logged for this employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
