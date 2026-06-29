"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addRoomType, deleteRoomType } from "@/app/actions";
import styles from "./Modal.module.css";

export default function RoomTypesManager({ initialRoomTypes }) {
  const [types, setTypes] = useState(initialRoomTypes || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    // Optimistic UI update
    const newType = {
      id: Date.now().toString(),
      name: formData.get("name"),
      default_capacity: parseInt(formData.get("default_capacity")),
      default_rent: parseInt(formData.get("default_rent")),
      is_optimistic: true
    };
    
    setTypes([...types, newType]);
    
    const res = await addRoomType(formData);
    setLoading(false);
    
    if (res.success) {
      setShowAddForm(false);
      // Let server revalidation handle fetching real ID later
    } else {
      alert("Failed to add room type");
      setTypes(types.filter(t => t.id !== newType.id));
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteRoomType(id);
    if (res.success) {
      setTypes(types.filter(t => t.id !== id));
    } else {
      alert("Failed to delete room type");
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.list}>
        {types.length === 0 ? (
          <p className={styles.emptyState}>No custom room types configured.</p>
        ) : (
          types.map((t) => (
            <div key={t.id} className={styles.methodCard} style={{ opacity: t.is_optimistic ? 0.7 : 1 }}>
              <div className={styles.methodInfo}>
                <div className={styles.methodHeader}>
                  <span className={styles.methodType}>{t.name}</span>
                </div>
                <div className={styles.methodDetails}>
                  Capacity: {t.default_capacity} | Rent: ₹{t.default_rent}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(t.id)} 
                className={styles.deleteBtn}
                disabled={t.is_optimistic}
                title="Delete Room Type"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {!showAddForm ? (
        <button onClick={() => setShowAddForm(true)} className={styles.addBtn}>
          <Plus size={16} /> Add Room Type
        </button>
      ) : (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <div className={styles.formGroup}>
            <label>Room Type Name</label>
            <input name="name" required placeholder="e.g. Single AC, Premium Double" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Default Capacity (Persons)</label>
            <input name="default_capacity" type="number" min="1" required placeholder="e.g. 2" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Default Rent Per Bed (₹)</label>
            <input name="default_rent" type="number" required placeholder="e.g. 12000" className={styles.input} />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
