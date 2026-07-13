"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { verifyTenantByPhone, submitTenantPayment } from "@/app/actions";
import { CreditCard, CheckCircle2, AlertCircle, Clock, Smartphone, LogOut, Receipt, ArrowRight } from "lucide-react";

export default function TenantRentPage() {
  const params = useParams();
  const propertyId = params.property_id;

  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedTenant, setVerifiedTenant] = useState(null);
  
  // Bills / Invoices Lists
  const [pendingBills, setPendingBills] = useState([]);
  const [paidHistory, setPaidHistory] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [message, setMessage] = useState(null);

  // Form input states (keyed by transaction ID)
  const [uRefInput, setURefInput] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const savedTenant = localStorage.getItem(`verified_tenant_${propertyId}`);
    if (savedTenant) {
      const parsed = JSON.parse(savedTenant);
      setVerifiedTenant(parsed);
      fetchTenantBills(parsed.id);
    }
  }, [propertyId]);

  const fetchTenantBills = async (tenantId) => {
    setLoadingBills(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('type', 'Income')
        .order('date', { ascending: false });

      if (!error && data) {
        setPendingBills(data.filter(b => b.status === 'Pending'));
        setPaidHistory(data.filter(b => b.status === 'Completed'));
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoadingBills(false);
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
        fetchTenantBills(res.tenant.id);
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
    setPendingBills([]);
    setPaidHistory([]);
    setMessage(null);
    localStorage.removeItem(`verified_tenant_${propertyId}`);
  };

  const handlePaySubmit = async (e, billId) => {
    e.preventDefault();
    const ref = uRefInput[billId];
    if (!ref || !ref.trim()) {
      alert("Please enter your transaction reference number.");
      return;
    }

    setSubmittingId(billId);
    setMessage(null);

    try {
      const res = await submitTenantPayment(billId, ref.trim(), null);
      if (res.success) {
        alert("Payment reference submitted! PG owner will verify it shortly.");
        setURefInput(prev => ({ ...prev, [billId]: "" }));
        fetchTenantBills(verifiedTenant.id);
      } else {
        alert(res.error || "Failed to submit reference.");
      }
    } catch (err) {
      console.error(err);
      alert("A connection error occurred.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRefChange = (billId, val) => {
    setURefInput(prev => ({ ...prev, [billId]: val }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Rent & Invoices Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Pay monthly dues and report transactions
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
        /* STEP 2: Bills Lists */
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

          {/* Pending Bills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={18} /> Outstanding Invoices
            </h3>

            {loadingBills ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading invoices...</div>
            ) : pendingBills.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.03)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: '12px' }}>
                🎉 Hurray! You have no outstanding bills.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingBills.map(bill => (
                  <div key={bill.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{bill.category || "Rent"} Demand</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Due Date: {new Date(bill.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)' }}>
                        ₹{bill.amount.toLocaleString()}
                      </span>
                    </div>

                    {bill.payment_reference ? (
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} /> 
                        <span>Verification Pending (Ref No: <strong>{bill.payment_reference}</strong>)</span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handlePaySubmit(e, bill.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Once paid via UPI or cash, enter transaction reference details:
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text"
                            placeholder="Enter UPI Reference / UTR No"
                            value={uRefInput[bill.id] || ""}
                            onChange={(e) => handleRefChange(bill.id, e.target.value)}
                            required
                            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                          />
                          <button 
                            type="submit" 
                            disabled={submittingId === bill.id}
                            style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                          >
                            Submit <ArrowRight size={14} />
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paid History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={18} /> Payment History
            </h3>
            
            {paidHistory.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No completed payment records.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {paidHistory.map(bill => (
                  <div key={bill.id} style={{ background: 'rgba(16, 185, 129, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white' }}>{bill.category || "Rent"}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Paid on: {new Date(bill.payment_date || bill.date).toLocaleDateString()}
                      </div>
                      {bill.payment_method && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Method: {bill.payment_method}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)', display: 'block' }}>
                        +₹{bill.amount.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
