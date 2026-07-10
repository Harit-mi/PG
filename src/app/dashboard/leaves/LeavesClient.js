"use client";

import { useState } from "react";
import { Check, X, Trash2, Calendar, FileText, Search, User, Filter, AlertCircle } from "lucide-react";
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

  // CSV Export logic
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Resident Name,Room Number,Start Date,End Date,Breakfast Skip,Lunch Skip,Dinner Skip,Reason,Status,Submitted At\n";

    filteredLeaves.forEach(l => {
      const tenant = getTenantInfo(l.tenant_id);
      const row = [
        tenant.name.replace(/,/g, ""),
        tenant.room,
        l.start_date,
        l.end_date,
        l.breakfast ? "Yes" : "No",
        l.lunch ? "Yes" : "No",
        l.dinner ? "Yes" : "No",
        l.reason.replace(/,/g, "").replace(/\n/g, " "),
        l.status,
        new Date(l.created_at).toLocaleString().replace(/,/g, "")
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PG_Leaves_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingLeaves = filteredLeaves.filter(l => l.status === "Pending");
  const processedLeaves = filteredLeaves.filter(l => l.status !== "Pending");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="statCard glass" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Tenants</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalTenantsCount}</div>
        </div>
        <div className="statCard glass" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Present Today</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>{presentTodayCount}</div>
        </div>
        <div className="statCard glass" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>On Leave Today</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>{onLeaveTodayCount}</div>
        </div>
        <div className="statCard glass" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Requests</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{pendingCount}</div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⏳ Pending Leave Approvals
        </h3>
        
        {pendingLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>
            🎉 No pending leave requests to process!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Tenant</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Room</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Leave Dates</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Missed Meals</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
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
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}><strong>{tenant.name}</strong></td>
                      <td style={{ padding: '1rem' }}>Room {tenant.room}</td>
                      <td style={{ padding: '1rem' }}>
                        <div>{new Date(l.start_date).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {new Date(l.end_date).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {meals.join(" • ") || "None"}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.reason}>
                        {l.reason}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            disabled={actionLoadingId === l.id}
                            onClick={() => handleStatusUpdate(l.id, 'Approved')}
                            style={{ background: 'var(--success)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            disabled={actionLoadingId === l.id}
                            onClick={() => handleStatusUpdate(l.id, 'Rejected')}
                            style={{ background: 'var(--danger)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
      <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileText size={18} /> Leave Request History
          </h3>
          <button 
            onClick={handleExportCSV}
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by name or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Statuses</option>
            <option value="Approved" style={{ background: '#1e293b' }}>Approved</option>
            <option value="Rejected" style={{ background: '#1e293b' }}>Rejected</option>
            <option value="Pending" style={{ background: '#1e293b' }}>Pending</option>
          </select>
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
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
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Tenant</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Room</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Leave Dates</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Absence Meals</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedLeaves.map(l => {
                  const tenant = getTenantInfo(l.tenant_id);
                  const meals = [];
                  if (l.breakfast) meals.push("Breakfast");
                  if (l.lunch) meals.push("Lunch");
                  if (l.dinner) meals.push("Dinner");

                  let badgeColor = "rgba(245, 158, 11, 0.15)";
                  let textColor = "var(--warning)";
                  if (l.status === 'Approved') {
                    badgeColor = "rgba(16, 185, 129, 0.15)";
                    textColor = "var(--success)";
                  } else if (l.status === 'Rejected') {
                    badgeColor = "rgba(239, 68, 68, 0.15)";
                    textColor = "var(--danger)";
                  }

                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}><strong>{tenant.name}</strong></td>
                      <td style={{ padding: '1rem' }}>Room {tenant.room}</td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {meals.join(", ") || "None"}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.reason}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: badgeColor, color: textColor, padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          disabled={actionLoadingId === l.id}
                          onClick={() => handleDelete(l.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                          title="Delete Record"
                          className="btn-hover-danger"
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
