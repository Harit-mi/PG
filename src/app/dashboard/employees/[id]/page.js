import { supabase } from "@/utils/supabase";
import { notFound } from "next/navigation";
import styles from "../../tenants/page.module.css";
import { ArrowLeft, UserCircle, Briefcase, Phone, MapPin, IndianRupee, Calendar } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function EmployeeProfilePage({ params }) {
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

  const totalPaid = salaryHistory?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return (
    <div className={styles.container}>
      <Link href="/dashboard/employees" className={styles.backBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Employees
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Personal Info */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
          <div style={{ textAlign: 'center' }}>
            <UserCircle size={80} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{employee.name}</h2>
            <span className={`${styles.statusBadge} ${employee.status === 'Active' ? styles.Active : ''}`}>
              {employee.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</p>
                <p style={{ fontWeight: 500 }}>{employee.role}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <IndianRupee size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salary</p>
                <p style={{ fontWeight: 500 }}>₹{employee.salary.toLocaleString()} / mo</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Phone size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</p>
                <p style={{ fontWeight: 500 }}>{employee.phone}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</p>
                <p style={{ fontWeight: 500 }}>{employee.address || 'Not provided'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</p>
                <p style={{ fontWeight: 500 }}>{new Date(employee.joining_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Salary History & Assigned PG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Assignment</h3>
            <p><strong>Property:</strong> {employee.properties?.name || 'Assigned to All PGs'}</p>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Salary History</h3>
              <div style={{ background: 'var(--success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                Total Paid: ₹{totalPaid.toLocaleString()}
              </div>
            </div>

            {salaryHistory?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No salary payments recorded yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.Completed}`}>
                          Paid
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>₹{tx.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
