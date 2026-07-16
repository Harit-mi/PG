import styles from "./page.module.css";
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import RoomBoard from "@/components/RoomBoard";
import { Sparkles, Terminal } from "lucide-react";

export const revalidate = 0;

function withProperty(query, propertyId) {
  if (propertyId && propertyId !== 'all') {
    return query.eq('property_id', propertyId);
  }
  return query;
}

export default async function DashboardPage() {
  const propertyId = (await cookies()).get('activePropertyId')?.value;

  if (!propertyId) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back, Owner!</h1>
          <p className={styles.subtitle}>Please select a property from the sidebar to view metrics.</p>
        </div>
      </div>
    );
  }

  // Fetch all necessary room board data
  const [
    { data: rooms, error: roomsErr },
    { data: tenants, error: tenantsErr },
    { data: transactions, error: txErr },
    { data: visitors, error: visitorsErr }
  ] = await Promise.all([
    withProperty(supabase.from('rooms').select('*').order('room_number'), propertyId),
    withProperty(supabase.from('tenants').select('*'), propertyId),
    withProperty(supabase.from('transactions').select('*'), propertyId),
    withProperty(supabase.from('visitors').select('*'), propertyId)
  ]);

  if (roomsErr) console.error("Error fetching rooms:", roomsErr);
  if (tenantsErr) console.error("Error fetching tenants:", tenantsErr);

  const displayRooms = rooms || [];
  const displayTenants = tenants || [];
  const displayTx = transactions || [];
  const displayVisitors = visitors || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Sparkles size={14} /> Property Key Desk
        </div>
        <h1 className={styles.title}>
          {propertyId === 'all' ? "All PG Properties (Aggregated)" : "Room Board Console"}
        </h1>
        <p className={styles.subtitle}>
          Visual hostel warden key-rack system displaying room occupancies, notice states, and payment alerts.
        </p>
      </div>

      {/* Hero Interactive Room Board */}
      <RoomBoard 
        rooms={displayRooms} 
        tenants={displayTenants} 
        transactions={displayTx} 
        visitors={displayVisitors} 
      />
    </div>
  );
}
