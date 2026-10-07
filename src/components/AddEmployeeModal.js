"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { addEmployee } from "@/app/actions";
import styles from "./Modal.module.css"; // Reuse existing modal styles

export default function AddEmployeeModal({ buttonClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const res = await addEmployee(formData);
    
    setLoading(false);
    if (res.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert("Failed to add employee: " + res.error);
    }
  };

  return (
    <>
      <button className={buttonClass || styles.primaryTriggerBtn} onClick={() => setIsOpen(true)}>
        <Plus size={18} /> Add Employee
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
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
                  <input name="name" className={styles.input} required autoFocus placeholder="Ramesh Kumar" />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Mobile Number *</label>
                  <input className={styles.input}
                    type="tel"
                    name="phone" 
                    required 
                    placeholder="9876543210" 
                    inputMode="numeric"
                    maxLength={15}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <select name="role" className={styles.input} required>
                    <option value="Manager">Manager</option>
                    <option value="Care Taker">Care Taker</option>
                    <option value="Cook">Cook</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Monthly Salary (₹) *</label>
                  <input name="salary" className={styles.input} type="number" required min="0" placeholder="15000" />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <textarea name="address" className={styles.input} rows="2" placeholder="Permanent address..."></textarea>
                </div>
              
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Aadhar Card (PDF or Photo)</label>
                  <input type="file" name="aadhar_card" accept="image/*,application/pdf" className={styles.input} style={{ background: 'transparent', padding: '0.5rem 0' }} />
                </div>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
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
