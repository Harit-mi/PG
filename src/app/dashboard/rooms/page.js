import styles from "./page.module.css";
import { Plus, User } from "lucide-react";

export default function RoomsPage() {
  // Mock Data for UI prototype
  const rooms = [
    { id: 101, type: "Single", rent: 8000, status: "Occupied", tenants: 1, capacity: 1 },
    { id: 102, type: "Double", rent: 6000, status: "Partially Occupied", tenants: 1, capacity: 2 },
    { id: 103, type: "Triple", rent: 5000, status: "Vacant", tenants: 0, capacity: 3 },
    { id: 104, type: "Double", rent: 6000, status: "Occupied", tenants: 2, capacity: 2 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Room Management</h1>
          <p className={styles.subtitle}>Manage your PG rooms and occupancy.</p>
        </div>
        <button className={styles.addButton}>
          <Plus size={20} /> Add Room
        </button>
      </div>

      <div className={styles.grid}>
        {rooms.map((room) => (
          <div key={room.id} className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.roomNumber}>Room {room.id}</h2>
              <span className={`${styles.badge} ${styles[room.status.replace(" ", "")]}`}>
                {room.status}
              </span>
            </div>
            
            <div className={styles.details}>
              <p><strong>Type:</strong> {room.type}</p>
              <p><strong>Rent:</strong> ₹{room.rent}/mo</p>
            </div>

            <div className={styles.occupancy}>
              <div className={styles.occupancyBar}>
                <div 
                  className={styles.occupancyFill} 
                  style={{ width: `${(room.tenants / room.capacity) * 100}%` }}
                ></div>
              </div>
              <p className={styles.occupancyText}>
                <User size={14} /> {room.tenants} / {room.capacity} Tenants
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
