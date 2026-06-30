"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import styles from "./Modal.module.css";
import { updateComplaint } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function EditComplaintModal({ ticket, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const result = await updateComplaint(ticket.id, formData);
    
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to update complaint");
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <div className={styles.header}>
          <h2>Edit Complaint</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Issue Title / Description</label>
            <input type="text" name="issue" defaultValue={ticket.issue} required className={styles.input} />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" defaultValue={ticket.category} className={styles.input}>
                <option value="Maintenance">Maintenance</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet">Internet</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select name="priority" defaultValue={ticket.priority} className={styles.input}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Status</label>
            <select name="status" defaultValue={ticket.status} className={styles.input}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
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
