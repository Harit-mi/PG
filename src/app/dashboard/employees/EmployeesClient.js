"use client";

import { useState } from "react";
import { Search, Phone, Briefcase } from "lucide-react";
import Link from "next/link";
import styles from "../tenants/page.module.css";
import EmployeeActionMenu from "@/components/EmployeeActionMenu";

export default function EmployeesClient({ initialEmployees }) {
  const [searchQuery, setSearchQuery] = useState("");

  const displayEmployees = initialEmployees.filter((emp) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(lowerQuery) ||
      emp.role?.toLowerCase().includes(lowerQuery) ||
      emp.phone?.includes(searchQuery)
    );
  });

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, role, or phone..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        {displayEmployees.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Briefcase size={48} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.5 }} />
            <p>No employees found. {searchQuery ? "Try adjusting your search." : "Add staff to get started."}</p>
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
                      <EmployeeActionMenu employee={emp} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
