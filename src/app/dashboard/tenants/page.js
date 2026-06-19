import styles from "./page.module.css";
import { Search, Phone, MoreVertical } from "lucide-react";
import AddTenantModal from "@/components/AddTenantModal";
import UploadKycModal from "@/components/UploadKycModal";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // Disable caching

export default async function TenantsPage() {
  const { data: tenants, error } = await supabase.from('tenants').select('*').order('name');

  if (error) {
    console.error("Error fetching tenants:", error);
  }

  const displayTenants = tenants?.length > 0 ? tenants : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Management</h1>
          <p className={styles.subtitle}>View and manage all active tenants.</p>
        </div>
        <AddTenantModal buttonClass={styles.addButton} />
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, room, or phone..." className={styles.searchInput} />
        </div>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        {displayTenants.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <p>No tenants found. Add a tenant to get started.</p>
          </div>
        ) : (
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
              {displayTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className={styles.fw600}>{tenant.name}</td>
                  <td><span className={styles.roomBadge}>{tenant.room_number || 'Unassigned'}</span></td>
                  <td>
                    <div className={styles.contactCell}>
                      <Phone size={14} className={styles.textMuted} /> {tenant.phone}
                    </div>
                  </td>
                  <td>{new Date(tenant.move_in_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[tenant.status.replace(" ", "")]}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <UploadKycModal 
                        tenantId={tenant.id} 
                        tenantName={tenant.name} 
                        existingUrl={tenant.document_url} 
                      />
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
