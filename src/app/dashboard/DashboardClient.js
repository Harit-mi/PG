"use client";

import { useState } from "react";
import Link from "next/link";
import FAIcon from "@/components/FAIcon";

export default function DashboardClient({
  properties = [],
  rooms = [],
  tenants = [],
  transactions = [],
  complaints = [],
  leaves = [],
  visitors = [],
  employees = [],
  assets = [],
  subscription = null,
  cookiePropertyId = "all"
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(cookiePropertyId);
  const [dateFilter, setDateFilter] = useState("This Month"); // "Today", "This Month", "Last Month", "All"

  // Date check helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  
  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (dateFilter === 'Today') {
      return date.toDateString() === now.toDateString();
    } else if (dateFilter === 'This Month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'Last Month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    return true; // All
  };

  // Filter lists based on selected property
  const activePropertyIds = selectedPropertyId === 'all' 
    ? properties.map(p => p.id) 
    : [selectedPropertyId];

  const filteredRooms = rooms.filter(r => activePropertyIds.includes(r.property_id));
  const filteredTenants = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === 'Active');
  const filteredTx = transactions.filter(t => activePropertyIds.includes(t.property_id) && isDateInRange(t.date));
  const filteredComplaints = complaints.filter(c => activePropertyIds.includes(c.property_id));
  const filteredLeaves = leaves.filter(l => activePropertyIds.includes(l.property_id));
  const filteredVisitors = visitors.filter(v => activePropertyIds.includes(v.property_id));
  const filteredAssets = assets.filter(a => activePropertyIds.includes(a.property_id));

  // Compute metrics
  const totalOutletsCount = selectedPropertyId === 'all' ? properties.length : 1;
  const totalBeds = filteredRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const occupiedBeds = filteredTenants.length;
  const vacantBeds = Math.max(totalBeds - occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Financial calculations
  const expectedRent = filteredTx
    .filter(t => t.type === 'Income' && t.category === 'Rent')
    .reduce((sum, t) => sum + t.amount, 0);

  const rentCollected = filteredTx
    .filter(t => t.type === 'Income' && t.category === 'Rent' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDues = filteredTx
    .filter(t => t.type === 'Income' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = filteredTx
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = rentCollected - monthlyExpenses;

  // Attention Required Alerts
  const alerts = [];
  
  // Overdue rent
  const overdueTenants = transactions.filter(t => 
    activePropertyIds.includes(t.property_id) &&
    t.type === 'Income' && 
    t.status === 'Pending' && 
    new Date(t.date) < new Date()
  );
  if (overdueTenants.length > 0) {
    alerts.push({
      priority: "Urgent",
      message: `${overdueTenants.length} tenants have overdue rent payments.`,
      actionLabel: "Collect Dues",
      link: "/dashboard/dues"
    });
  }

  // Pending leave requests
  const pendingLeaves = filteredLeaves.filter(l => l.status === 'Pending');
  if (pendingLeaves.length > 0) {
    alerts.push({
      priority: "Due Today",
      message: `${pendingLeaves.length} pending leave requests require approval.`,
      actionLabel: "Approve Leaves",
      link: "/dashboard/leaves"
    });
  }

  // Open complaints
  const openComplaints = filteredComplaints.filter(c => c.status !== 'Resolved');
  if (openComplaints.length > 0) {
    alerts.push({
      priority: "Urgent",
      message: `${openComplaints.length} open complaints require resolution.`,
      actionLabel: "Resolve Complaints",
      link: "/dashboard/complaints"
    });
  }

  // Assets requiring maintenance
  const brokenAssets = filteredAssets.filter(a => a.status === 'Broken' || a.status === 'Needs Repair');
  if (brokenAssets.length > 0) {
    alerts.push({
      priority: "Upcoming",
      message: `${brokenAssets.length} room assets reported broken or needing repair.`,
      actionLabel: "Audit Assets",
      link: "/dashboard/assets"
    });
  }

  // Expiry alerts
  if (subscription && subscription.expiry_date) {
    const daysToExpiry = Math.round((new Date(subscription.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 30) {
      alerts.push({
        priority: "Urgent",
        message: `Your SaaS subscription plan "${subscription.plan_name}" expires in ${daysToExpiry} days.`,
        actionLabel: "Renew Plan",
        link: "/dashboard/settings"
      });
    }
  }

  // Daily Operations Snapshot
  const checkinsToday = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.move_in_date === todayStr);
  const collectionsToday = transactions.filter(t => activePropertyIds.includes(t.property_id) && t.type === 'Income' && t.status === 'Completed' && t.date === todayStr);
  const totalCollectionsToday = collectionsToday.reduce((sum, t) => sum + t.amount, 0);
  const visitorsInside = filteredVisitors.filter(v => !v.checkout_time || v.checkout_time === 'N/A');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      
      {/* Top Filter Bar Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 700 }}>SELECT OUTLET</label>
            <select 
              value={selectedPropertyId} 
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontWeight: 600, outline: 'none' }}
            >
              <option value="all">All Outlets (Consolidated)</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 700 }}>DATE FILTER</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontWeight: 600, outline: 'none' }}
            >
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="All">All Time</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/room-board">
            <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <FAIcon icon="key" /> View Full Room Board
            </button>
          </Link>
          <Link href="/dashboard/tenants">
            <button style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <FAIcon icon="user-plus" /> Quick Add Tenant
            </button>
          </Link>
        </div>
      </div>

      {/* Main summary cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Total Outlets</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{totalOutletsCount}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Total Beds Capacity</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{totalBeds}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Occupancy Rate</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
            {occupancyRate}% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>({occupiedBeds} occupied / {vacantBeds} vacant)</span>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Expected Rent</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>₹{expectedRent.toLocaleString()}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Collected Rent</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>₹{rentCollected.toLocaleString()}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Pending Dues</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>₹{pendingDues.toLocaleString()}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Recorded Expenses</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>₹{monthlyExpenses.toLocaleString()}</div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 6px' }}>Net Income</p>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: netIncome >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            ₹{netIncome.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Main Split Layout: Table vs Attention board */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Outlet comparison and Daily ops */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Comparison Table */}
          <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="chart-bar" style={{ color: 'var(--primary)' }} /> Outlet Performance Comparison
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Outlet Name</th>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Occupancy</th>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Rent Collected</th>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Pending Dues</th>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Expenses</th>
                    <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)' }}>Open Complaints</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => {
                    const pRooms = rooms.filter(r => r.property_id === p.id);
                    const pTenants = tenants.filter(t => t.property_id === p.id && t.status === 'Active');
                    const pBeds = pRooms.reduce((sum, r) => sum + r.capacity, 0);
                    const pOcc = pBeds > 0 ? Math.round((pTenants.length / pBeds) * 100) : 0;
                    
                    const pTx = transactions.filter(t => t.property_id === p.id && isDateInRange(t.date));
                    const pColl = pTx.filter(t => t.type === 'Income' && t.category === 'Rent' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
                    const pDues = pTx.filter(t => t.type === 'Income' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
                    const pExp = pTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
                    
                    const pCompl = complaints.filter(c => c.property_id === p.id && c.status !== 'Resolved').length;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 700 }}>
                          <button 
                            onClick={() => {
                              setSelectedPropertyId(p.id);
                              // switch active property cookie via standard click
                              document.cookie = `activePropertyId=${p.id}; path=/`;
                            }}
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
                          >
                            {p.name}
                          </button>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{pOcc}%</td>
                        <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 600 }}>₹{pColl.toLocaleString()}</td>
                        <td style={{ padding: '1rem', color: 'var(--danger)', fontWeight: 600 }}>₹{pDues.toLocaleString()}</td>
                        <td style={{ padding: '1rem', color: 'var(--danger)' }}>₹{pExp.toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                          {pCompl > 0 ? (
                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{pCompl} open</span>
                          ) : (
                            <span style={{ color: 'var(--success)' }}>None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily operations snapshot */}
          <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="calendar-day" style={{ color: 'var(--primary)' }} /> Today's Operations Snapshot
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              
              <div style={{ background: 'rgba(30,72,119,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>NEW CHECK-INS TODAY</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{checkinsToday.length}</span>
              </div>

              <div style={{ background: 'rgba(30,72,119,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>COLLECTIONS TODAY</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>₹{totalCollectionsToday.toLocaleString()}</span>
              </div>

              <div style={{ background: 'rgba(30,72,119,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VISITORS INSIDE NOW</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{visitorsInside.length}</span>
              </div>

              <div style={{ background: 'rgba(30,72,119,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>EMPLOYEES ON DUTY</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{employees.length}</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Alerts and Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Attention Required Alerts */}
          <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="circle-exclamation" style={{ color: 'var(--danger)' }} /> Attention Required
            </h3>
            
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <FAIcon icon="circle-check" style={{ color: 'var(--success)', fontSize: '32px', display: 'block', margin: '0 auto 0.5rem' }} />
                All operations running smoothly! No urgent actions.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {alerts.map((alert, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '10px', 
                      borderLeft: `4px solid ${alert.priority === 'Urgent' ? 'var(--danger)' : alert.priority === 'Due Today' ? 'var(--warning)' : 'var(--primary)'}`,
                      background: 'rgba(255,255,255,0.02)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: alert.priority === 'Urgent' ? 'rgba(230, 43, 57, 0.15)' : alert.priority === 'Due Today' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 72, 119, 0.15)',
                        color: alert.priority === 'Urgent' ? 'var(--danger)' : alert.priority === 'Due Today' ? 'var(--warning)' : 'var(--primary)',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {alert.priority}
                      </span>
                      <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 500, color: 'var(--foreground)' }}>{alert.message}</p>
                    </div>
                    <Link href={alert.link}>
                      <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {alert.actionLabel}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FAIcon icon="wand-magic-sparkles" style={{ color: 'var(--primary)' }} /> Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              
              <Link href="/dashboard/tenants">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="user-plus" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Tenant</span>
                </button>
              </Link>

              <Link href="/dashboard/room-board">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="key" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Assign Room</span>
                </button>
              </Link>

              <Link href="/dashboard/dues">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="indian-rupee-sign" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Record Rent</span>
                </button>
              </Link>

              <Link href="/dashboard/finances">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="file-invoice-dollar" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Expense</span>
                </button>
              </Link>

              <Link href="/dashboard/visitors">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="user-clock" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Visitor</span>
                </button>
              </Link>

              <Link href="/dashboard/complaints">
                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <FAIcon icon="circle-question" style={{ fontSize: '18px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Complaint</span>
                </button>
              </Link>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
