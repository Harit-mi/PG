import styles from "./page.module.css";
import { User } from "lucide-react";
import AddRoomModal from "@/components/AddRoomModal";
import { getRoomTypes } from "@/app/actions";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0; // Disable caching for now so data is always fresh

export default async function RoomsPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  let query = supabase.from('rooms').select('*').order('room_number');
  if (propertyId && propertyId !== 'all') {
    query = query.eq('property_id', propertyId);
  }
  
  const [{ data: rooms, error }, roomTypes] = await Promise.all([
    query,
    getRoomTypes()
  ]);

  if (error) {
    console.error("Error fetching rooms:", error);
  }

  const displayRooms = rooms?.length > 0 ? rooms : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Room Management</h1>
          <p className={styles.subtitle}>Manage your PG rooms and occupancy.</p>
        </div>
        <AddRoomModal buttonClass={styles.addButton} roomTypes={roomTypes || []} />
      </div>

      <div className={styles.grid}>
        {displayRooms.map((room) => (
          <div key={room.id} className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.roomNumber}>Room {room.room_number}</h3>
              <span 
                className={`${styles.statusBadge} ${
                  room.status === "Vacant" ? styles.vacant : styles.occupied
                }`}
              >
                {room.status}
              </span>
            </div>
            
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>{room.room_type || room.type}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Capacity:</span>
                <span className={styles.value}>
                  <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {room.capacity} Person(s)
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Rent / Bed:</span>
                <span className={styles.value}>₹{room.rent_per_bed || room.rent_amount}/mo</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.amenities}>
                {room.amenities && Array.isArray(room.amenities) && room.amenities.map((item, idx) => (
                  <span key={idx} className={styles.amenityTag}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
