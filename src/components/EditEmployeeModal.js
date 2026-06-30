"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import styles from "./Modal.module.css";
import { updateEmployee } from "@/app/actions";

export default function EditEmployeeModal({ employee, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const result = await updateEmployee(employee.id, formData);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to update employee");
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <div className={styles.header}>
          <h2>Edit Employee</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" name="name" defaultValue={employee.name} required className={styles.input} />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="tel" name="phone" defaultValue={employee.phone} required className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Role / Position</label>
              <select name="role" defaultValue={employee.role} className={styles.input}>
                <option value="Manager">Manager</option>
                <option value="Warden">Warden</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Monthly Salary (₹)</label>
              <input type="number" name="salary" defaultValue={employee.salary} required min="0" className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Status</label>
              <select name="status" defaultValue={employee.status} className={styles.input}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Address</label>
            <textarea name="address" defaultValue={employee.address} rows="2" className={styles.input}></textarea>
          </div>

          <div className={styles.footer}>
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
