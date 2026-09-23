import styles from "../page.module.css";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import RoomBoard from "@/components/RoomBoard";
import FAIcon from "@/components/FAIcon";

export const revalidate = 0;

function withProperty(query, propertyId) {
  if (propertyId && propertyId !== 'all') {
    return query.eq('property_id', propertyId);
  }
  return query;
}

export default async function RoomBoardPage() {
  const supabase = await createClient();
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

  // Fetch room board data using authenticated server client
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
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumbs}>
            <span>Dashboard</span>
            <span>/</span>
            <span>Room Board</span>
          </div>
          <h1 className={styles.pageTitle}>
            {propertyId === 'all' ? "All Outlets Room Matrix" : "Room Board & Bed Matrix"}
          </h1>
          <p className={styles.pageSubtitle}>
            Interactive floor plan and bed availability matrix. Monitor live occupancy and assign residents.
          </p>
        </div>
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
