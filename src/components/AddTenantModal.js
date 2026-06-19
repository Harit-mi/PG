"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { addTenant } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddTenantModal({ buttonClass }) {
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
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Add New Tenant</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input name="name" required placeholder="e.g. Rahul Sharma" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input name="phone" required placeholder="+91 98765 43210" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Assign Room Number (Optional)</label>
                <input name="room_number" placeholder="105" className={styles.input} />
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
