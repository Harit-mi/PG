import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import LeavesClient from "./LeavesClient";
import Link from "next/link";
import { AlertTriangle, Terminal } from "lucide-react";
import AddLeaveModal from "@/components/AddLeaveModal";

export const revalidate = 0;

export default async function LeavesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const propertyId = cookieStore.get("activePropertyId")?.value;

  if (!propertyId || propertyId === 'all') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Leave Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Please select a specific property from the sidebar to manage leave logs.</p>
      </div>
    );
  }

  // Fetch tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, name, room_number')
    .eq('property_id', propertyId)
    .eq('status', 'Active');

  // Fetch leaves
  const { data: leaves, error: leavesError } = await supabase
    .from('leaves')
    .select('*, tenants(name, room_number)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  const isTableMissing = leavesError && leavesError.message.includes("relation \"public.leaves\" does not exist");

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.25rem' }}>Tenant Leave Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log upcoming tenant absences and calculate meal reductions.</p>
        </div>
        {!isTableMissing && (
          <AddLeaveModal tenants={tenants || []} propertyId={propertyId} />
        )}
      </div>

      {isTableMissing ? (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#B45309', fontWeight: 600, fontSize: '1.1rem' }}>
            <AlertTriangle size={24} />
            <span>Database Setup Required</span>
          </div>
          <p style={{ color: '#92400E', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
            The <strong>leaves</strong> table is not present in your Supabase database. Run the SQL schema setup script in your Supabase SQL Editor.
          </p>
        </div>
      ) : (
        <LeavesClient 
          tenants={tenants || []} 
          leaves={leaves || []} 
          propertyId={propertyId} 
        />
      )}
    </div>
  );
}
