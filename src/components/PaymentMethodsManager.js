"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, CreditCard } from "lucide-react";
import { addPaymentMethod, deletePaymentMethod } from "@/app/actions";
import styles from "./Modal.module.css";

export default function PaymentMethodsManager({ initialMethods = [] }) {
  const [methods, setMethods] = useState(initialMethods);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const formData = new FormData(form);
    
    const res = await addPaymentMethod(formData);
    setLoading(false);
    
    if (res.success) {
      alert("Payment method added successfully!");
      form.reset();
      setIsOpen(false);
      window.location.reload(); // Quick way to sync data without deep state management
    } else {
      alert("Error adding method: " + res.error);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    
    const res = await deletePaymentMethod(id);
    if (res.success) {
      setMethods(methods.filter(m => m.id !== id));
    } else {
      alert("Error deleting: " + res.error);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {methods.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No payment methods added yet.</p>
        ) : (
          methods.map(method => (
            <div key={method.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
              border: method.is_default ? '1px solid var(--success)' : '1px solid var(--border)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                  <strong style={{ fontSize: '1.1rem' }}>{method.type}</strong>
                  {method.is_default && (
                    <span style={{ fontSize: '0.75rem', background: 'var(--success)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      Default
                    </span>
                  )}
                </div>
                {method.details && <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>{method.details}</p>}
              </div>
              
              <button 
                onClick={() => handleDelete(method.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                title="Delete Method"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', 
          padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
        }}
      >
        <Plus size={18} /> Add Payment Method
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Add Payment Method</h2>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Method Type</label>
                <select name="type" required className={styles.input}>
                  <option value="UPI">UPI</option>
                  <option value="Bank Account">Bank Account</option>
                  <option value="Cash">Cash</option>
                  <option value="Razorpay Link">Razorpay Link</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Details (UPI ID, Account No, etc.)</label>
                <input 
                  type="text" 
                  name="details" 
                  placeholder="e.g. yourname@upi or Account: 123456789"
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'row' }}>
                <input type="checkbox" name="is_default" id="is_default" style={{ width: 'auto' }} />
                <label htmlFor="is_default" style={{ margin: 0 }}>Set as Default</label>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
