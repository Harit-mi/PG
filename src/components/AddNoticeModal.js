"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addNotice } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddNoticeModal({ buttonClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await addNotice(formData);
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
        <Plus size={16} /> New Broadcast
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Broadcast Notice</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Notice Title</label>
                <input name="title" required placeholder="e.g. Scheduled Water Maintenance" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Message Content</label>
                <textarea 
                  name="content" 
                  required 
                  placeholder="Type your message to all tenants here..." 
                  className={styles.input} 
                  rows="4"
                  style={{ resize: "none" }}
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Publishing..." : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
