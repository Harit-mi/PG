"use client";

import { useState } from "react";
import { UserCheck, Check, X, ShieldAlert, LogIn, LogOut, Calendar, Plus, Trash2 } from "lucide-react";
import { updateVisitorStatus, addVisitor, deleteVisitor } from "@/app/actions";
import styles from "@/components/Modal.module.css";

export default function VisitorsClient({ 
  propertyId, 
  initialVisitors = [], 
  initialTenants = [], 
  visitors: propVisitors = [], 
  tenants: propTenants = [] 
}) {
  const allTenants = initialTenants && initialTenants.length > 0 ? initialTenants : propTenants;
  const allVisitors = initialVisitors && initialVisitors.length > 0 ? initialVisitors : propVisitors;

  const [visitors, setVisitors] = useState(allVisitors);
  const [loadingId, setLoadingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const getTenantName = (tenantId) => {
    const tenant = allTenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.name} (Room ${tenant.room_number || "N/A"})` : "Visitor / Guest";
  };

  const handleStatusChange = async (visitorId, newStatus) => {
    setLoadingId(visitorId);
    try {
      const res = await updateVisitorStatus(visitorId, newStatus);
      if (res.success) {
        setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: newStatus } : v));
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("A connection error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (!confirm("Are you sure you want to delete this visitor record?")) return;
    setLoadingId(visitorId);
    try {
      const res = await deleteVisitor(visitorId);
      if (res.success) {
        setVisitors(prev => prev.filter(v => v.id !== visitorId));
      } else {
        alert(res.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete visitor record.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    const formData = new FormData(e.target);
    try {
      const res = await addVisitor(formData);
      setAddLoading(false);
      if (res.success) {
        setIsAddModalOpen(false);
        window.location.reload();
      } else {
        alert(res.error || "Failed to add visitor");
      }
    } catch (err) {
      setAddLoading(false);
      console.error(err);
      alert("Error adding visitor entry.");
    }
  };

  // Group visitors
  const pendingRequests = visitors.filter(v => v.status === 'Requested');
  const activePasses = visitors.filter(v => v.status === 'Approved' || v.status === 'Checked In');
  const pastVisits = visitors.filter(v => v.status === 'Rejected' || v.status === 'Checked Out');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: 'var(--primary, #1e4877)',
            color: 'white',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(30, 72, 119, 0.25)'
          }}
        >
          <Plus size={18} /> Log Visitor / Gate Entry
        </button>
      </div>

      {/* Add Visitor Modal */}
      {isAddModalOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2>Log Visitor Entry</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Visitor Full Name *</label>
                <input name="name" required placeholder="e.g. Ramesh Patel" className={styles.input} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Visitor Phone *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="9876543210" 
                    className={styles.input} 
                    inputMode="numeric"
                    maxLength={15}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Relationship</label>
                  <select name="relationship" className={styles.input}>
                    <option value="Friend">Friend</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Contractor">Contractor / Technician</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Host Resident (Visiting)</label>
                <select name="tenant_id" className={styles.input}>
                  <option value="">-- Guest / Unlinked --</option>
                  {allTenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Room {t.room_number || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Visit Date</label>
                  <input 
                    type="date" 
                    name="visit_date" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    className={styles.input} 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Initial Status</label>
                  <select name="status" defaultValue="Checked In" className={styles.input}>
                    <option value="Checked In">Checked In</option>
                    <option value="Approved">Approved Pass</option>
                    <option value="Requested">Requested</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Purpose of Visit</label>
                <input name="purpose" placeholder="e.g. Study, Family visit, Parcel" className={styles.input} required />
              </div>

              <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} className={styles.submitBtn}>
                  {addLoading ? "Saving Entry..." : "Save Visitor Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Pending Requests Table */}
      <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
          ⏳ Pending Gate-Pass Requests
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.9rem' }}>
            No pending visitor requests to review.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-teal)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Visitor Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Host Resident</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Visit Date</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Purpose</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{v.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ph: {v.phone} ({v.relationship})</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{getTenantName(v.tenant_id)}</td>
                    <td style={{ padding: '1rem' }} className="ledger-mono">{new Date(v.visit_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>{v.purpose}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          disabled={loadingId === v.id}
                          onClick={() => handleStatusChange(v.id, 'Approved')}
                          style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          disabled={loadingId === v.id}
                          onClick={() => handleStatusChange(v.id, 'Rejected')}
                          style={{ background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Passes / Checked In Table */}
      <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
          🟢 Active Gate Passes & Checked-In Guests
        </h3>
        
        {activePasses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.9rem' }}>
            No active visitor passes at the moment.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-teal)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Visitor Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Host Resident</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Pass Date</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)', textAlign: 'right' }}>Clearance Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePasses.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{v.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ph: {v.phone} ({v.relationship})</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{getTenantName(v.tenant_id)}</td>
                    <td style={{ padding: '1rem' }} className="ledger-mono">{new Date(v.visit_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: 'rgba(185, 141, 62, 0.15)',
                        color: 'var(--brass)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {v.status === 'Approved' && (
                        <button 
                          disabled={loadingId === v.id}
                          onClick={() => handleStatusChange(v.id, 'Checked In')}
                          style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <LogIn size={14} /> Check-In
                        </button>
                      )}
                      {v.status === 'Checked In' && (
                        <button 
                          disabled={loadingId === v.id}
                          onClick={() => handleStatusChange(v.id, 'Checked Out')}
                          style={{ background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <LogOut size={14} /> Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Passes */}
      <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', marginTop: 0 }}>
          📋 Historical Visitor Logs
        </h3>
        
        {pastVisits.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.9rem' }}>
            No past logs available.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-teal)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Visitor Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Host Resident</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Visit Date</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Purpose</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastVisits.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{v.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ph: {v.phone} ({v.relationship})</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{getTenantName(v.tenant_id)}</td>
                    <td style={{ padding: '1rem' }} className="ledger-mono">{new Date(v.visit_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.purpose}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: v.status === 'Checked Out' ? 'rgba(46, 82, 102, 0.1)' : 'rgba(193, 68, 30, 0.1)',
                        color: v.status === 'Checked Out' ? 'var(--slate-teal)' : 'var(--rust)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        disabled={loadingId === v.id}
                        onClick={() => handleDeleteVisitor(v.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger, #dc2626)', cursor: 'pointer', padding: '6px' }}
                        title="Delete Visitor Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
