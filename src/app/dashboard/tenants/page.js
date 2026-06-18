import styles from "./page.module.css";
import { UserPlus, Search, Phone, MoreVertical } from "lucide-react";

export default function TenantsPage() {
  const tenants = [
    { id: 1, name: "Rahul Sharma", room: "101", phone: "+91 98765 43210", moveIn: "01 Jan 2026", status: "Active" },
    { id: 2, name: "Aman Gupta", room: "102", phone: "+91 87654 32109", moveIn: "15 Feb 2026", status: "Active" },
    { id: 3, name: "Vikram Singh", room: "104", phone: "+91 76543 21098", moveIn: "10 Mar 2026", status: "Active" },
    { id: 4, name: "Sneha Desai", room: "104", phone: "+91 65432 10987", moveIn: "05 Apr 2026", status: "Notice Period" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Management</h1>
          <p className={styles.subtitle}>View and manage all active tenants.</p>
        </div>
        <button className={styles.addButton}>
          <UserPlus size={20} /> Add Tenant
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, room, or phone..." className={styles.searchInput} />
        </div>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Contact</th>
              <th>Move-in Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className={styles.fw600}>{tenant.name}</td>
                <td><span className={styles.roomBadge}>{tenant.room}</span></td>
                <td>
                  <div className={styles.contactCell}>
                    <Phone size={14} className={styles.textMuted} /> {tenant.phone}
                  </div>
                </td>
                <td>{tenant.moveIn}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[tenant.status.replace(" ", "")]}`}>
                    {tenant.status}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
