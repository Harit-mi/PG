"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addRoom } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddRoomModal({ buttonClass, roomTypes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rent, setRent] = useState("");

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setSelectedType(val);
    const typeObj = roomTypes.find(t => t.name === val);
    if (typeObj) {
      setCapacity(typeObj.default_capacity.toString());
      setRent(typeObj.default_rent.toString());
    } else {
      // For fallback/static types
      setCapacity("");
      setRent("");
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const formData = new FormData(form);
    const res = await addRoom(formData);
    setLoading(false);
    
    if (res.success) {
      alert("Room added successfully!");
      form.reset();
      setIsOpen(false);
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        <Plus size={20} /> Add Room
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Add New Room</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Room Number</label>
                <input name="room_number" required placeholder="e.g. 105" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Room Type</label>
                <select name="type" className={styles.input} value={selectedType} onChange={handleTypeChange} required>
                  <option value="" disabled>Select a room type...</option>
                  {roomTypes.length > 0 ? (
                    roomTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                    </>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Rent Per Bed (₹)</label>
                <input name="rent_per_bed" type="number" required placeholder="8000" className={styles.input} value={rent} onChange={(e) => setRent(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Capacity (Persons)</label>
                <input name="capacity" type="number" required placeholder="1" min="1" className={styles.input} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
