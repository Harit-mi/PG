"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addEmployee } from "@/app/actions";
import styles from "./Modal.module.css"; // Reuse existing modal styles

export default function AddEmployeeModal({ buttonClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const res = await addEmployee(formData);
    
    setLoading(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert("Failed to add employee: " + res.error);
    }
  };

  return (
    <>
      <button className={buttonClass} onClick={() => setIsOpen(true)}>
        <Plus size={18} /> Add Employee
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Register New Employee</h2>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input name="name" required placeholder="Ramesh Kumar" />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Mobile Number *</label>
                  <input name="phone" required placeholder="+91 9876543210" />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <select name="role" required>
                    <option value="Manager">Manager</option>
                    <option value="Care Taker">Care Taker</option>
                    <option value="Cook">Cook</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Monthly Salary (₹) *</label>
                  <input name="salary" type="number" required min="0" placeholder="15000" />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <textarea name="address" rows="2" placeholder="Permanent address..."></textarea>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={loading}>
                  {loading ? "Saving..." : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
