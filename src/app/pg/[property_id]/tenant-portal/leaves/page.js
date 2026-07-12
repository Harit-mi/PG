"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { verifyTenantByPhone, submitLeaveRequest } from "@/app/actions";
import { Calendar, CheckCircle2, AlertCircle, XCircle, Clock, Smartphone, LogOut } from "lucide-react";

export default function TenantLeavesPage() {
  const params = useParams();
  const propertyId = params.property_id;

  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedTenant, setVerifiedTenant] = useState(null);
  const [leavesHistory, setLeavesHistory] = useState([]);
  
  // Leave Form Fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Restore session from localStorage if exists
  useEffect(() => {
    const savedTenant = localStorage.getItem(`verified_tenant_${propertyId}`);
    if (savedTenant) {
      const parsed = JSON.parse(savedTenant);
      setVerifiedTenant(parsed);
      fetchLeavesHistory(parsed.id);
    }
  }, [propertyId]);

  const fetchLeavesHistory = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setLeavesHistory(data);
      }
    } catch (err) {
      console.error("Error fetching leaves history:", err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setVerifying(true);
    setMessage(null);

    try {
      const res = await verifyTenantByPhone(propertyId, phone);
      if (res.success && res.tenant) {
        setVerifiedTenant(res.tenant);
        localStorage.setItem(`verified_tenant_${propertyId}`, JSON.stringify(res.tenant));
        fetchLeavesHistory(res.tenant.id);
      } else {
        setMessage({ type: "error", text: res.error || "Verification failed." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    setVerifiedTenant(null);
    setLeavesHistory([]);
    setMessage(null);
    localStorage.removeItem(`verified_tenant_${propertyId}`);
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!verifiedTenant) return;
    
    if (!startDate || !endDate) {
      setMessage({ type: "error", text: "Please select start and end dates." });
      return;
    }
    if (startDate > endDate) {
      setMessage({ type: "error", text: "Start date cannot be after end date." });
      return;
    }
    if (!breakfast && !lunch && !dinner) {
      setMessage({ type: "error", text: "Please select at least one meal to skip." });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Please provide a reason for leave." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await submitLeaveRequest(
        propertyId,
        verifiedTenant.id,
        startDate,
        endDate,
        breakfast,
        lunch,
        dinner,
        reason
      );

      if (res.success) {
        setMessage({ type: "success", text: "Leave request submitted successfully!" });
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchLeavesHistory(verifiedTenant.id);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to submit request." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Absence / Leave Submission
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Schedule skipped meals and notify PG kitchen
        </p>
      </div>

      {message && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* STEP 1: Phone Verification */}
      {!verifiedTenant ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <Smartphone size={32} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Identity Verification</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Enter your registered mobile number to proceed
              </p>
            </div>
            
            <input 
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '1px' }}
            />

            <button 
              type="submit" 
              disabled={verifying}
              style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: verifying ? 0.7 : 1 }}
            >
              {verifying ? "Verifying..." : "Verify Mobile Number"}
            </button>
          </form>
        </div>
      ) : (
        /* STEP 2: Submission Form */
        <>
          {/* Welcome User Card */}
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome,</p>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--success)' }}>{verifiedTenant.name}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room {verifiedTenant.room_number || "N/A"}</p>
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
              title="Change User"
            >
              <LogOut size={14} /> Reset
            </button>
          </div>

          {/* Leave Form */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>START DATE</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>END DATE</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MEALS TO MISS</label>
                <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} />
                    Breakfast
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={lunch} onChange={(e) => setLunch(e.target.checked)} />
                    Lunch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={dinner} onChange={(e) => setDinner(e.target.checked)} />
                    Dinner
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>REASON FOR LEAVE</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. Going out of town"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem', resize: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: submitting ? 0.7 : 1 }}
              >
                <Calendar size={16} /> {submitting ? "Submitting..." : "Submit Leave"}
              </button>
            </form>
          </div>

          {/* Leave History List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0', fontWeight: 600 }}>⏱️ Your Leave History</h3>
            
            {leavesHistory.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No leave requests found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {leavesHistory.map(leave => {
                  const meals = [];
                  if (leave.breakfast) meals.push("Breakfast");
                  if (leave.lunch) meals.push("Lunch");
                  if (leave.dinner) meals.push("Dinner");

                  let statusColor = "var(--warning)";
                  let statusIcon = <Clock size={12} />;
                  if (leave.status === "Approved") {
                    statusColor = "var(--success)";
                    statusIcon = <CheckCircle2 size={12} />;
                  } else if (leave.status === "Rejected") {
                    statusColor = "var(--danger)";
                    statusIcon = <XCircle size={12} />;
                  }

                  return (
                    <div key={leave.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>
                          {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: statusColor, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {statusIcon} {leave.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <div>Skip: {meals.join(", ") || "None"}</div>
                        <div>Reason: {leave.reason}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
