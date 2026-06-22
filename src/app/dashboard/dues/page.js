import styles from "./page.module.css";
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import { CheckCircle, Clock } from "lucide-react";
import MarkPaidModal from "@/components/MarkPaidModal";

export const revalidate = 0;

export default async function DuesPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  // Fetch pending dues
  let query = supabase
    .from('transactions')
    .select('*, tenants(name, phone, room_number)')
    .eq('status', 'Pending')
    .eq('type', 'Income')
    .order('date', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data: pendingDues, error } = await query;
  
  if (error) console.error("Error fetching dues:", error);

  const dues = pendingDues || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pending Dues</h1>
          <p className={styles.subtitle}>Collect outstanding payments from tenants.</p>
        </div>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        {dues.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle size={48} style={{ margin: "0 auto 1rem", color: "var(--success)" }} />
            <h3>All Caught Up!</h3>
            <p>There are no pending dues at the moment.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due) => {
                const tenant = due.tenants || {};
                // Pre-fill WhatsApp message
                const upiId = "yourname@upi"; // This could be fetched from Owner profile in Phase 5
                const message = `Hi ${tenant.name}, a gentle reminder that your rent of ₹${due.amount} for this month is pending. Please pay via UPI to: ${upiId}.`;
                const whatsappUrl = `https://wa.me/${tenant.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

                return (
                  <tr key={due.id}>
                    <td className={styles.fw600}>{tenant.name || 'Unknown'}</td>
                    <td><span className={styles.roomBadge}>{tenant.room_number || 'N/A'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} style={{ color: 'var(--warning)' }} />
                        {new Date(due.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ color: 'var(--danger)', fontWeight: '600' }}>₹{due.amount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <a 
                          href={whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.waBtn}
                        >
                          Request via WA
                        </a>
                        <MarkPaidModal transactionId={due.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
