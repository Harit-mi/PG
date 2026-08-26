import styles from "./page.module.css";
import { Search, Phone, MoreVertical } from "lucide-react";
import AddTenantModal from "@/components/AddTenantModal";
import UploadKycModal from "@/components/UploadKycModal";
import TenantProfileButton from "@/components/TenantProfileButton";
import TenantActionMenu from "@/components/TenantActionMenu";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0; // Disable caching

export default async function TenantsPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  let tenantQuery = supabase.from('tenants').select('*').order('name');
  let roomQuery = supabase.from('rooms').select('*');
  
  if (propertyId && propertyId !== 'all') {
    tenantQuery = tenantQuery.eq('property_id', propertyId);
    roomQuery = roomQuery.eq('property_id', propertyId);
  }
  
  const [{ data: tenants }, { data: rooms }] = await Promise.all([tenantQuery, roomQuery]);

  const displayTenants = tenants?.length > 0 ? tenants : [];
  const displayRooms = rooms?.length > 0 ? rooms : [];

  // Calculate occupancy to pass available rooms to the Add Tenant Modal
  const occupancyMap = {};
  displayTenants.forEach(t => {
    if (t.status === 'Active' && t.room_number) {
      occupancyMap[t.room_number] = (occupancyMap[t.room_number] || 0) + 1;
    }
  });

  const availableRooms = displayRooms.filter(r => {
    const occupants = occupancyMap[r.room_number] || 0;
    return occupants < r.capacity;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenant Directory</h1>
          <p className={styles.subtitle}>Manage resident details, leases, and contacts.</p>
        </div>
        <AddTenantModal availableRooms={availableRooms} />
      </div>

      {/* Tenant Search Bar */}
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={18} />
        <input 
          type="text" 
          placeholder="Search by tenant name, room number, or phone..." 
          className={styles.searchInput}
        />
      </div>

      {/* Tenants Table */}
      <div className={`${styles.tableCard} glass`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Room</th>
              <th>Move-in Date</th>
              <th>Status</th>
              <th>Rent / Month</th>
              <th>KYC Document</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <div className={styles.tenantInfo}>
                    <TenantProfileButton tenant={tenant} />
                    <div>
                      <div className={styles.tenantName}>{tenant.name}</div>
                      <div className={styles.tenantPhone}>
                        <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {tenant.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.roomBadge}>Room {tenant.room_number}</span>
                </td>
                <td>{tenant.move_in_date || tenant.joined_date}</td>
                <td>
                  <span className={`${styles.statusPill} ${tenant.status === 'Active' ? styles.active : styles.notice}`}>
                    {tenant.status}
                  </span>
                </td>
                <td style={{ fontWeight: 650 }}>₹{tenant.rent_amount}/mo</td>
                <td>
                  {tenant.kyc_url ? (
                    <a href={tenant.kyc_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                      View KYC Document
                    </a>
                  ) : (
                    <UploadKycModal tenantId={tenant.id} />
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <TenantActionMenu tenant={tenant} availableRooms={availableRooms} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
