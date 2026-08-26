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

      <div className={styles.grid}>
        {displayComplaints.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
