"use client";

import { useState } from "react";
import { UserCheck, Check, X, ShieldAlert, LogIn, LogOut, Calendar } from "lucide-react";
import { updateVisitorStatus } from "@/app/actions";

export default function VisitorsClient({ initialVisitors = [], initialTenants = [] }) {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [loadingId, setLoadingId] = useState(null);

  const getTenantName = (tenantId) => {
    const tenant = initialTenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.name} (Room ${tenant.room_number || "N/A"})` : "Unknown Resident";
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

  // Group visitors
  const pendingRequests = visitors.filter(v => v.status === 'Requested');
  const activePasses = visitors.filter(v => v.status === 'Approved' || v.status === 'Checked In');
  const pastVisits = visitors.filter(v => v.status === 'Rejected' || v.status === 'Checked Out');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
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
