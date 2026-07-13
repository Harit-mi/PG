"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { verifyTenantByPhone, requestVisitorPass } from "@/app/actions";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Smartphone, LogOut, Send, XCircle } from "lucide-react";

export default function TenantVisitorsPage() {
  const params = useParams();
  const propertyId = params.property_id;

  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedTenant, setVerifiedTenant] = useState(null);
  const [visitorsHistory, setVisitorsHistory] = useState([]);
  
  // Visitor Request Form Fields
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [relationship, setRelationship] = useState("Parent");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const savedTenant = localStorage.getItem(`verified_tenant_${propertyId}`);
    if (savedTenant) {
      const parsed = JSON.parse(savedTenant);
      setVerifiedTenant(parsed);
      fetchVisitorsHistory(parsed.id);
    }
  }, [propertyId]);

  const fetchVisitorsHistory = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVisitorsHistory(data);
      }
    } catch (err) {
      console.error("Error fetching visitors history:", err);
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
        fetchVisitorsHistory(res.tenant.id);
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
    setVisitorsHistory([]);
    setMessage(null);
    localStorage.removeItem(`verified_tenant_${propertyId}`);
  };

  const handleSubmitVisitor = async (e) => {
    e.preventDefault();
    if (!verifiedTenant) return;

    if (!visitorName.trim() || !visitorPhone.trim() || !purpose.trim()) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await requestVisitorPass(
        propertyId,
        verifiedTenant.id,
        visitorName,
        visitorPhone,
        relationship,
        visitDate,
        purpose
      );

      if (res.success) {
        setMessage({ type: "success", text: "Visitor gate-pass requested successfully!" });
        setVisitorName("");
        setVisitorPhone("");
        setPurpose("");
        fetchVisitorsHistory(verifiedTenant.id);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to request pass." });
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
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Visitor Gate-Pass
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Register visitor requests for gate security clearance
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
        /* STEP 2: Request Pass Form */
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

          {/* Visitor Form */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <form onSubmit={handleSubmitVisitor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>VISITOR NAME</label>
                  <input 
                    type="text"
                    placeholder="Visitor Name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>VISITOR PHONE</label>
                  <input 
                    type="tel"
                    placeholder="Visitor Phone"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>RELATIONSHIP</label>
                  <select 
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  >
                    <option value="Parent" style={{ background: '#1e293b' }}>Parent</option>
                    <option value="Friend" style={{ background: '#1e293b' }}>Friend</option>
                    <option value="Relative" style={{ background: '#1e293b' }}>Relative</option>
                    <option value="Delivery" style={{ background: '#1e293b' }}>Delivery/Courier</option>
                    <option value="Other" style={{ background: '#1e293b' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>VISIT DATE</label>
                  <input 
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PURPOSE OF VISIT</label>
                <textarea 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. Giving books / visiting room"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem', resize: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: submitting ? 0.7 : 1 }}
              >
                <UserCheck size={16} /> {submitting ? "Requesting..." : "Request Gate-Pass"}
              </button>
            </form>
          </div>

          {/* Visitor History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0', fontWeight: 600 }}>⏱️ Gate Pass Logs</h3>
            
            {visitorsHistory.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No visitor passes requested yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {visitorsHistory.map(vis => {
                  let statusColor = "var(--warning)";
                  let statusIcon = <Clock size={12} />;
                  if (vis.status === "Approved" || vis.status === "Checked In") {
                    statusColor = "var(--success)";
                    statusIcon = <CheckCircle2 size={12} />;
                  } else if (vis.status === "Rejected") {
                    statusColor = "var(--danger)";
                    statusIcon = <XCircle size={12} />;
                  } else if (vis.status === "Checked Out") {
                    statusColor = "var(--text-muted)";
                    statusIcon = <CheckCircle2 size={12} />;
                  }

                  return (
                    <div key={vis.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>
                          {vis.name} ({vis.relationship})
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: statusColor, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {statusIcon} {vis.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <div>Phone: {vis.phone}</div>
                        <div>Visit Date: {new Date(vis.visit_date).toLocaleDateString()}</div>
                        <div>Purpose: {vis.purpose}</div>
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
