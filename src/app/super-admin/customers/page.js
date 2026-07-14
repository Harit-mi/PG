import { fetchSuperAdminCustomers } from "../actions";
import CustomersClient from "./CustomersClient";
import { Users } from "lucide-react";

export const revalidate = 0;

export default async function SuperAdminCustomersPage() {
  const res = await fetchSuperAdminCustomers();
  const customers = res.customers || [];

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Customer Organizations</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suspend/activate customer accounts, adjust subscriptions, and audit plan limits.</p>
      </div>

      <CustomersClient initialCustomers={customers} />

    </div>
  );
}
