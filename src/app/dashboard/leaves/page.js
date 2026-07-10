import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";
import LeavesClient from "./LeavesClient";
import Link from "next/link";
import { AlertTriangle, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function LeavesPage() {
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
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  // Handle case where 'leaves' table hasn't been created yet on Supabase
  const isTableMissing = leavesError && leavesError.message.includes("relation \"public.leaves\" does not exist");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Leave Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage tenant leaves and view daily meal absences.</p>
        </div>
      </div>

      {isTableMissing ? (
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.05)', 
          border: '1px solid var(--warning)', 
          borderRadius: '16px', 
          padding: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          maxWidth: '800px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--warning)', fontWeight: 700, fontSize: '1.2rem' }}>
            <AlertTriangle size={24} />
            Supabase Table 'leaves' is Missing!
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            To enable Leave Tracking features, you need to create the <code>leaves</code> table in your Supabase database. 
            We have pre-created the migration SQL file for you in the project root.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Terminal size={14} /> Migration Instructions:
            </div>
            <ol style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Open your <strong>Supabase Dashboard</strong>.</li>
              <li>Go to the <strong>SQL Editor</strong> in the left sidebar.</li>
              <li>Click <strong>New query</strong>.</li>
              <li>Open and copy the contents of the file <a href="file:///Users/haritmishra/.gemini/antigravity/scratch/pg-owner-app/update_leaves_schema_july_2026.sql" style={{ color: 'var(--primary)' }}>update_leaves_schema_july_2026.sql</a> in this project directory.</li>
              <li>Paste the code into the SQL editor and click <strong>Run</strong>.</li>
              <li>Refresh this dashboard page!</li>
            </ol>
          </div>
        </div>
      ) : (
        <LeavesClient 
          propertyId={propertyId} 
          initialTenants={tenants || []} 
          initialLeaves={leaves || []} 
        />
      )}

    </div>
  );
}
