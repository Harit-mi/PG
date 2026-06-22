"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addTransaction } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddTransactionModal({ buttonClass, tenants }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Income");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await addTransaction(formData);
    setLoading(false);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  }

  // Get today's date formatted for the default date input (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        <Plus size={20} /> Add Transaction
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`}>
            <div className={styles.modalHeader}>
              <h2>Log Transaction</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formGroup}>
                <label>Type</label>
                <select 
                  name="type" 
                  className={styles.input} 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Income">Income (Rent, Deposit)</option>
                  <option value="Expense">Expense (Bills, Maintenance)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                {type === "Income" ? (
                  <select name="category" className={styles.input}>
                    <option value="Rent">Rent</option>
                    <option value="Security Deposit">Security Deposit</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <select name="category" className={styles.input}>
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Payroll/Staff Salaries">Payroll/Staff Salaries</option>
                    <option value="Internet">Internet</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              </div>

              {type === "Income" && (
                <div className={styles.formGroup}>
                  <label>Select Tenant (Optional)</label>
                  <select name="tenant_id" className={styles.input}>
                    <option value="">-- No Tenant Associated --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Room {t.room_number})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Amount (₹)</label>
                <input name="amount" type="number" required placeholder="5000" min="1" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Date</label>
                <input name="date" type="date" required defaultValue={today} className={styles.input} />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
