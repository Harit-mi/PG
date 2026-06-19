"use client";

import { useState } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import styles from "./Modal.module.css";

export default function UploadKycModal({ tenantId, tenantName, existingUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const router = useRouter();

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenantId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      // 3. Update Tenant record
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ document_url: publicUrl })
        .eq('id', tenantId);

      if (updateError) throw updateError;

      setIsOpen(false);
      setFile(null);
      router.refresh(); // Refresh server component data
    } catch (error) {
      alert("Error uploading document: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          backgroundColor: existingUrl ? 'var(--success)' : 'var(--surface)',
          color: existingUrl ? 'white' : 'var(--foreground)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.875rem'
        }}
      >
        {existingUrl ? <CheckCircle2 size={16} /> : <Upload size={16} />}
        {existingUrl ? "View/Update KYC" : "Upload KYC"}
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>KYC Document: {tenantName}</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className={styles.form}>
              
              {existingUrl && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '8px' }}>This tenant already has a document on file.</p>
                  <a 
                    href={existingUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600' }}
                  >
                    <FileText size={16} /> View Current Document
                  </a>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Upload New ID Proof (PDF, JPG, PNG)</label>
                <input 
                  type="file" 
                  accept=".pdf,image/png,image/jpeg"
                  required={!existingUrl}
                  onChange={(e) => setFile(e.target.files[0])}
                  className={styles.input} 
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || (!file && !existingUrl)} className={styles.submitBtn}>
                  {loading ? "Uploading..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
