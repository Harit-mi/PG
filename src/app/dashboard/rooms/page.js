import styles from "./page.module.css";
import { User } from "lucide-react";
import AddRoomModal from "@/components/AddRoomModal";

import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // Disable caching for now so data is always fresh

export default async function RoomsPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  let query = supabase.from('rooms').select('*').order('room_number');
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  const { data: rooms, error } = await query;

  if (error) {
    console.error("Error fetching rooms:", error);
  }

  // Fallback if empty
  const displayRooms = rooms?.length > 0 ? rooms : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Room Management</h1>
          <p className={styles.subtitle}>Manage your PG rooms and occupancy.</p>
        </div>
        <AddRoomModal buttonClass={styles.addButton} />
      </div>

      <div className={styles.grid}>
        {displayRooms.length === 0 ? (
          <p className={styles.textMuted}>No rooms found. Add a room to get started.</p>
        ) : (
          displayRooms.map((room) => (
            <div key={room.id} className={`${styles.card} glass`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.roomNumber}>Room {room.room_number}</h2>
                <span className={`${styles.badge} ${styles[room.status.replace(" ", "")]}`}>
                  {room.status}
                </span>
              </div>
            
              <div className={styles.details}>
                <p><strong>Type:</strong> {room.type}</p>
                <p><strong>Rent:</strong> ₹{room.rent_amount}/mo</p>
              </div>

              <div className={styles.occupancy}>
                <div className={styles.occupancyBar}>
                  <div 
                    className={styles.occupancyFill} 
                    style={{ width: `${(0 / room.capacity) * 100}%` }}
                  ></div>
                </div>
                <p className={styles.occupancyText}>
                  <User size={14} /> 0 / {room.capacity} Tenants
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
