import styles from "./page.module.css";
import { AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AddComplaintModal from "@/components/AddComplaintModal";
import TicketCard from "@/components/TicketCard";
import ExportComplaintsExcel from "@/components/ExportComplaintsExcel";

export const revalidate = 0;

export default async function ComplaintsPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;

  let complaintsQuery = supabase
    .from('complaints')
    .select('*, tenants(name, room_number)')
    .order('created_at', { ascending: false });

  let tenantsQuery = supabase.from('tenants').select('id, name, room_number').order('name');

  if (propertyId && propertyId !== 'all') {
    complaintsQuery = complaintsQuery.eq('property_id', propertyId);
    tenantsQuery = tenantsQuery.eq('property_id', propertyId);
  }

  const [{ data: complaints }, { data: tenants }] = await Promise.all([
    complaintsQuery,
    tenantsQuery
  ]);

  const displayComplaints = complaints || [];
  const displayTenants = tenants || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Maintenance & Complaints</h1>
          <p className={styles.subtitle}>Track resident tickets, repairs, and service requests.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <ExportComplaintsExcel complaints={displayComplaints} />
          <AddComplaintModal tenants={displayTenants} propertyId={propertyId} />
        </div>
      </div>

      {displayComplaints.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "3.5rem 2rem", borderRadius: "16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Tickets Found</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
            There are currently no maintenance issues or complaints logged for this property.
          </p>
          <AddComplaintModal tenants={displayTenants} propertyId={propertyId} />
        </div>
      ) : (
        <div className={styles.grid}>
          {displayComplaints.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
