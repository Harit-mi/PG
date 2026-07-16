"use client";

import { useState } from "react";
import { Plus, X, CalendarPlus } from "lucide-react";
import { submitLeaveRequest } from "@/app/actions";
import styles from "./Modal.module.css";

export default function AddLeaveModal({ buttonClass, tenants = [], propertyId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);
  const [reason, setReason] = useState("");

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setTenantId("");
      setStartDate("");
      setEndDate("");
      setBreakfast(true);
      setLunch(true);
      setDinner(true);
      setReason("");
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!tenantId) {
      alert("Please select a tenant");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date");
      return;
    }
    if (!breakfast && !lunch && !dinner) {
      alert("Please select at least one meal to skip");
      return;
    }
    if (!reason.trim()) {
      alert("Please enter a reason");
      return;
    }

    setLoading(true);
    const res = await submitLeaveRequest(
      propertyId,
      tenantId,
      startDate,
      endDate,
      breakfast,
      lunch,
      dinner,
      reason.trim()
    );
    setLoading(false);
    
    if (res.success) {
      setIsOpen(false);
      window.location.reload();
    } else {
      alert(res.error || "Failed to submit leave request");
    }
  }

  const defaultButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    backgroundColor: 'var(--brass)',
    color: 'var(--ink-navy)',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontFamily: 'var(--font-fraunces), serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      <button 
        onClick={() => handleOpenChange(true)} 
        className={buttonClass} 
        style={buttonClass ? {} : defaultButtonStyle}
        aria-label="Add leave"
      >
        <CalendarPlus size={20} /> Add Leave
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2>Log Tenant Leave</h2>
              <button type="button" onClick={() => handleOpenChange(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Select Tenant</label>
                <select 
                  value={tenantId} 
                  onChange={(e) => setTenantId(e.target.value)} 
                  className={styles.input} 
                  required
                >
                  <option value="" disabled>Choose a tenant...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Room {t.room_number || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className={styles.input} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className={styles.input} 
                    required 
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Meals to Skip</label>
                <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} />
                    Breakfast
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={lunch} onChange={(e) => setLunch(e.target.checked)} />
                    Lunch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={dinner} onChange={(e) => setDinner(e.target.checked)} />
                    Dinner
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Reason for Leave</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="e.g. Vacation, Visiting family" 
                  className={styles.input} 
                  rows="2"
                  required 
                />
              </div>

              <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => handleOpenChange(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
