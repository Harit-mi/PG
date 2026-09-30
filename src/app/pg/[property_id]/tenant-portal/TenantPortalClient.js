"use client";

import { useState, useEffect } from "react";
import FAIcon from "@/components/FAIcon";
import { 
  verifyTenantPhone, 
  submitLeaveRequest, 
  submitComplaintTicket, 
  submitPaymentProof, 
  requestVisitorPass 
} from "./actions";

export default function TenantPortalClient({ 
  propertyId, 
  propertyName = "Hostel PG", 
  todayMenu = null, 
  weeklyMenu = [], 
  paymentMethods = [], 
  notices = [], 
  tenants = [] 
}) {
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [matchedTenant, setMatchedTenant] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // "home", "menu", "leave", "complaint", "visitor", "payments"

  // Live tenant records
  const [transactionsList, setTransactionsList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [visitorsList, setVisitorsList] = useState([]);

  // Forms state
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    skipBreakfast: true,
    skipLunch: true,
    skipDinner: true
  });

  const [complaintForm, setComplaintForm] = useState({ 
    title: "", 
    description: "", 
    category: "Maintenance" 
  });

  const [paymentForm, setPaymentForm] = useState({ 
    amount: "", 
    paymentRef: "", 
    method: "UPI", 
    paymentDate: new Date().toISOString().split('T')[0] 
  });

  const [visitorForm, setVisitorForm] = useState({
    name: "",
    phone: "",
    relationship: "Friend",
    visitDate: new Date().toISOString().split('T')[0],
    purpose: ""
  });

  const [formMsg, setFormMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Check saved session verification on load
  useEffect(() => {
    const savedPhone = typeof window !== 'undefined' ? sessionStorage.getItem("tenant_portal_phone") : null;
    if (savedPhone) {
      setPhone(savedPhone);
      setVerifying(true);
      verifyTenantPhone(propertyId, savedPhone)
        .then(res => {
          setVerifying(false);
          if (res.success && res.tenant) {
            setMatchedTenant(res.tenant);
            setTransactionsList(res.transactions || []);
            setLeavesList(res.leaves || []);
            setComplaintsList(res.complaints || []);
            setVisitorsList(res.visitors || []);
            setIsVerified(true);
          } else {
            sessionStorage.removeItem("tenant_portal_phone");
          }
        })
        .catch(() => {
          setVerifying(false);
        });
    }
  }, [propertyId]);

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormMsg({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setVerifying(true);
    setFormMsg({ type: "", text: "" });

    try {
      const res = await verifyTenantPhone(propertyId, cleanPhone);
      setVerifying(false);
      if (res.success && res.tenant) {
        setMatchedTenant(res.tenant);
        setTransactionsList(res.transactions || []);
        setLeavesList(res.leaves || []);
        setComplaintsList(res.complaints || []);
        setVisitorsList(res.visitors || []);
        setIsVerified(true);
        sessionStorage.setItem("tenant_portal_phone", cleanPhone);
      } else {
        setFormMsg({ type: "error", text: res.error || "No active resident record found for this mobile number." });
      }
    } catch (err) {
      setVerifying(false);
      setFormMsg({ type: "error", text: "Failed to connect to verification server. Please try again." });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tenant_portal_phone");
    setIsVerified(false);
    setMatchedTenant(null);
    setPhone("");
    setTransactionsList([]);
    setLeavesList([]);
    setComplaintsList([]);
    setVisitorsList([]);
    setActiveTab("home");
  };

  // Leave Submit
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg({ type: "", text: "" });

    const meals = [
      leaveForm.skipBreakfast ? "Breakfast" : null,
      leaveForm.skipLunch ? "Lunch" : null,
      leaveForm.skipDinner ? "Dinner" : null
    ].filter(Boolean);

    try {
      const res = await submitLeaveRequest({
        propertyId,
        tenantId: matchedTenant?.id,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        meals,
        skipBreakfast: leaveForm.skipBreakfast,
        skipLunch: leaveForm.skipLunch,
        skipDinner: leaveForm.skipDinner
      });

      setLoading(false);
      if (res.success) {
        setFormMsg({ type: "success", text: "✓ Leave request submitted successfully!" });
        if (res.leave) {
          setLeavesList(prev => [res.leave, ...prev]);
        }
        setLeaveForm({ startDate: "", endDate: "", reason: "", skipBreakfast: true, skipLunch: true, skipDinner: true });
      } else {
        setFormMsg({ type: "error", text: res.error || "Failed to submit leave request." });
      }
    } catch (err) {
      setLoading(false);
      setFormMsg({ type: "error", text: "Error submitting leave request." });
    }
  };

  // Complaint Submit
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg({ type: "", text: "" });

    try {
      const res = await submitComplaintTicket({
        propertyId,
        tenantId: matchedTenant?.id,
        title: complaintForm.title,
        description: complaintForm.description,
        category: complaintForm.category
      });

      setLoading(false);
      if (res.success) {
        setFormMsg({ type: "success", text: `✓ Ticket registered! Ticket ID: ${res.ticketId}` });
        if (res.complaint) {
          setComplaintsList(prev => [res.complaint, ...prev]);
        }
        setComplaintForm({ title: "", description: "", category: "Maintenance" });
      } else {
        setFormMsg({ type: "error", text: res.error || "Failed to submit ticket." });
      }
    } catch (err) {
      setLoading(false);
      setFormMsg({ type: "error", text: "Error submitting complaint ticket." });
    }
  };

  // Visitor Submit
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg({ type: "", text: "" });

    try {
      const res = await requestVisitorPass({
        propertyId,
        tenantId: matchedTenant?.id,
        name: visitorForm.name,
        phone: visitorForm.phone,
        relationship: visitorForm.relationship,
        visitDate: visitorForm.visitDate,
        purpose: visitorForm.purpose
      });

      setLoading(false);
      if (res.success) {
        setFormMsg({ type: "success", text: "✓ Visitor entry pass requested successfully!" });
        if (res.visitor) {
          setVisitorsList(prev => [res.visitor, ...prev]);
        }
        setVisitorForm({
          name: "",
          phone: "",
          relationship: "Friend",
          visitDate: new Date().toISOString().split('T')[0],
          purpose: ""
        });
      } else {
        setFormMsg({ type: "error", text: res.error || "Failed to request visitor pass." });
      }
    } catch (err) {
      setLoading(false);
      setFormMsg({ type: "error", text: "Error requesting visitor pass." });
    }
  };

  // Payment Proof Submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg({ type: "", text: "" });

    try {
      const res = await submitPaymentProof({
        propertyId,
        tenantId: matchedTenant?.id,
        amount: paymentForm.amount,
        paymentRef: paymentForm.paymentRef,
        method: paymentForm.method,
        paymentDate: paymentForm.paymentDate
      });

      setLoading(false);
      if (res.success) {
        setFormMsg({ type: "success", text: "✓ Payment proof submitted for warden verification!" });
        if (res.transaction) {
          setTransactionsList(prev => [res.transaction, ...prev]);
        }
        setPaymentForm({
          amount: "",
          paymentRef: "",
          method: "UPI",
          paymentDate: new Date().toISOString().split('T')[0]
        });
      } else {
        setFormMsg({ type: "error", text: res.error || "Failed to submit payment proof." });
      }
    } catch (err) {
      setLoading(false);
      setFormMsg({ type: "error", text: "Error submitting payment proof." });
    }
  };

  // Dues calculation
  const pendingDues = transactionsList.filter(t => t.type === 'Income' && t.status === 'Pending');
  const pendingAmount = pendingDues.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Phone Verification Gate
  if (!isVerified) {
    return (
      <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', margin: '0 auto 1rem', background: 'rgba(30, 72, 119, 0.08)', borderRadius: '50%', color: 'var(--primary, #1e4877)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          <FAIcon icon="shield-halved" />
        </div>
        <h2 style={{ fontSize: '1.35rem', margin: '0 0 6px', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
          Welcome to {propertyName} Resident Portal
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #64748b)', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
          Enter your registered 10-digit mobile number to view rent dues, create visitor passes, submit leave requests, and log maintenance tickets.
        </p>

        {formMsg.text && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: formMsg.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(40, 167, 69, 0.1)', 
            color: formMsg.type === 'error' ? 'var(--danger, #dc2626)' : 'var(--success, #16a34a)', 
            border: `1px solid ${formMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '10px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            marginBottom: '1.25rem',
            maxWidth: '380px',
            margin: '0 auto 1.25rem'
          }}>
            {formMsg.text}
          </div>
        )}

        <form onSubmit={handleVerifyPhone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '380px', margin: '0 auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'left' }}>
              Registered Mobile Number
            </label>
            <input 
              type="tel" 
              required
              inputMode="numeric"
              maxLength={15}
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px', border: '2px solid var(--primary, #1e4877)', borderRadius: '12px', outline: 'none' }}
            />
          </div>

          <button 
            type="submit"
            disabled={verifying}
            style={{ 
              background: 'var(--primary, #1e4877)', 
              color: 'white', 
              border: 'none', 
              padding: '0.9rem', 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 72, 119, 0.25)',
              opacity: verifying ? 0.7 : 1
            }}
          >
            {verifying ? "Verifying..." : "Verify & Enter Portal →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Resident Header Profile Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,72,119,0.04)', padding: '0.85rem 1.15rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>LOGGED IN RESIDENT</span>
          <h3 style={{ fontSize: '1.1rem', margin: '2px 0 0', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
            {matchedTenant?.name || "Resident"} (Room {matchedTenant?.room_number || 'N/A'})
          </h3>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
        >
          Change Phone
        </button>
      </div>

      {/* RENT DUES BANNER */}
      {pendingAmount > 0 ? (
        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '99px' }}>
              ⚠️ OUTSTANDING RENT DUE
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Balance</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>
            ₹{pendingAmount.toLocaleString()}
          </div>
          <button 
            onClick={() => { setActiveTab("payments"); setFormMsg({ type: "", text: "" }); }}
            style={{ width: '100%', background: 'white', color: '#B91C1C', border: 'none', padding: '0.7rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Pay Now / Submit Payment Reference →
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(40, 167, 69, 0.08)', border: '1px solid rgba(40, 167, 69, 0.25)', color: 'var(--success, #16a34a)', padding: '1rem 1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FAIcon icon="circle-check" style={{ fontSize: '22px' }} />
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'block' }}>Rent Account Settled</strong>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>No pending dues for current month.</span>
          </div>
        </div>
      )}

      {/* QUICK-ACTION UTILITY TILES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
        
        <button 
          onClick={() => { setActiveTab("menu"); setFormMsg({ type: "", text: "" }); }}
          style={{ 
            background: activeTab === 'menu' ? 'var(--primary, #1e4877)' : 'var(--card-bg, #ffffff)', 
            color: activeTab === 'menu' ? 'white' : 'var(--foreground, #1e293b)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="utensils" style={{ fontSize: '20px', color: activeTab === 'menu' ? 'white' : 'var(--accent, #f59e0b)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Food Menu</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'menu' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>This week's plan</span>
        </button>

        <button 
          onClick={() => { setActiveTab("leave"); setFormMsg({ type: "", text: "" }); }}
          style={{ 
            background: activeTab === 'leave' ? 'var(--primary, #1e4877)' : 'var(--card-bg, #ffffff)', 
            color: activeTab === 'leave' ? 'white' : 'var(--foreground, #1e293b)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="calendar-check" style={{ fontSize: '20px', color: activeTab === 'leave' ? 'white' : 'var(--primary, #1e4877)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Leave Request</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'leave' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Skip meals & dates</span>
        </button>

        <button 
          onClick={() => { setActiveTab("complaint"); setFormMsg({ type: "", text: "" }); }}
          style={{ 
            background: activeTab === 'complaint' ? 'var(--primary, #1e4877)' : 'var(--card-bg, #ffffff)', 
            color: activeTab === 'complaint' ? 'white' : 'var(--foreground, #1e293b)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="triangle-exclamation" style={{ fontSize: '20px', color: activeTab === 'complaint' ? 'white' : 'var(--danger, #dc2626)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Raise Complaint</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'complaint' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Maintenance & fixes</span>
        </button>

        <button 
          onClick={() => { setActiveTab("visitor"); setFormMsg({ type: "", text: "" }); }}
          style={{ 
            background: activeTab === 'visitor' ? 'var(--primary, #1e4877)' : 'var(--card-bg, #ffffff)', 
            color: activeTab === 'visitor' ? 'white' : 'var(--foreground, #1e293b)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="user-plus" style={{ fontSize: '20px', color: activeTab === 'visitor' ? 'white' : 'var(--primary, #1e4877)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Visitor Pass</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'visitor' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Request guest entry</span>
        </button>

        <button 
          onClick={() => { setActiveTab("payments"); setFormMsg({ type: "", text: "" }); }}
          style={{ 
            gridColumn: 'span 2',
            background: activeTab === 'payments' ? 'var(--primary, #1e4877)' : 'var(--card-bg, #ffffff)', 
            color: activeTab === 'payments' ? 'white' : 'var(--foreground, #1e293b)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="receipt" style={{ fontSize: '20px', color: activeTab === 'payments' ? 'white' : 'var(--success, #16a34a)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Payments History</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'payments' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>View receipts & past dues</span>
        </button>

      </div>

      {/* DYNAMIC TAB SCREEN VIEW */}

      {/* 1. LEAVE REQUEST FORM & TRACKER */}
      {activeTab === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              📅 Submit Leave & Meal Skip Request
            </h3>

            {formMsg.text && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: formMsg.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(40, 167, 69, 0.1)', 
                color: formMsg.type === 'error' ? 'var(--danger, #dc2626)' : 'var(--success, #16a34a)', 
                border: `1px solid ${formMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                marginBottom: '1rem', 
                fontWeight: 700 
              }}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>START DATE</label>
                  <input 
                    type="date" 
                    required
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>END DATE</label>
                  <input 
                    type="date" 
                    required
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>SELECT MEALS TO SKIP</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 650, cursor: 'pointer' }}>
                    <input type="checkbox" checked={leaveForm.skipBreakfast} onChange={e => setLeaveForm({ ...leaveForm, skipBreakfast: e.target.checked })} /> Breakfast
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 650, cursor: 'pointer' }}>
                    <input type="checkbox" checked={leaveForm.skipLunch} onChange={e => setLeaveForm({ ...leaveForm, skipLunch: e.target.checked })} /> Lunch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 650, cursor: 'pointer' }}>
                    <input type="checkbox" checked={leaveForm.skipDinner} onChange={e => setLeaveForm({ ...leaveForm, skipDinner: e.target.checked })} /> Dinner
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>REASON (OPTIONAL)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Home Visit / Vacation"
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, background: 'var(--primary, #1e4877)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? "Submitting..." : "Submit Leave Request"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab("home"); setFormMsg({ type: "", text: "" }); }}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>

          {/* Resident Leave Status Tracker */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              ⏱️ My Leave Requests & Status
            </h4>
            {leavesList.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No leave requests submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {leavesList.map((l, i) => {
                  const meals = [];
                  if (l.breakfast) meals.push("Breakfast");
                  if (l.lunch) meals.push("Lunch");
                  if (l.dinner) meals.push("Dinner");

                  const statusColor = l.status === 'Approved' ? '#16a34a' : l.status === 'Rejected' ? '#dc2626' : '#d97706';
                  const statusBg = l.status === 'Approved' ? 'rgba(22, 163, 74, 0.1)' : l.status === 'Rejected' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)';

                  return (
                    <div key={l.id || i} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                          {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Skipping: {meals.join(", ") || "None"} • Reason: {l.reason || "Personal"}
                        </div>
                      </div>
                      <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {l.status || "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. COMPLAINT FORM & TRACKER */}
      {activeTab === 'complaint' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              ⚠️ Raise Maintenance Complaint
            </h3>

            {formMsg.text && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: formMsg.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(40, 167, 69, 0.1)', 
                color: formMsg.type === 'error' ? 'var(--danger, #dc2626)' : 'var(--success, #16a34a)', 
                border: `1px solid ${formMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                marginBottom: '1rem', 
                fontWeight: 700 
              }}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>CATEGORY</label>
                <select 
                  value={complaintForm.category}
                  onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 650 }}
                >
                  <option value="Plumbing">Plumbing / Maintenance</option>
                  <option value="Electrical">Electrical / AC / Fan</option>
                  <option value="Cleanliness">Cleanliness / Washroom</option>
                  <option value="Food">Food Quality</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>ISSUE TITLE</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Tap leaking in Room 101 bath"
                  value={complaintForm.title}
                  onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>DETAILED DESCRIPTION</label>
                <textarea 
                  rows={3}
                  placeholder="Provide details for the warden..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, background: 'var(--danger, #dc2626)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? "Registering..." : "Submit Ticket to Warden"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab("home"); setFormMsg({ type: "", text: "" }); }}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Resident Tickets List */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              📋 My Reported Complaints
            </h4>
            {complaintsList.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No complaints submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaintsList.map((t, i) => {
                  const statusColor = t.status === 'Resolved' ? '#16a34a' : t.status === 'In Progress' ? '#d97706' : '#dc2626';
                  const statusBg = t.status === 'Resolved' ? 'rgba(22, 163, 74, 0.1)' : t.status === 'In Progress' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(220, 38, 38, 0.1)';

                  return (
                    <div key={t.id || i} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'monospace' }}>
                          {t.ticket_id || `TKT-${i+1}`} • {t.category}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 650, marginTop: '2px' }}>
                          {t.issue}
                        </div>
                      </div>
                      <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {t.status || "Open"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VISITOR PASS FORM & TRACKER */}
      {activeTab === 'visitor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              👥 Request Guest / Visitor Pass
            </h3>

            {formMsg.text && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: formMsg.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(40, 167, 69, 0.1)', 
                color: formMsg.type === 'error' ? 'var(--danger, #dc2626)' : 'var(--success, #16a34a)', 
                border: `1px solid ${formMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                marginBottom: '1rem', 
                fontWeight: 700 
              }}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleVisitorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>VISITOR FULL NAME *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={visitorForm.name}
                  onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>MOBILE NUMBER *</label>
                  <input 
                    type="tel" 
                    required
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="9876543210"
                    value={visitorForm.phone}
                    onChange={e => setVisitorForm({ ...visitorForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>RELATIONSHIP</label>
                  <select 
                    value={visitorForm.relationship}
                    onChange={e => setVisitorForm({ ...visitorForm, relationship: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <option value="Friend">Friend</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>VISIT DATE</label>
                  <input 
                    type="date" 
                    required
                    value={visitorForm.visitDate}
                    onChange={e => setVisitorForm({ ...visitorForm, visitDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>PURPOSE</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Study / Family visit"
                    value={visitorForm.purpose}
                    onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, background: 'var(--primary, #1e4877)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? "Requesting..." : "Request Visitor Pass"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab("home"); setFormMsg({ type: "", text: "" }); }}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Visitor Passes Tracker */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              🎫 My Visitor Passes
            </h4>
            {visitorsList.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No visitor passes requested yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {visitorsList.map((v, i) => {
                  let statusColor = '#d97706';
                  let statusBg = 'rgba(217, 119, 6, 0.1)';
                  if (v.status === 'Approved' || v.status === 'Checked In') {
                    statusColor = '#16a34a';
                    statusBg = 'rgba(22, 163, 74, 0.1)';
                  } else if (v.status === 'Rejected') {
                    statusColor = '#dc2626';
                    statusBg = 'rgba(220, 38, 38, 0.1)';
                  } else if (v.status === 'Checked Out') {
                    statusColor = '#64748b';
                    statusBg = 'rgba(100, 116, 139, 0.1)';
                  }

                  return (
                    <div key={v.id || i} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                          {v.name} ({v.relationship})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Ph: {v.phone} • Date: {new Date(v.visit_date).toLocaleDateString()} • {v.purpose}
                        </div>
                      </div>
                      <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {v.status || "Requested"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PAYMENTS & HISTORY TAB */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* PG Payment Methods Info */}
          {paymentMethods && paymentMethods.length > 0 && (
            <div style={{ background: 'rgba(30,72,119,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
                🏦 PG Payment Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {paymentMethods.map(pm => (
                  <div key={pm.id} style={{ fontSize: '0.85rem', background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <strong style={{ color: 'var(--primary, #1e4877)' }}>{pm.type}: </strong> {pm.details}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Proof Form */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              🧾 Submit Rent Payment Proof / UPI Ref
            </h3>

            {formMsg.text && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                background: formMsg.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(40, 167, 69, 0.1)', 
                color: formMsg.type === 'error' ? 'var(--danger, #dc2626)' : 'var(--success, #16a34a)', 
                border: `1px solid ${formMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                marginBottom: '1rem', 
                fontWeight: 700 
              }}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>AMOUNT (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="e.g. 8000"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>PAYMENT METHOD</label>
                  <select 
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Account">Bank Transfer / IMPS</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>UPI REF / TXN ID *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 423871928371"
                    value={paymentForm.paymentRef}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentRef: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>PAYMENT DATE</label>
                  <input 
                    type="date" 
                    required
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, background: 'var(--success, #16a34a)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? "Submitting Proof..." : "Submit Payment for Verification"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab("home"); setFormMsg({ type: "", text: "" }); }}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>

          {/* Resident Payment History Ledger */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)' }}>
              📜 Resident Payment History
            </h4>
            {transactionsList.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No past payment transactions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {transactionsList.map((tx, i) => {
                  const isSettled = tx.status === 'Completed' || tx.status === 'Paid';
                  const isPendingVerification = tx.status === 'Pending Owner Verification';
                  
                  let badgeColor = '#dc2626';
                  let badgeBg = 'rgba(220, 38, 38, 0.1)';
                  if (isSettled) {
                    badgeColor = '#16a34a';
                    badgeBg = 'rgba(22, 163, 74, 0.1)';
                  } else if (isPendingVerification) {
                    badgeColor = '#d97706';
                    badgeBg = 'rgba(217, 119, 6, 0.1)';
                  }

                  return (
                    <div key={tx.id || i} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          ₹{Number(tx.amount || 0).toLocaleString()} • <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{tx.category || 'Rent'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent'} • Method: {tx.payment_method || 'UPI'} {tx.description ? `(${tx.description})` : ''}
                        </div>
                      </div>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {tx.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. WEEKLY MENU TAB */}
      {activeTab === 'menu' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FAIcon icon="utensils" /> Weekly Food Menu
          </h4>
          
          {weeklyMenu && weeklyMenu.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                const dayMenu = weeklyMenu.find(m => m.day_of_week === day);
                const isToday = day === new Date().toLocaleDateString('en-US', {weekday:'long'});
                return (
                  <div key={day} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: isToday ? 'var(--primary, #1e4877)' : 'rgba(30,72,119,0.03)', color: isToday ? 'white' : 'inherit', padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.9rem', borderBottom: '1px solid var(--border)' }}>
                      {day} {isToday && "(Today)"}
                    </div>
                    <div style={{ padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>BREAKFAST</span>
                        <strong>{dayMenu?.breakfast || 'Standard'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>LUNCH</span>
                        <strong>{dayMenu?.lunch || 'Standard'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>DINNER</span>
                        <strong>{dayMenu?.dinner || 'Standard'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>The weekly menu has not been published yet.</p>
          )}

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'right' }}>
            <button 
              type="button" 
              onClick={() => { setActiveTab("home"); setFormMsg({ type: "", text: "" }); }}
              style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* TODAY'S FOOD MENU & NOTICES ON HOME TAB */}
      {activeTab === 'home' && (
        <>
          {/* Today's Food Menu */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="utensils" /> Today&apos;s Food Menu
            </h4>
            {todayMenu ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BREAKFAST</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 650 }}>{todayMenu.breakfast || 'Poha / Tea'}</p>
                </div>
                <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>LUNCH</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 650 }}>{todayMenu.lunch || 'Roti, Dal, Rice'}</p>
                </div>
                <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DINNER</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 650 }}>{todayMenu.dinner || 'Special Dinner'}</p>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menu not updated for today.</p>
            )}
          </div>

          {/* Notices */}
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary, #1e4877)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="bullhorn" /> Hostel Notice Board
            </h4>
            {notices && notices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ padding: '0.85rem', background: 'rgba(30,72,119,0.03)', borderRadius: '10px', borderLeft: '4px solid var(--primary, #1e4877)' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--primary, #1e4877)' }}>{notice.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--foreground)' }}>{notice.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No notices posted.</p>
            )}
          </div>
        </>
      )}

    </div>
  );
}
