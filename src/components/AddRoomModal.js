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
  const [error, setError] = useState(null);

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

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setError(null);
      setSelectedType("");
      setCapacity("");
      setRent("");
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.target;
    const formData = new FormData(form);
    
    const room_number = formData.get("room_number")?.trim();
    const rent_raw = formData.get("rent_per_bed");
    const capacity_raw = formData.get("capacity");

    if (!room_number) {
      setError("Room number is required");
      setLoading(false);
      return;
    }

    const rentVal = Number(rent_raw);
    if (rent_raw === "" || Number.isNaN(rentVal) || rentVal < 0) {
      setError("Valid rent amount is required");
      setLoading(false);
      return;
    }

    const capacityVal = Number(capacity_raw);
    if (capacity_raw === "" || Number.isNaN(capacityVal) || capacityVal <= 0) {
      setError("Valid capacity is required");
      setLoading(false);
      return;
    }

    const res = await addRoom(formData);
    setLoading(false);
    
    if (res.success) {
      form.reset();
      setIsOpen(false);
    } else {
      setError(res.error || "Failed to add room");
    }
  }

  return (
    <>
      <button onClick={() => handleOpenChange(true)} className={buttonClass || styles.primaryTriggerBtn}>
        <Plus size={20} /> Add Room
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Add New Room</h2>
              <button onClick={() => handleOpenChange(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            {error && <div className={styles.errorBanner}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formGroup}>
                <label>Room Number</label>
                <input name="room_number" required autoFocus placeholder="e.g. 105" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Number of Beds</label>
                <input name="type" type="text" required placeholder="e.g. 2" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Capacity (Persons)</label>
                <input name="capacity" type="number" required placeholder="2" min="1" className={styles.input} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Rent Per Person / Head (₹)</label>
                <input name="rent_per_bed" type="number" required placeholder="8000" className={styles.input} value={rent} onChange={(e) => setRent(e.target.value)} />
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
