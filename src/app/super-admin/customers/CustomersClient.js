"use client";

import { useState } from "react";
import FAIcon from "@/components/FAIcon";
import { updateCustomerStatus, updateCustomerSubscription, grantComplimentarySlot, fetchBusinessDetails, registerNewCustomer } from "../actions";

export default function CustomersClient({ initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Active", "Suspended", "Billing Hold"
  
  // Selected Customer Management Panel
  const [selectedCust, setSelectedCust] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Consequential Action Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, custId: null, action: "", targetStatus: "", reason: "" });

  // Slide-Over Drawer for "Add New Customer"
  const [showAddCustomerDrawer, setShowAddCustomerDrawer] = useState(false);
  const [custName, setCustName] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custStartDate, setCustStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [custPlanType, setCustPlanType] = useState("Monthly");
  const [custPassword, setCustPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [drawerError, setDrawerError] = useState("");

  // Filtered & Sorted Customer Roster
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      (cust.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (cust.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (cust.phone || "").toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "All") matchesStatus = cust.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle New Customer Registration
  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setDrawerError("");

    try {
      const res = await registerNewCustomer({
        name: custName,
        mobile: custMobile,
        email: custEmail,
        startDate: custStartDate,
        planType: custPlanType,
        password: custPassword,
        confirmPassword: custPassword
      });

      if (res.success) {
        setShowAddCustomerDrawer(false);
        setCustName("");
        setCustMobile("");
        setCustEmail("");
        setCustPassword("");
        window.location.reload();
      } else {
        setDrawerError(res.error || "Failed to register customer.");
      }
    } catch (err) {
      console.error(err);
      setDrawerError("An error occurred during customer onboarding.");
    } finally {
      setRegistering(false);
    }
  };

  // Open Consequential Status Action Modal
  const triggerStatusConfirmation = (cust, targetStatus) => {
    setConfirmModal({
      open: true,
      custId: cust.id,
      custName: cust.name,
      targetStatus,
      reason: ""
    });
  };

  // Execute Confirmed Action
  const executeStatusChange = async () => {
    if (!confirmModal.reason.trim()) {
      alert("Please provide a mandatory administrative audit reason.");
      return;
    }

    try {
      const res = await updateCustomerStatus(confirmModal.custId, confirmModal.targetStatus, confirmModal.reason.trim());
      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === confirmModal.custId ? { ...c, status: confirmModal.targetStatus } : c));
        setConfirmModal({ open: false, custId: null, action: "", targetStatus: "", reason: "" });
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-inter)' }}>
      
      {/* Admin Action Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <FAIcon icon="magnifying-glass" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            <input 
              type="text" 
              placeholder="Search by organization, email, or mobile..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--card-bg)' }}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 650, background: 'var(--card-bg)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
            <option value="Billing Hold">Billing Hold Only</option>
          </select>
        </div>

        {/* Slide-over Drawer Trigger */}
        <button 
          onClick={() => setShowAddCustomerDrawer(true)}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            padding: '0.65rem 1.25rem', 
            borderRadius: '8px', 
            fontWeight: 750, 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 10px rgba(30, 72, 119, 0.2)'
          }}
        >
          <FAIcon icon="plus" /> Add New Customer
        </button>

      </div>


      {/* DENSE INTERNAL DATA TABLE */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 72, 119, 0.04)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Customer / Org</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Contact Email</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>SaaS Plan</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Outlets</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Expiry Date</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Row Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer organizations match search filter.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => (
                <tr key={cust.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  
                  {/* Org / Name */}
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 750, color: 'var(--primary)' }}>
                    {cust.name}
                    {cust.phone && (
                      <span className="tabular-nums" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        📱 {cust.phone}
                      </span>
                    )}
                  </td>

                  {/* Email */}
                  <td style={{ padding: '0.85rem 1rem' }} className="tabular-nums">
                    {cust.email || 'N/A'}
                  </td>

                  {/* Plan */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ background: 'rgba(30, 72, 119, 0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 750 }}>
                      {cust.plan_name || 'Standard'} ({cust.plan_type || 'Monthly'})
                    </span>
                  </td>

                  {/* Outlets */}
                  <td className="tabular-nums" style={{ padding: '0.85rem 1rem', fontWeight: 750 }}>
                    {cust.outlets_count || 1} Outlets
                  </td>

                  {/* Expiry Date */}
                  <td className="tabular-nums" style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {cust.expiry_date || 'Active'}
                  </td>

                  {/* Status Pill */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {cust.status === 'Active' ? (
                      <span style={{ background: 'rgba(40, 167, 69, 0.12)', color: 'var(--success)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                        ● ACTIVE
                      </span>
                    ) : cust.status === 'Suspended' ? (
                      <span style={{ background: 'rgba(220, 38, 38, 0.15)', color: 'var(--danger)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                        ⚠️ SUSPENDED
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#B45309', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                        ⏳ BILLING HOLD
                      </span>
                    )}
                  </td>

                  {/* Actions (Requires Confirmation) */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      {cust.status !== 'Active' && (
                        <button 
                          onClick={() => triggerStatusConfirmation(cust, 'Active')}
                          style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Activate
                        </button>
                      )}
                      {cust.status !== 'Suspended' && (
                        <button 
                          onClick={() => triggerStatusConfirmation(cust, 'Suspended')}
                          style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Suspend
                        </button>
                      )}
                      {cust.status !== 'Billing Hold' && (
                        <button 
                          onClick={() => triggerStatusConfirmation(cust, 'Billing Hold')}
                          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Hold
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* SLIDE-OVER DRAWER FOR "ADD NEW CUSTOMER" */}
      {showAddCustomerDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: 'var(--card-bg)', height: '100%', borderLeft: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>INTERNAL TOOLING</span>
                <h2 style={{ fontSize: '1.25rem', margin: '2px 0 0', fontWeight: 800, color: 'var(--primary)' }}>Add New Customer</h2>
              </div>
              <button onClick={() => setShowAddCustomerDrawer(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <FAIcon icon="xmark" />
              </button>
            </div>

            {drawerError && (
              <div style={{ padding: '0.65rem', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8rem' }}>
                {drawerError}
              </div>
            )}

            <form onSubmit={handleRegisterCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>PG OWNER / ORG NAME</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sunrise PG Hostels" 
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>LOGIN EMAIL</label>
                <input 
                  type="email" 
                  required
                  placeholder="owner@example.com" 
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>MOBILE NUMBER</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210" 
                  value={custMobile}
                  onChange={e => setCustMobile(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>START DATE</label>
                  <input 
                    type="date" 
                    required
                    value={custStartDate}
                    onChange={e => setCustStartDate(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>SaaS PLAN</label>
                  <select 
                    value={custPlanType}
                    onChange={e => setCustPlanType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 650 }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>INITIAL ACCOUNT PASSWORD</label>
                <input 
                  type="password" 
                  required
                  placeholder="Set login password" 
                  value={custPassword}
                  onChange={e => setCustPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={registering}
                  style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {registering ? "Provisioning..." : "Onboard Customer"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddCustomerDrawer(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', fontWeight: 650, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


      {/* ACTION CONFIRMATION MODAL (Prevents Fat-Fingering Destructive Status Overrides) */}
      {confirmModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '440px', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '8px' }}>
              <FAIcon icon="triangle-exclamation" style={{ fontSize: '20px' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                Confirm Account Override
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', margin: '0 0 1rem', lineHeight: 1.4 }}>
              Are you sure you want to change account status for <strong>{confirmModal.custName}</strong> to <span style={{ fontWeight: 800, color: 'var(--danger)' }}>{confirmModal.targetStatus}</span>?
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                MANDATORY AUDIT REASON
              </label>
              <textarea 
                rows={2}
                required
                placeholder="Log reason for administrative audit trail..."
                value={confirmModal.reason}
                onChange={e => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setConfirmModal({ open: false, custId: null, action: "", targetStatus: "", reason: "" })}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusChange}
                style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Confirm Status Override
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
