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
  const [sortField, setSortField] = useState("occupancy"); // "name", "occupancy", "collected", "dues", "expenses", "complaints"
  const [sortAsc, setSortAsc] = useState(false);

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

  // Active scoping
  const isSingleOutlet = properties.length === 1;
  const activePropertyIds = selectedPropertyId === 'all' 
    ? properties.map(p => p.id) 
    : [selectedPropertyId];

  const currentPropertyObj = properties.find(p => p.id === selectedPropertyId);

  // Filtered operational datasets
  const filteredRooms = rooms.filter(r => activePropertyIds.includes(r.property_id));
  const filteredTenants = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === 'Active');
  const filteredTx = transactions.filter(t => activePropertyIds.includes(t.property_id) && isDateInRange(t.date));
  const filteredComplaints = complaints.filter(c => activePropertyIds.includes(c.property_id));
  const filteredLeaves = leaves.filter(l => activePropertyIds.includes(l.property_id));
  const filteredVisitors = visitors.filter(v => activePropertyIds.includes(v.property_id));
  const filteredAssets = assets.filter(a => activePropertyIds.includes(a.property_id));

  // Key Load-Bearing Metrics
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

  // Rent Financial Relationship progress bar percentages
  const totalRentBase = Math.max(expectedRent, rentCollected + pendingDues, 1);
  const collectedPct = Math.min(Math.round((rentCollected / totalRentBase) * 100), 100);
  const pendingPct = Math.min(Math.round((pendingDues / totalRentBase) * 100), 100 - collectedPct);

  // Attention Required Alerts Pipeline
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
      icon: "circle-exclamation",
      message: `${overdueTenants.length} tenants have overdue rent payments.`,
      actionLabel: "Collect Dues",
      link: "/dashboard/dues"
    });
  }

  // Pending leave requests
  const pendingLeaves = filteredLeaves.filter(l => l.status === 'Pending');
  if (pendingLeaves.length > 0) {
    alerts.push({
      priority: "Action Due",
      icon: "calendar-check",
      message: `${pendingLeaves.length} pending leave requests require warden approval.`,
      actionLabel: "Approve Leaves",
      link: "/dashboard/leaves"
    });
  }

  // Open complaints
  const openComplaints = filteredComplaints.filter(c => c.status !== 'Resolved');
  if (openComplaints.length > 0) {
    alerts.push({
      priority: "Urgent",
      icon: "triangle-exclamation",
      message: `${openComplaints.length} open maintenance complaints require resolution.`,
      actionLabel: "Resolve Complaints",
      link: "/dashboard/complaints"
    });
  }

  // Assets requiring repair
  const brokenAssets = filteredAssets.filter(a => a.status === 'Broken' || a.status === 'Needs Repair');
  if (brokenAssets.length > 0) {
    alerts.push({
      priority: "Maintenance",
      icon: "screwdriver-wrench",
      message: `${brokenAssets.length} room assets reported broken or needing repair.`,
      actionLabel: "Audit Assets",
      link: "/dashboard/assets"
    });
  }

  // SaaS Plan Expiry Warning (Non-scare tactic, informative)
  if (subscription && subscription.expiry_date) {
    const daysToExpiry = Math.round((new Date(subscription.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 30) {
      alerts.push({
        priority: "SaaS Plan",
        icon: "shield-halved",
        message: `Your "${subscription.plan_name}" SaaS plan subscription expires in ${daysToExpiry} days (${subscription.expiry_date}).`,
        actionLabel: "Renew Plan",
        link: "/dashboard/settings"
      });
    }
  }

  // Operations Snapshot
  const checkinsToday = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.move_in_date === todayStr);
  const collectionsToday = transactions.filter(t => activePropertyIds.includes(t.property_id) && t.type === 'Income' && t.status === 'Completed' && t.date === todayStr);
  const totalCollectionsToday = collectionsToday.reduce((sum, t) => sum + t.amount, 0);
  const visitorsInside = filteredVisitors.filter(v => !v.checkout_time || v.checkout_time === 'N/A');

  // Handle Sort for Performance Matrix
  const sortedProperties = [...properties].map(p => {
    const pRooms = rooms.filter(r => r.property_id === p.id);
    const pTenants = tenants.filter(t => t.property_id === p.id && t.status === 'Active');
    const pBeds = pRooms.reduce((sum, r) => sum + r.capacity, 0);
    const pOcc = pBeds > 0 ? Math.round((pTenants.length / pBeds) * 100) : 0;
    
    const pTx = transactions.filter(t => t.property_id === p.id && isDateInRange(t.date));
    const pColl = pTx.filter(t => t.type === 'Income' && t.category === 'Rent' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const pDues = pTx.filter(t => t.type === 'Income' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
    const pExp = pTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const pCompl = complaints.filter(c => c.property_id === p.id && c.status !== 'Resolved').length;

    return {
      ...p,
      pBeds,
      pTenantsCount: pTenants.length,
      pOcc,
      pColl,
      pDues,
      pExp,
      pCompl
    };
  }).sort((a, b) => {
    let valA = a.name;
    let valB = b.name;
    if (sortField === 'occupancy') { valA = a.pOcc; valB = b.pOcc; }
    else if (sortField === 'collected') { valA = a.pColl; valB = b.pColl; }
    else if (sortField === 'dues') { valA = a.pDues; valB = b.pDues; }
    else if (sortField === 'expenses') { valA = a.pExp; valB = b.pExp; }
    else if (sortField === 'complaints') { valA = a.pCompl; valB = b.pCompl; }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. TOP OUTLET SELECTOR CONTROL & SCOPE BAR */}
      <div className="glass" style={{ 
        padding: '1.25rem 1.5rem', 
        borderRadius: '16px', 
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>
              CURRENT OUTLET SCOPE
            </span>

            {isSingleOutlet ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 0.85rem', background: 'rgba(30, 72, 119, 0.06)', borderRadius: '8px', border: '1px solid rgba(30, 72, 119, 0.15)' }}>
                <FAIcon icon="building" style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                  {properties[0]?.name || "Main PG"}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'var(--primary)', color: 'white', textTransform: 'uppercase' }}>
                  Single Outlet
                </span>
              </div>
            ) : (
              <select 
                value={selectedPropertyId} 
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPropertyId(val);
                  document.cookie = `activePropertyId=${val}; path=/`;
                }}
                style={{ 
                  padding: '0.55rem 1.25rem', 
                  borderRadius: '10px', 
                  border: '1.5px solid var(--primary)', 
                  background: 'var(--card-bg)', 
                  color: 'var(--primary)', 
                  fontWeight: 750, 
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(30,72,119,0.06)'
                }}
              >
                <option value="all">🏢 All Outlets (Consolidated - {properties.length} PGs)</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>📍 {p.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>
              TIMEFRAME FILTER
            </span>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ 
                padding: '0.55rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                background: 'var(--card-bg)', 
                color: 'var(--foreground)', 
                fontWeight: 650, 
                fontSize: '0.85rem',
                outline: 'none' 
              }}
            >
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="All">All Time</option>
            </select>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/dashboard/room-board">
            <button style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0.65rem 1.25rem', 
              borderRadius: '99px', 
              cursor: 'pointer', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(30, 72, 119, 0.2)'
            }}>
              <FAIcon icon="key" /> Key Rack Pegboard
            </button>
          </Link>
        </div>

      </div>


      {/* 2. EXECUTIVE METRICS ROW & FINANCIAL RELATIONSHIP BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total Outlets */}
        <div className="glass" style={{ padding: '1.35rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Total Outlets
          </span>
          <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
            {totalOutletsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {isSingleOutlet ? "Standalone Location" : `Managing ${properties.length} PG Outlets`}
          </span>
        </div>

        {/* Occupancy Rate & Bed Ratio */}
        <div className="glass" style={{ padding: '1.35rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
              Occupancy Rate
            </span>
            <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 700, color: occupancyRate > 75 ? 'var(--success)' : 'var(--warning)' }}>
              {occupiedBeds}/{totalBeds} Beds
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>
            {occupancyRate}%
          </div>
          {/* Inline progress bar */}
          <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${occupancyRate}%`, height: '100%', background: 'var(--success)', borderRadius: '99px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        {/* Financial Progress Relationship Card (Collected vs Expected vs Dues) */}
        <div className="glass" style={{ padding: '1.35rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
              Rent Collection Progress
            </span>
            <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              Expected: ₹{expectedRent.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>COLLECTED</span>
              <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{rentCollected.toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PENDING DUES</span>
              <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                ₹{pendingDues.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Relationship multi-segment progress bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${collectedPct}%`, height: '100%', background: 'var(--success)', transition: 'width 0.5s ease' }} title={`Collected: ${collectedPct}%`}></div>
            <div style={{ width: `${pendingPct}%`, height: '100%', background: 'var(--danger)', transition: 'width 0.5s ease' }} title={`Pending Dues: ${pendingPct}%`}></div>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass" style={{ padding: '1.35rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Recorded Expenses
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>
            ₹{monthlyExpenses.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filteredTx.filter(t => t.type === 'Expense').length} Entries Logged
          </span>
        </div>

        {/* Net Cashflow */}
        <div className="glass" style={{ padding: '1.35rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Net Cashflow
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: netIncome >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            ₹{netIncome.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Collected Rent minus Expenses
          </span>
        </div>

      </div>


      {/* 3. TODAY'S OPERATIONS SNAPSHOT STRIP */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <FAIcon icon="clock-rotate-left" /> Today's Operations Snapshot ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '2px' }}>NEW CHECK-INS TODAY</span>
            <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{checkinsToday.length}</span>
          </div>

          <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '2px' }}>COLLECTIONS TODAY</span>
            <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>₹{totalCollectionsToday.toLocaleString()}</span>
          </div>

          <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '2px' }}>VISITORS INSIDE NOW</span>
            <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{visitorsInside.length}</span>
          </div>

          <div style={{ background: 'rgba(30,72,119,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '2px' }}>EMPLOYEES ON DUTY</span>
            <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{employees.length}</span>
          </div>

        </div>
      </div>


      {/* 4. MAIN SPLIT LAYOUT: PERFORMANCE MATRIX vs ATTENTION REQUIRED BOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Sortable Outlet Performance Matrix */}
        <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 750, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FAIcon icon="chart-simple" style={{ color: 'var(--primary)' }} /> Outlet Performance Matrix
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Sort and compare occupancy, rent collections, and open complaints across properties.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th 
                    onClick={() => toggleSort('name')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Outlet Name {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    onClick={() => toggleSort('occupancy')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Occupancy {sortField === 'occupancy' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    onClick={() => toggleSort('collected')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Collected {sortField === 'collected' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    onClick={() => toggleSort('dues')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Pending Dues {sortField === 'dues' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    onClick={() => toggleSort('expenses')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Expenses {sortField === 'expenses' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    onClick={() => toggleSort('complaints')}
                    style={{ padding: '0.65rem 0.75rem', color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Complaints {sortField === 'complaints' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProperties.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>
                      <button 
                        onClick={() => {
                          setSelectedPropertyId(p.id);
                          document.cookie = `activePropertyId=${p.id}; path=/`;
                        }}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        {p.name}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div className="tabular-nums" style={{ fontWeight: 700, marginBottom: '2px' }}>
                        {p.pOcc}% <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({p.pTenantsCount}/{p.pBeds})</span>
                      </div>
                      <div style={{ width: '80px', height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.pOcc}%`, height: '100%', background: 'var(--success)' }}></div>
                      </div>
                    </td>
                    <td className="tabular-nums" style={{ padding: '0.85rem 0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                      ₹{p.pColl.toLocaleString()}
                    </td>
                    <td className="tabular-nums" style={{ padding: '0.85rem 0.75rem', color: 'var(--danger)', fontWeight: 700 }}>
                      ₹{p.pDues.toLocaleString()}
                    </td>
                    <td className="tabular-nums" style={{ padding: '0.85rem 0.75rem', color: 'var(--foreground)' }}>
                      ₹{p.pExp.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      {p.pCompl > 0 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 700 }} className="tabular-nums">
                          ⚠️ {p.pCompl} open
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          ✓ None
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Right: Prioritized Attention-Required Board */}
        <div className="glass" style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <FAIcon icon="circle-exclamation" style={{ color: 'var(--danger)' }} /> Attention-Required Board
          </h3>
          
          {alerts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2.5rem 1rem', 
              color: 'var(--text-muted)', 
              fontSize: '0.9rem',
              background: 'rgba(40, 167, 69, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(40, 167, 69, 0.15)'
            }}>
              <FAIcon icon="circle-check" style={{ color: 'var(--success)', fontSize: '36px', display: 'block', margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 4px', color: 'var(--success)', fontWeight: 700 }}>All Operations Running Smoothly</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>No overdue rent payments, pending leaves, or open complaints require action.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    borderLeft: `4px solid ${alert.priority === 'Urgent' ? 'var(--danger)' : alert.priority === 'Action Due' ? 'var(--warning)' : 'var(--primary)'}`,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <FAIcon icon={alert.icon} style={{ 
                        color: alert.priority === 'Urgent' ? 'var(--danger)' : alert.priority === 'Action Due' ? 'var(--warning)' : 'var(--primary)',
                        fontSize: '0.85rem'
                      }} />
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: alert.priority === 'Urgent' ? 'rgba(220, 38, 38, 0.12)' : alert.priority === 'Action Due' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 72, 119, 0.15)',
                        color: alert.priority === 'Urgent' ? 'var(--danger)' : alert.priority === 'Action Due' ? 'var(--warning)' : 'var(--primary)'
                      }}>
                        {alert.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 550, color: 'var(--foreground)' }}>{alert.message}</p>
                  </div>
                  <Link href={alert.link}>
                    <button style={{ 
                      background: 'var(--primary)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '6px 14px', 
                      borderRadius: '99px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(30,72,119,0.15)'
                    }}>
                      {alert.actionLabel} →
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
