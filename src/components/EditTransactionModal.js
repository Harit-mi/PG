"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import styles from "./Modal.module.css";
import { updateTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function EditTransactionModal({ transaction, onClose, onRefresh }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Format dates for input type="date"
  const defaultDate = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "";
  const defaultPaymentDate = transaction.payment_date ? new Date(transaction.payment_date).toISOString().split('T')[0] : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const result = await updateTransaction(transaction.id, formData);
    
    if (result.success) {
      if (onRefresh) onRefresh();
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to update transaction");
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <div className={styles.header}>
          <h2>Edit Transaction</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Amount (₹)</label>
              <input type="number" name="amount" defaultValue={transaction.amount} required min="1" className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Type</label>
              <select name="type" defaultValue={transaction.type} className={styles.input}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" defaultValue={transaction.category} className={styles.input}>
                <option value="Rent">Rent</option>
                <option value="Deposit">Deposit</option>
                <option value="Salary">Salary</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Groceries">Groceries</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Status</label>
              <select name="status" defaultValue={transaction.status} className={styles.input}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Payment Method</label>
              <select name="payment_method" defaultValue={transaction.payment_method || ""} className={styles.input}>
                <option value="">Select method...</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Payment Date</label>
              <input type="date" name="payment_date" defaultValue={defaultPaymentDate || defaultDate} className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" defaultValue={transaction.description} rows="2" className={styles.input}></textarea>
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
