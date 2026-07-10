"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { submitLeaveRequest } from "@/app/actions";

export default function LeaveSection({ propertyId, tenants = [], leaves = [] }) {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Find selected tenant room
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const roomNumber = selectedTenant ? selectedTenant.room_number : "";

  // Filter leaves for active tenant status tracker
  const tenantLeaves = leaves.filter(l => l.tenant_id === selectedTenantId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setMessage({ type: "error", text: "Please select your name." });
      return;
    }
    if (!startDate || !endDate) {
      setMessage({ type: "error", text: "Please enter start and end dates." });
      return;
    }
    if (startDate > endDate) {
      setMessage({ type: "error", text: "Start date cannot be after end date." });
      return;
    }
    if (!breakfast && !lunch && !dinner) {
      setMessage({ type: "error", text: "Please select at least one meal to miss." });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Please provide a reason for leave." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await submitLeaveRequest(
        propertyId,
        selectedTenantId,
        startDate,
        endDate,
        breakfast,
        lunch,
        dinner,
        reason
      );

      if (res.success) {
        setMessage({ type: "success", text: "Leave request submitted successfully. Waiting for owner approval!" });
        setStartDate("");
        setEndDate("");
        setReason("");
      } else {
        setMessage({ type: "error", text: res.error || "Failed to submit request." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "A connection error occurred. Make sure table 'leaves' exists." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
      
      {/* Leave Request Form */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 Submit Leave / Absence
        </h3>

        {message && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem', 
            fontSize: '0.85rem',
            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
            color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Your Name</label>
            <select 
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
            >
              <option value="" disabled style={{ background: '#1e293b' }}>Choose your name...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#1e293b' }}>
                  {t.name} (Room {t.room_number || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {roomNumber && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Room Number</label>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Room {roomNumber}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Meals to Skip</label>
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Reason for Leave</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
              placeholder="e.g., Going home for weekend"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', resize: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Calendar size={18} /> {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </div>

      {/* Leave Status Tracker */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
          ⏱️ My Active Leaves
        </h3>
        
        {!selectedTenantId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
            Select your name on the left form to load your leave requests history.
          </div>
        ) : tenantLeaves.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
            No leave requests found for this name.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '380px', paddingRight: '4px' }}>
            {tenantLeaves.map(leave => {
              const meals = [];
              if (leave.breakfast) meals.push("Breakfast");
              if (leave.lunch) meals.push("Lunch");
              if (leave.dinner) meals.push("Dinner");

              let statusColor = "var(--warning)";
              let statusIcon = <Clock size={14} />;
              if (leave.status === "Approved") {
                statusColor = "var(--success)";
                statusIcon = <CheckCircle2 size={14} />;
              } else if (leave.status === "Rejected") {
                statusColor = "var(--danger)";
                statusIcon = <XCircle size={14} />;
              }

              return (
                <div key={leave.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </span>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: statusColor,
                      textTransform: 'uppercase'
                    }}>
                      {statusIcon} {leave.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span><strong>Skip Meals:</strong> {meals.join(", ") || "None"}</span>
                    <span><strong>Reason:</strong> {leave.reason}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
