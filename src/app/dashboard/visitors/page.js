import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";
import VisitorsClient from "./VisitorsClient";
import { AlertTriangle, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function VisitorsPage() {
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

  // Fetch active tenants for host mappings
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, room_number')
    .eq('property_id', propertyId)
    .eq('status', 'Active');

  // Check if visitors table hasn't been created yet
  const isTableMissing = visitorsError && visitorsError.message.includes("relation \"public.visitors\" does not exist");

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Visitor & Gate-Pass Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Approve gate entry passes and track visitor check-in statuses.</p>
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
            Supabase Table 'visitors' is Missing!
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            To enable Visitor Gate-Pass features, you need to run the SQL migration script in your Supabase project. We have pre-created the file for you in the project root.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Terminal size={14} /> Migration Instructions:
            </div>
            <ol style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Open your **Supabase Dashboard**.</li>
              <li>Go to the **SQL Editor** in the left sidebar.</li>
              <li>Click **New query**.</li>
              <li>Open and copy the contents of the file <a href="file:///Users/haritmishra/.gemini/antigravity/scratch/pg-owner-app/update_schema_rent_visitors_assets.sql" style={{ color: 'var(--primary)' }}>update_schema_rent_visitors_assets.sql</a> in this project directory.</li>
              <li>Paste the code into the SQL editor and click **Run**.</li>
              <li>Refresh this page!</li>
            </ol>
          </div>
        </div>
      ) : (
        <VisitorsClient 
          initialVisitors={visitors || []} 
          initialTenants={tenants || []} 
        />
      )}

    </div>
  );
}
