"use client";

import { useState } from "react";
import { Check, X, Trash2, Calendar, FileText, Search, User, Filter, AlertCircle, Sparkles } from "lucide-react";
import { updateLeaveRequestStatus, deleteLeaveRequest } from "@/app/actions";

export default function LeavesClient({ propertyId, initialTenants = [], initialLeaves = [] }) {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Helper to lookup tenant info
  const getTenantInfo = (tenantId) => {
    const tenant = initialTenants.find(t => t.id === tenantId);
    return tenant ? { name: tenant.name, room: tenant.room_number || "N/A" } : { name: "Unknown Resident", room: "N/A" };
  };

  const handleStatusUpdate = async (leaveId, newStatus) => {
    setActionLoadingId(leaveId);
    try {
      const res = await updateLeaveRequestStatus(leaveId, newStatus);
      if (res.success) {
        setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus } : l));
      } else {
        alert(res.error || "Failed to update leave request status.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!confirm("Are you sure you want to delete this leave request record?")) return;
    setActionLoadingId(leaveId);
    try {
      const res = await deleteLeaveRequest(leaveId);
      if (res.success) {
        setLeaves(prev => prev.filter(l => l.id !== leaveId));
      } else {
        alert(res.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filters logic
  const filteredLeaves = leaves.filter(l => {
    const tenant = getTenantInfo(l.tenant_id);
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || l.status === statusFilter;
    const matchesDate = dateFilter === "" || (dateFilter >= l.start_date && dateFilter <= l.end_date);
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Overview metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  
  // Calculate who is currently on leave today (approved leaves overlapping today)
  const activeLeavesToday = leaves.filter(l => l.status === 'Approved' && todayStr >= l.start_date && todayStr <= l.end_date);
  const onLeaveTodayCount = new Set(activeLeavesToday.map(l => l.tenant_id)).size;
  const totalTenantsCount = initialTenants.length;
  const presentTodayCount = Math.max(totalTenantsCount - onLeaveTodayCount, 0);
  const percentPresent = totalTenantsCount > 0 ? Math.round((presentTodayCount / totalTenantsCount) * 100) : 100;

  const pendingLeaves = filteredLeaves.filter(l => l.status === "Pending");
  const processedLeaves = filteredLeaves.filter(l => l.status !== "Pending");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Total Residents</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="ledger-mono">{totalTenantsCount}</div>
        </div>
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Present Today</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brass)' }} className="ledger-mono">{presentTodayCount}</div>
        </div>
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>On Leave Today</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rust)' }} className="ledger-mono">{onLeaveTodayCount}</div>
        </div>
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-teal)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Pending Approvals</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brass)' }} className="ledger-mono">{pendingCount}</div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
          ⏳ Pending Leave Approvals
        </h3>
        
        {pendingLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>
            No pending leave requests to process.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-teal)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Tenant</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Room</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Leave Dates</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Missed Meals</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map(l => {
                  const tenant = getTenantInfo(l.tenant_id);
                  const meals = [];
                  if (l.breakfast) meals.push("B");
                  if (l.lunch) meals.push("L");
                  if (l.dinner) meals.push("D");
                  
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{tenant.name}</td>
                      <td style={{ padding: '1rem' }}>Room {tenant.room}</td>
                      <td style={{ padding: '1rem' }} className="ledger-mono">
                        <div>{new Date(l.start_date).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {new Date(l.end_date).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: 'rgba(46,82,102,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--slate-teal)', fontWeight: 600 }}>
                          {meals.join(" • ") || "None"}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }} title={l.reason}>
                        {l.reason}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            disabled={actionLoadingId === l.id}
                            onClick={() => handleStatusUpdate(l.id, 'Approved')}
                            style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            disabled={actionLoadingId === l.id}
                            onClick={() => handleStatusUpdate(l.id, 'Rejected')}
                            style={{ background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Log with Filters */}
      <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileText size={18} /> Leave Request History
          </h3>
          <button 
            onClick={handleExportCSV}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '99px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-teal)' }} />
            <input 
              type="text"
              placeholder="Search by name or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--chalk)' }}>All Statuses</option>
            <option value="Approved" style={{ background: 'var(--chalk)' }}>Approved</option>
            <option value="Rejected" style={{ background: 'var(--chalk)' }}>Rejected</option>
            <option value="Pending" style={{ background: 'var(--chalk)' }}>Pending</option>
          </select>
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
            title="Filter by date overlapping"
          />
        </div>

        {processedLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>
            No matching leave logs found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-teal)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Tenant</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Room</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Leave Dates</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Absence Meals</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-teal)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedLeaves.map(l => {
                  const tenant = getTenantInfo(l.tenant_id);
                  const meals = [];
                  if (l.breakfast) meals.push("Breakfast");
                  if (l.lunch) meals.push("Lunch");
                  if (l.dinner) meals.push("Dinner");

                  let badgeColor = "rgba(185, 141, 62, 0.15)";
                  let textColor = "var(--brass)";
                  if (l.status === 'Approved') {
                    badgeColor = "rgba(185, 141, 62, 0.15)";
                    textColor = "var(--brass)";
                  } else if (l.status === 'Rejected') {
                    badgeColor = "rgba(193, 68, 30, 0.15)";
                    textColor = "var(--rust)";
                  }

                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{tenant.name}</td>
                      <td style={{ padding: '1rem' }}>Room {tenant.room}</td>
                      <td style={{ padding: '1rem' }} className="ledger-mono">
                        {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {meals.join(", ") || "None"}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{l.reason}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: badgeColor, color: textColor, padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          disabled={actionLoadingId === l.id}
                          onClick={() => handleDelete(l.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--rust)', cursor: 'pointer', padding: '6px' }}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
