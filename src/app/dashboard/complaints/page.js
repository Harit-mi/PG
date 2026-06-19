import styles from "./page.module.css";
import { AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";
import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";
import AddComplaintModal from "@/components/AddComplaintModal";
import TicketCard from "@/components/TicketCard";

export const revalidate = 0;

export default async function ComplaintsPage() {
  const propertyId = cookies().get("propertyId")?.value;

  let complaintsQuery = supabase
    .from('complaints')
    .select('*, tenants(name, room_number)')
    .order('created_at', { ascending: false });

  let tenantsQuery = supabase.from('tenants').select('id, name, room_number').order('name');

  if (propertyId) {
    complaintsQuery = complaintsQuery.eq('property_id', propertyId);
    tenantsQuery = tenantsQuery.eq('property_id', propertyId);
  }

  const { data: complaints, error } = await complaintsQuery;
  const { data: tenants } = await tenantsQuery;

  if (error) {
    console.error("Error fetching complaints:", error);
  }

  const displayComplaints = complaints?.length > 0 ? complaints : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Complaints & Requests</h1>
          <p className={styles.subtitle}>Track and resolve tenant issues.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.filterBtn}>
            <Filter size={18} /> Filter
          </button>
          <AddComplaintModal buttonClass={styles.filterBtn} tenants={tenants || []} />
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {/* Open Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <AlertCircle size={18} className={styles.iconOpen} />
              <h3>Open</h3>
            </div>
            <span className={styles.countBadge}>{displayComplaints.filter(c => c.status === "Open").length}</span>
          </div>
          <div className={styles.ticketList}>
            {displayComplaints.filter(c => c.status === "Open").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <Clock size={18} className={styles.iconProgress} />
              <h3>In Progress</h3>
            </div>
            <span className={styles.countBadge}>{displayComplaints.filter(c => c.status === "In Progress").length}</span>
          </div>
          <div className={styles.ticketList}>
            {displayComplaints.filter(c => c.status === "In Progress").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* Resolved Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <CheckCircle2 size={18} className={styles.iconResolved} />
              <h3>Resolved</h3>
            </div>
            <span className={styles.countBadge}>{displayComplaints.filter(c => c.status === "Resolved").length}</span>
          </div>
          <div className={styles.ticketList}>
            {displayComplaints.filter(c => c.status === "Resolved").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
