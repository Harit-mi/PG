"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import styles from "./Modal.module.css";
import { updateTenant } from "@/app/actions";
import { supabase } from "@/utils/supabase";

export default function EditTenantModal({ tenant, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    async function fetchRooms() {
      let query = supabase.from('rooms').select('*').order('room_number');
      if (tenant.property_id) {
        query = query.eq('property_id', tenant.property_id);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching rooms for edit:", error);
      } else if (data) {
        setRooms(data);
      }
    }
    fetchRooms();
  }, [tenant.property_id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const name = formData.get("name")?.trim();
    const phone = formData.get("phone")?.trim();

    if (!name) {
      setError("Tenant name is required.");
      setLoading(false);
      return;
    }
    if (!phone) {
      setError("Phone number is required.");
      setLoading(false);
      return;
    }

    const res = await updateTenant(tenant.id, formData);
    setLoading(false);

    if (res.success) {
      onClose();
      window.location.reload(); // Refresh the list
    } else {
      setError(res.error || "Failed to update tenant details.");
    }
  }

  // Formatting date for defaultValue in input type="date"
  const formattedMoveInDate = tenant.move_in_date 
    ? new Date(tenant.move_in_date).toISOString().split('T')[0]
    : "";

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.modalHeader}>
          <h2>Edit Tenant Details</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" name="name" defaultValue={tenant.name} required className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="text" name="phone" defaultValue={tenant.phone} required className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Room Number</label>
              <select name="room_number" defaultValue={tenant.room_number || ""} className={styles.input}>
                <option value="">-- Unassigned --</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.room_number}>
                    Room {room.room_number} ({room.type})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Blood Group</label>
              <input type="text" name="blood_group" defaultValue={tenant.blood_group || ""} placeholder="e.g. O+" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select name="status" defaultValue={tenant.status || "Active"} className={styles.input}>
                <option value="Active">Active</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Past">Past</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Move-in Date</label>
              <input type="date" name="move_in_date" defaultValue={formattedMoveInDate} className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Permanent Address</label>
            <textarea name="permanent_address" defaultValue={tenant.permanent_address || ""} rows="2" placeholder="Full permanent address" className={styles.input}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label>Father/Mother Name</label>
              <input type="text" name="father_mother_name" defaultValue={tenant.father_mother_name || ""} placeholder="Parent's Name" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Parent Contact Number</label>
              <input type="text" name="parent_contact_number" defaultValue={tenant.parent_contact_number || ""} placeholder="Emergency Contact" className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>College/Workplace Details</label>
            <input type="text" name="workplace_details" defaultValue={tenant.workplace_details || ""} placeholder="e.g. IIT Bombay / TCS" className={styles.input} />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
