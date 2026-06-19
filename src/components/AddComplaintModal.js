"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addComplaint } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddComplaintModal({ buttonClass, tenants }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await addComplaint(formData);
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
        <Plus size={18} /> New Ticket
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Log Complaint/Request</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Select Tenant</label>
                <select name="tenant_id" required className={styles.input}>
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Room {t.room_number})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Issue Description</label>
                <input name="issue" required placeholder="e.g. AC not cooling" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select name="category" className={styles.input}>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Internet">Internet</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Priority</label>
                <select name="priority" className={styles.input}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
