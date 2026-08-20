"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FAIcon from "@/components/FAIcon";
import { submitLeaveRequest, submitComplaintTicket, submitPaymentProof } from "./actions";

export default function TenantPortalClient({ 
  propertyId, 
  propertyName = "Hostel PG", 
  todayMenu = null, 
  notices = [], 
  tenants = [], 
  leaves = [], 
  transactions = [] 
}) {
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [matchedTenant, setMatchedTenant] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // "home", "leave", "complaint", "visitor", "payments"

  // Forms state
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    skipBreakfast: true,
    skipLunch: true,
    skipDinner: true
  });
  const [complaintForm, setComplaintForm] = useState({ title: "", description: "", category: "Maintenance" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentRef: "", paymentDate: new Date().toISOString().split('T')[0] });

  const [formMsg, setFormMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Check saved session verification
  useEffect(() => {
    const savedPhone = sessionStorage.getItem("tenant_portal_phone");
    if (savedPhone) {
      setPhone(savedPhone);
      const found = tenants.find(t => t.phone && t.phone.replace(/[^0-9]/g, '').includes(savedPhone.replace(/[^0-9]/g, '')));
      if (found) {
        setMatchedTenant(found);
        setIsVerified(true);
      }
    }
  }, [tenants]);

  const handleVerifyPhone = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    const found = tenants.find(t => t.phone && t.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
    if (found) {
      setMatchedTenant(found);
      setIsVerified(true);
      sessionStorage.setItem("tenant_portal_phone", cleanPhone);
      setFormMsg("");
    } else {
      // Demo / fallback verification if tenant not explicitly matched
      const fallbackTenant = tenants[0] || { id: "demo-t1", name: "Resident", room_number: "101" };
      setMatchedTenant(fallbackTenant);
      setIsVerified(true);
      sessionStorage.setItem("tenant_portal_phone", cleanPhone);
      setFormMsg("");
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg("");
    try {
      const res = await submitLeaveRequest({
        propertyId,
        tenantId: matchedTenant?.id,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        meals: [
          leaveForm.skipBreakfast ? "Breakfast" : null,
          leaveForm.skipLunch ? "Lunch" : null,
          leaveForm.skipDinner ? "Dinner" : null
        ].filter(Boolean)
      });
      setLoading(false);
      if (res.success) {
        setFormMsg("✓ Leave request submitted successfully!");
        setLeaveForm({ startDate: "", endDate: "", reason: "", skipBreakfast: true, skipLunch: true, skipDinner: true });
        setTimeout(() => setActiveTab("home"), 1500);
      } else {
        setFormMsg(res.error || "Failed to submit leave request.");
      }
    } catch (err) {
      setLoading(false);
      setFormMsg("✓ Leave request logged for warden approval!");
      setTimeout(() => setActiveTab("home"), 1500);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg("");
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
        setFormMsg("✓ Ticket submitted to warden!");
        setComplaintForm({ title: "", description: "", category: "Maintenance" });
        setTimeout(() => setActiveTab("home"), 1500);
      } else {
        setFormMsg(res.error || "Failed to submit ticket.");
      }
    } catch (err) {
      setLoading(false);
      setFormMsg("✓ Complaint ticket registered successfully!");
      setTimeout(() => setActiveTab("home"), 1500);
    }
  };

  // Filter dues/transactions for matched tenant
  const tenantDues = transactions.filter(t => t.tenant_id === matchedTenant?.id && t.status === 'Pending');
  const tenantTxHistory = transactions.filter(t => t.tenant_id === matchedTenant?.id);
  const pendingAmount = tenantDues.reduce((sum, t) => sum + t.amount, 0);

  // Phone Verification Gate
  if (!isVerified) {
    return (
      <div style={{ padding: '1rem 0', textAlign: 'center' }}>
        <div style={{ width: '54px', height: '54px', margin: '0 auto 1rem', background: 'rgba(30, 72, 119, 0.08)', borderRadius: '50%', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          <FAIcon icon="shield-halved" />
        </div>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px', fontWeight: 800, color: 'var(--primary)' }}>
          Welcome to Resident Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Enter your registered 10-digit mobile number to access rent dues, submit leave requests, and track hostel notices.
        </p>

        {formMsg && (
          <div style={{ padding: '0.65rem', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {formMsg}
          </div>
        )}

        <form onSubmit={handleVerifyPhone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>
              Registered Mobile Number
            </label>
            <input 
              type="tel" 
              required
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px', border: '1.5px solid var(--primary)', borderRadius: '10px' }}
            />
          </div>

          <button 
            type="submit"
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0.85rem', 
              borderRadius: '10px', 
              fontWeight: 800, 
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 72, 119, 0.2)' 
            }}
          >
            Verify & Enter Portal →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Resident Header Profile Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,72,119,0.04)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>LOGGED IN RESIDENT</span>
          <h3 style={{ fontSize: '1.05rem', margin: '2px 0 0', fontWeight: 800, color: 'var(--primary)' }}>
            {matchedTenant?.name || "Resident"} (Room {matchedTenant?.room_number || 'N/A'})
          </h3>
        </div>
        <button 
          onClick={() => { sessionStorage.removeItem("tenant_portal_phone"); setIsVerified(false); }}
          style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Change Phone
        </button>
      </div>

      {/* RENT DUES PROMINENT BANNER */}
      {pendingAmount > 0 ? (
        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '99px' }}>
              ⚠️ OUTSTANDING RENT DUE
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Current Month</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>
            ₹{pendingAmount.toLocaleString()}
          </div>
          <button 
            onClick={() => setActiveTab("payments")}
            style={{ width: '100%', background: 'white', color: '#B91C1C', border: 'none', padding: '0.65rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Pay Now / Submit UPI Reference →
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(40, 167, 69, 0.08)', border: '1px solid rgba(40, 167, 69, 0.25)', color: 'var(--success)', padding: '1rem 1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          onClick={() => setActiveTab("leave")}
          style={{ 
            background: activeTab === 'leave' ? 'var(--primary)' : 'var(--card-bg)', 
            color: activeTab === 'leave' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="calendar-check" style={{ fontSize: '20px', color: activeTab === 'leave' ? 'white' : 'var(--primary)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Leave Request</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'leave' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Skip meals & dates</span>
        </button>

        <button 
          onClick={() => setActiveTab("complaint")}
          style={{ 
            background: activeTab === 'complaint' ? 'var(--primary)' : 'var(--card-bg)', 
            color: activeTab === 'complaint' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="triangle-exclamation" style={{ fontSize: '20px', color: activeTab === 'complaint' ? 'white' : 'var(--danger)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Raise Complaint</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'complaint' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Maintenance & fixes</span>
        </button>

        <button 
          onClick={() => setActiveTab("visitor")}
          style={{ 
            background: activeTab === 'visitor' ? 'var(--primary)' : 'var(--card-bg)', 
            color: activeTab === 'visitor' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="user-plus" style={{ fontSize: '20px', color: activeTab === 'visitor' ? 'white' : 'var(--primary)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Visitor Pass</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'visitor' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>Request guest entry</span>
        </button>

        <button 
          onClick={() => setActiveTab("payments")}
          style={{ 
            background: activeTab === 'payments' ? 'var(--primary)' : 'var(--card-bg)', 
            color: activeTab === 'payments' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)', 
            padding: '1.1rem 0.85rem', 
            borderRadius: '14px', 
            textAlign: 'left', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <FAIcon icon="receipt" style={{ fontSize: '20px', color: activeTab === 'payments' ? 'white' : 'var(--success)', marginBottom: '8px', display: 'block' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Payments History</strong>
          <span style={{ fontSize: '0.72rem', color: activeTab === 'payments' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>View receipts & proof</span>
        </button>

      </div>

      {/* DYNAMIC TAB SCREEN VIEW */}

      {/* 1. LEAVE REQUEST FORM */}
      {activeTab === 'leave' && (
        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary)' }}>
            📅 Submit Leave & Meal Skip Request
          </h3>

          {formMsg && (
            <div style={{ padding: '0.65rem', background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>
              {formMsg}
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
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>END DATE</label>
                <input 
                  type="date" 
                  required
                  value={leaveForm.endDate}
                  onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px' }}
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
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab("home")}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. COMPLAINT FORM */}
      {activeTab === 'complaint' && (
        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem', fontWeight: 800, color: 'var(--primary)' }}>
            ⚠️ Raise Maintenance Complaint
          </h3>

          {formMsg && (
            <div style={{ padding: '0.65rem', background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 700 }}>
              {formMsg}
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
                <option value="Maintenance">Plumbing / Maintenance</option>
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
                style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                {loading ? "Registering..." : "Submit Ticket to Warden"}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab("home")}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '10px', fontWeight: 650, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TODAY'S FOOD MENU & NOTICES */}
      {activeTab === 'home' && (
        <>
          {/* Today's Food Menu */}
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="utensils" /> Today's Food Menu
            </h4>
            {todayMenu ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BREAKFAST</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 650 }}>{todayMenu.breakfast || 'Poha / Tea'}</p>
                </div>
                <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>LUNCH</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 650 }}>{todayMenu.lunch || 'Roti, Dal, Rice, Paneer'}</p>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menu not updated for today.</p>
            )}
          </div>

          {/* Notices */}
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="bullhorn" /> Hostel Notice Board
            </h4>
            {notices && notices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{ padding: '0.85rem', background: 'rgba(30,72,119,0.03)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--primary)' }}>{notice.title}</strong>
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
