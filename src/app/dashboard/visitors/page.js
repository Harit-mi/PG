import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import VisitorsClient from "./VisitorsClient";
import { AlertTriangle, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function VisitorsPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const propertyId = cookieStore.get("activePropertyId")?.value;

  if (!propertyId || propertyId === 'all') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Visitor & Gate-Pass Log</h1>
        <p style={{ color: 'var(--text-muted)' }}>Please select a specific property from the sidebar to manage visitor logs.</p>
      </div>
    );
  }

  // Fetch visitors
  const { data: visitors, error: visitorsError } = await supabase
    .from('visitors')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  // Fetch active tenants for visitor registration modal
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, room_number')
    .eq('property_id', propertyId)
    .eq('status', 'Active');

  const isTableMissing = visitorsError && visitorsError.message.includes("relation \"public.visitors\" does not exist");

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.25rem' }}>Visitor & Gate-Pass Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time entry/exit logs for guests, contractors, and delivery personnel.</p>
      </div>

      {isTableMissing ? (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#B45309', fontWeight: 600, fontSize: '1.1rem' }}>
            <AlertTriangle size={24} />
            <span>Database Setup Required</span>
          </div>
          <p style={{ color: '#92400E', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
            The <strong>visitors</strong> table is not present in your Supabase database. Run the SQL schema setup script in your Supabase SQL Editor.
          </p>
        </div>
      ) : (
        <VisitorsClient 
          visitors={visitors || []} 
          tenants={tenants || []} 
          propertyId={propertyId} 
        />
      )}
    </div>
  );
}
