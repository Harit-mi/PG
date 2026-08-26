import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AssetsClient from "./AssetsClient";
import { AlertTriangle, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function AssetsPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const propertyId = cookieStore.get("activePropertyId")?.value;

  if (!propertyId || propertyId === 'all') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Room Assets & Inventory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Please select a specific property from the sidebar to manage room inventories.</p>
      </div>
    );
  }

  // Fetch all rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, room_number')
    .eq('property_id', propertyId)
    .order('room_number');

  // Fetch all assets
  const { data: assets, error: assetsError } = await supabase
    .from('room_assets')
    .select('*')
    .eq('property_id', propertyId);

  const isTableMissing = assetsError && assetsError.message.includes("relation \"public.room_assets\" does not exist");

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.25rem' }}>Room Assets & Inventory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track furniture, appliances, electronics, and physical assets across PG rooms.</p>
      </div>

      {isTableMissing ? (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#B45309', fontWeight: 600, fontSize: '1.1rem' }}>
            <AlertTriangle size={24} />
            <span>Database Setup Required</span>
          </div>
          <p style={{ color: '#92400E', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
            The <strong>room_assets</strong> table is not present in your Supabase database. Run the SQL schema setup script in your Supabase SQL Editor.
          </p>
        </div>
      ) : (
        <AssetsClient 
          rooms={rooms || []} 
          assets={assets || []} 
          propertyId={propertyId} 
        />
      )}
    </div>
  );
}
