"use client";

import { useState } from "react";
import { Check, X, Upload } from "lucide-react";
import { updateTransactionStatus } from "@/app/actions";
import { supabase } from "@/utils/supabase";
import styles from "./Modal.module.css";

export default function MarkPaidModal({ transactionId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    let proofUrl = null;
    
    // Simple mock upload or real upload to Supabase storage if configured
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;
        
        // This assumes a 'receipts' bucket exists. If not, it will fail gracefully.
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file);
          
        if (!uploadError) {
          const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
          proofUrl = data.publicUrl;
        } else {
          console.error("Storage upload error:", uploadError);
          // Fallback to local data URL for demo purposes if bucket missing
          proofUrl = URL.createObjectURL(file);
        }
      } catch (err) {
        console.error(err);
      }
    }

    const res = await updateTransactionStatus(transactionId, "Completed", proofUrl);
    setLoading(false);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error || "Failed to mark paid");
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '0.25rem', 
          background: 'var(--success)', color: 'white', border: 'none', 
          padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: '500'
        }}
      >
        <Check size={14} /> Mark Paid
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Verify Payment</h2>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Upload Screenshot/Receipt (Optional)</label>
                <div style={{ 
                  border: '2px dashed var(--border)', padding: '2rem', 
                  borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id={`file-${transactionId}`}
                  />
                  <label htmlFor={`file-${transactionId}`} style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: file ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {file ? file.name : "Click to select file"}
                    </p>
                  </label>
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
