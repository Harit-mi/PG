"use client";

import { useState } from "react";
import { Search, Edit2, ShieldAlert, Sparkles, X, Loader2, Info, Building2, Ticket, Settings } from "lucide-react";
import { updateCustomerStatus, updateCustomerSubscription, grantComplimentarySlot, fetchBusinessDetails } from "../actions";

export default function CustomersClient({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState(null);
  
  // Tab workspace state
  const [activeTab, setActiveTab] = useState("overview"); // overview, outlets, slots, settings
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [custProperties, setCustProperties] = useState([]);
  const [custSlots, setCustSlots] = useState([]);

  // Grant slot state
  const [grantPlan, setGrantPlan] = useState("Pro");
  const [grantExpiry, setGrantExpiry] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [grantReason, setGrantReason] = useState("");
  const [submittingGrant, setSubmittingGrant] = useState(false);

  // Update forms states
  const [newStatus, setNewStatus] = useState("Active");
  const [statusReason, setStatusReason] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [newPlan, setNewPlan] = useState("Starter");
  const [newExpiry, setNewExpiry] = useState("");
  const [subReason, setSubReason] = useState("");
  const [submittingSub, setSubmittingSub] = useState(false);

  const handleOpenManage = async (cust) => {
    setSelectedCust(cust);
    setActiveTab("overview");
    setNewStatus(cust.status);
    setNewPlan(cust.plan_name || "Starter");
    setNewExpiry(cust.expiry_date && cust.expiry_date !== "N/A" ? cust.expiry_date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatusReason("");
    setSubReason("");
    setGrantReason("");
    
    // Load properties & slots for this business
    setLoadingDetails(true);
    try {
      const res = await fetchBusinessDetails(cust.id);
      if (res.success) {
        setCustProperties(res.properties);
        setCustSlots(res.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGrantSlot = async (e) => {
    e.preventDefault();
    if (!grantReason.trim()) {
      alert("Please enter a mandatory audit reason.");
      return;
    }

    setSubmittingGrant(true);
    try {
      const res = await grantComplimentarySlot(selectedCust.id, grantPlan, grantExpiry, grantReason.trim());
      if (res.success) {
        alert("Prepaid slot granted successfully!");
        // Refresh details
        const detailsRes = await fetchBusinessDetails(selectedCust.id);
        if (detailsRes.success) {
          setCustSlots(detailsRes.slots);
        }
        setGrantReason("");
      } else {
        alert(res.error || "Failed to grant slot.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmittingGrant(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      alert("Please enter a mandatory audit reason.");
      return;
    }

    setSubmittingStatus(true);
    try {
      const res = await updateCustomerStatus(selectedCust.id, newStatus, statusReason.trim());
      if (res.success) {
        alert("Customer status updated successfully!");
        setCustomers(prev => prev.map(c => c.id === selectedCust.id ? { ...c, status: newStatus } : c));
        setSelectedCust(null);
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!subReason.trim()) {
      alert("Please enter a mandatory audit reason.");
      return;
    }

    setSubmittingSub(true);
    try {
      const res = await updateCustomerSubscription(selectedCust.id, newPlan, newExpiry, subReason.trim());
      if (res.success) {
        alert("Subscription updated successfully!");
        setCustomers(prev => prev.map(c => c.id === selectedCust.id ? { ...c, plan_name: newPlan, expiry_date: newExpiry, subscription_status: 'Active' } : c));
        setSelectedCust(null);
      } else {
        alert(res.error || "Failed to update subscription.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmittingSub(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Filter Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by business name or organization ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 3rem' }}
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customer organizations found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Customer / Org ID</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>SaaS Plan</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Properties</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Expiry Date</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Account Status</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cust => {
                let badgeBg = "rgba(16, 185, 129, 0.15)";
                let badgeColor = "var(--success)";
                if (cust.status === 'Suspended') {
                  badgeBg = "rgba(239, 68, 68, 0.15)";
                  badgeColor = "var(--danger)";
                } else if (cust.status === 'Billing Hold') {
                  badgeBg = "rgba(245, 158, 11, 0.15)";
                  badgeColor = "var(--warning)";
                }

                return (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{cust.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {cust.id}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{cust.plan_name || 'Trial'}</td>
                    <td style={{ padding: '1rem' }}>{cust.property_count} properties</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {cust.expiry_date && cust.expiry_date !== 'N/A' ? new Date(cust.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '4px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {cust.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenManage(cust)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={12} /> Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Control Drawer / Modal */}
      {selectedCust && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '750px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BUSINESS HIERARCHY WORKSPACE</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0' }}>{selectedCust.name}</h3>
              </div>
              <button onClick={() => setSelectedCust(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setActiveTab("overview")}
                style={{ background: activeTab === 'overview' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Info size={14} /> Overview
              </button>
              <button
                onClick={() => setActiveTab("outlets")}
                style={{ background: activeTab === 'outlets' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Building2 size={14} /> Outlets
              </button>
              <button
                onClick={() => setActiveTab("slots")}
                style={{ background: activeTab === 'slots' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Ticket size={14} /> Slots
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                style={{ background: activeTab === 'settings' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Settings size={14} /> Billing Settings
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORGANIZATION ID</label>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{selectedCust.id}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAIN ADMINISTRATOR</label>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>Harit Mishra</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>REGISTERED PHONE</label>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>+91 98765 43210</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS FLAG</label>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{selectedCust.status}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outlets Tab */}
                {activeTab === 'outlets' && (
                  <div style={{ overflowX: 'auto' }}>
                    {custProperties.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No outlets registered beneath this business.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Outlet Name</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Address</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Expiry Date</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {custProperties.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                              <td style={{ padding: '0.75rem' }}>{p.address}</td>
                              <td style={{ padding: '0.75rem' }}>{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'N/A'}</td>
                              <td style={{ padding: '0.75rem' }}>{p.subscription_status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Slots Tab */}
                {activeTab === 'slots' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Grant Slot Form */}
                    <div style={{ background: 'rgba(20,184,166,0.03)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Grant Complimentary Slot
                      </h4>
                      <form onSubmit={handleGrantSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.75rem' }}>
                          <div>
                            <select value={grantPlan} onChange={(e) => setGrantPlan(e.target.value)}>
                              <option value="Starter">Starter</option>
                              <option value="Pro">Professional</option>
                              <option value="Enterprise">Enterprise</option>
                            </select>
                          </div>
                          <div>
                            <input type="date" value={grantExpiry} onChange={(e) => setGrantExpiry(e.target.value)} required />
                          </div>
                          <div>
                            <input type="text" placeholder="Audit override reason" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} required />
                          </div>
                        </div>
                        <button type="submit" disabled={submittingGrant} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-end' }}>
                          {submittingGrant ? "Granting..." : "Grant Free Slot"}
                        </button>
                      </form>
                    </div>

                    {/* Slots List */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Slot ID</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Plan</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Expiry</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {custSlots.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{s.id}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.plan_name}</td>
                              <td style={{ padding: '0.75rem' }}>{new Date(s.expiry_date).toLocaleDateString()}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ background: s.status === 'Assigned' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* Billing Settings Tab */}
                {activeTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Part 1: Update Status Form */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={16} style={{ color: 'var(--danger)' }} /> Change Access Status
                      </h4>
                      <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ACCOUNT STATUS</label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              style={{ width: '100%' }}
                            >
                              <option value="Active" style={{ background: '#0a1716' }}>Active</option>
                              <option value="Suspended" style={{ background: '#0a1716' }}>Suspended</option>
                              <option value="Billing Hold" style={{ background: '#0a1716' }}>Billing Hold</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AUDIT REASON</label>
                            <input
                              type="text"
                              placeholder="Specify reason (e.g. unpaid dues)"
                              value={statusReason}
                              onChange={(e) => setStatusReason(e.target.value)}
                              required
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingStatus}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '99px', fontWeight: 600, alignSelf: 'flex-end', minWidth: '120px' }}
                        >
                          {submittingStatus ? <Loader2 size={16} className="spin" /> : "Save Status"}
                        </button>
                      </form>
                    </div>

                    {/* Part 2: Update Plan Form */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={16} style={{ color: 'var(--accent)' }} /> Adjust Subscription Package
                      </h4>
                      <form onSubmit={handleUpdateSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PLAN PACKAGE</label>
                            <select
                              value={newPlan}
                              onChange={(e) => setNewPlan(e.target.value)}
                              style={{ width: '100%' }}
                            >
                              <option value="Starter" style={{ background: '#0a1716' }}>Starter (50 Beds)</option>
                              <option value="Pro" style={{ background: '#0a1716' }}>Professional (200 Beds)</option>
                              <option value="Enterprise" style={{ background: '#0a1716' }}>Enterprise (Unlimited)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>EXPIRY DATE</label>
                            <input
                              type="date"
                              value={newExpiry}
                              onChange={(e) => setNewExpiry(e.target.value)}
                              required
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AUDIT REASON</label>
                          <input
                            type="text"
                            placeholder="Why are you manually override subscriptions?"
                            value={subReason}
                            onChange={(e) => setSubReason(e.target.value)}
                            required
                            style={{ width: '100%' }}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingSub}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '99px', fontWeight: 600, alignSelf: 'flex-end', minWidth: '120px' }}
                        >
                          {submittingSub ? <Loader2 size={16} className="spin" /> : "Save Plan Override"}
                        </button>
                      </form>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
