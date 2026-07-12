"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { verifyTenantByPhone, submitVerifiedComplaint } from "@/app/actions";
import { checkComplaintStatus } from "../actions";
import { Send, Search, CheckCircle2, AlertCircle, Smartphone, LogOut, ShieldAlert, Clock, CheckCircle } from "lucide-react";

export default function TenantComplaintsPage() {
  const params = useParams();
  const propertyId = params.property_id;

  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedTenant, setVerifiedTenant] = useState(null);
  
  // Complaint Form Fields
  const [category, setCategory] = useState("Plumbing");
  const [issue, setIssue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [message, setMessage] = useState(null);

  // Status Search Fields
  const [searchId, setSearchId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [searchingStatus, setSearchingStatus] = useState(false);

  // Restore session from localStorage if exists
  useEffect(() => {
    const savedTenant = localStorage.getItem(`verified_tenant_${propertyId}`);
    if (savedTenant) {
      setVerifiedTenant(JSON.parse(savedTenant));
    }
  }, [propertyId]);

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
    setMessage(null);
    setTicketId(null);
    localStorage.removeItem(`verified_tenant_${propertyId}`);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!verifiedTenant) return;
    if (!issue.trim()) {
      setMessage({ type: "error", text: "Please describe the issue." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await submitVerifiedComplaint(
        propertyId,
        verifiedTenant.id,
        verifiedTenant.name,
        verifiedTenant.room_number || "N/A",
        category,
        issue
      );

      if (res.success) {
        setTicketId(res.ticketId);
        setIssue("");
      } else {
        setMessage({ type: "error", text: res.error || "Failed to submit ticket." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearchingStatus(true);
    setStatusResult(null);

    try {
      const res = await checkComplaintStatus(propertyId, searchId);
      if (res.success) {
        setStatusResult(res.data);
      } else {
        alert(res.error || "Ticket not found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingStatus(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Raise a Complaint / Issue
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          File tickets for quick resolution by PG staff
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
        /* STEP 2: Submission and Status Forms */
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

          {/* Ticket ID Success Display or Form */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {ticketId ? (
              <div style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--success)' }}>Complaint Registered!</h4>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR TICKET ID</p>
                  <strong style={{ fontSize: '1.5rem', color: 'white', letterSpacing: '1px' }}>{ticketId}</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Save this Ticket ID to track the resolution status of your issue.
                </p>
                <button 
                  onClick={() => setTicketId(null)}
                  style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Raise Another Complaint
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CATEGORY</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  >
                    <option value="Plumbing" style={{ background: '#1e293b' }}>Plumbing</option>
                    <option value="Electrical" style={{ background: '#1e293b' }}>Electrical</option>
                    <option value="Cleaning" style={{ background: '#1e293b' }}>Cleaning</option>
                    <option value="Internet" style={{ background: '#1e293b' }}>Internet</option>
                    <option value="Food" style={{ background: '#1e293b' }}>Food Quality</option>
                    <option value="Other" style={{ background: '#1e293b' }}>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DESCRIBE ISSUE</label>
                  <textarea 
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    required
                    rows={3}
                    placeholder="e.g. Bathroom tap is leaking..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem', resize: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: submitting ? 0.7 : 1 }}
                >
                  <Send size={16} /> {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            )}
          </div>

          {/* Check Status Widget */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={16} /> Check Ticket Status
            </h3>

            <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. TKT-ABC1)" 
                required
                style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white', outline: 'none', fontSize: '0.85rem' }} 
              />
              <button 
                type="submit" 
                disabled={searchingStatus}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: searchingStatus ? 0.7 : 1 }}
              >
                {searchingStatus ? "..." : "Check"}
              </button>
            </form>

            {statusResult && (
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px', 
                borderLeft: `4px solid ${statusResult.status === 'Resolved' ? 'var(--success)' : statusResult.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)'}`,
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'white' }}>{statusResult.category}</span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: statusResult.status === 'Resolved' ? 'var(--success)' : statusResult.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {statusResult.status}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{statusResult.issue}</p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
