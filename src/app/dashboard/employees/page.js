import styles from "../tenants/page.module.css";
import { Search, Phone, MoreVertical, Briefcase } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";

export const revalidate = 0;

export default async function EmployeesPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  let employeeQuery = supabase.from('employees').select('*, properties(name)').order('name');
  
  if (propertyId && propertyId !== 'all') {
    employeeQuery = employeeQuery.eq('property_id', propertyId);
  }
  
  const { data: employees, error } = await employeeQuery;

  if (error) {
    console.error("Error fetching employees:", error);
  }

  const displayEmployees = employees?.length > 0 ? employees : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employee Management</h1>
          <p className={styles.subtitle}>Manage staff, salaries, and assignments.</p>
        </div>
        <AddEmployeeModal buttonClass={styles.addButton} />
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, role, or phone..." className={styles.searchInput} />
        </div>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        {displayEmployees.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Briefcase size={48} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.5 }} />
            <p>No employees found. Add staff to get started.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Assigned PG</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className={styles.fw600}>{emp.name}</td>
                  <td><span className={styles.roomBadge}>{emp.role}</span></td>
                  <td>
                    <div className={styles.contactCell}>
                      <Phone size={14} className={styles.textMuted} /> {emp.phone}
                    </div>
                  </td>
                  <td>{emp.properties?.name || 'All PGs'}</td>
                  <td style={{ fontWeight: '600' }}>₹{emp.salary.toLocaleString()}/mo</td>
                  <td>
                    <span className={`${styles.statusBadge} ${emp.status === 'Active' ? styles.Active : styles.NoticePeriod}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link href={`/dashboard/employees/${emp.id}`}>
                        <button className={`${styles.actionBtn} ${styles.btnPrimary}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                          Profile
                        </button>
                      </Link>
                      <button className={styles.actionBtn}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
