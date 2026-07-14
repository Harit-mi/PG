import { fetchSuperAdminTickets } from "../actions";
import TicketsClient from "./TicketsClient";

export const revalidate = 0;

export default async function SuperAdminTicketsPage() {
  const res = await fetchSuperAdminTickets();
  const tickets = res.tickets || [];

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Support Ticket Hub</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Respond to PG owner queries, assign SLA priorities, and record internal diagnostic notes.</p>
      </div>

      <TicketsClient initialTickets={tickets} />

    </div>
  );
}
