"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { addTenant } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddTenantModal({ buttonClass, availableRooms = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await addTenant(formData);
    setLoading(false);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        <UserPlus size={20} /> Add Tenant
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2>Add New Tenant</h2>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input name="name" required placeholder="e.g. Rahul Sharma" className={styles.input} />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input name="phone" required placeholder="+91 98765 43210" className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                  <label>Assign Room</label>
                  <select name="room_number" className={styles.input}>
                    <option value="">-- Unassigned --</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.room_number}>
                        Room {room.room_number} ({room.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Blood Group</label>
                  <input name="blood_group" placeholder="e.g. O+" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Permanent Address</label>
                <textarea name="permanent_address" placeholder="Full permanent address" className={styles.input} rows="2"></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Father/Mother Name</label>
                  <input name="father_mother_name" placeholder="Parent's Name" className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                  <label>Parent Contact Number</label>
                  <input name="parent_contact_number" placeholder="Emergency Contact" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>College/Workplace Details</label>
                <input name="workplace_details" placeholder="e.g. IIT Bombay / TCS" className={styles.input} />
              </div>

              
              <div className={styles.formGroup} style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                  <input type="checkbox" name="dpdp_consent" required style={{ marginTop: '0.2rem', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>DPDP Act Compliance:</strong> I confirm that I have obtained explicit, clear, and informed consent from this individual to collect and process their digital personal data for the purpose of hostel management, as required by the Digital Personal Data Protection Act, 2023.
                  </span>
                </label>
              </div>

              <div className={styles.actions}>

                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
