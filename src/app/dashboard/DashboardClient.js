"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  DoorOpen, 
  Users, 
  IndianRupee, 
  Receipt, 
  AlertCircle, 
  CalendarRange, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  Sparkles,
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";
import styles from "./page.module.css";

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
  const [dateFilter, setDateFilter] = useState("This Month"); // "Today" | "This Month" | "Last Month" | "All"
  const [sortField, setSortField] = useState("occupancy");
  const [sortAsc, setSortAsc] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();

  // Date filtering helper
  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (dateFilter === "Today") {
      return date.toDateString() === now.toDateString();
    } else if (dateFilter === "This Month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (dateFilter === "Last Month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    return true; // All
  };

  // Active property scoping
  const isAllProperties = selectedPropertyId === "all";
  const activePropertyIds = isAllProperties 
    ? properties.map(p => p.id) 
    : [selectedPropertyId];

  const currentPropertyObj = properties.find(p => p.id === selectedPropertyId);

  // Filtered operational datasets
  const filteredRooms = rooms.filter(r => activePropertyIds.includes(r.property_id));
  const filteredTenants = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === "Active");
  const filteredTx = transactions.filter(t => activePropertyIds.includes(t.property_id) && isDateInRange(t.date));
  const filteredComplaints = complaints.filter(c => activePropertyIds.includes(c.property_id));
  const filteredLeaves = leaves.filter(l => activePropertyIds.includes(l.property_id));
  const filteredVisitors = visitors.filter(v => activePropertyIds.includes(v.property_id));
  const filteredAssets = assets.filter(a => activePropertyIds.includes(a.property_id));

  // Bed & Occupancy calculations
  const totalBeds = filteredRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const occupiedBeds = filteredTenants.length;
  const vacantBeds = Math.max(totalBeds - occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Financial calculations
  const expectedRent = filteredTx
    .filter(t => t.type === "Income" && t.category === "Rent")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const rentCollected = filteredTx
    .filter(t => t.type === "Income" && t.category === "Rent" && t.status === "Completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingDues = filteredTx
    .filter(t => t.type === "Income" && t.status === "Pending")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const monthlyExpenses = filteredTx
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netIncome = rentCollected - monthlyExpenses;
  const totalRentBase = Math.max(expectedRent, rentCollected + pendingDues, 1);
  const collectedPct = Math.min(Math.round((rentCollected / totalRentBase) * 100), 100);

  // Actionable Triage Queue (Items requiring owner follow-up)
  const overdueTenants = transactions.filter(t => 
    activePropertyIds.includes(t.property_id) &&
    t.type === "Income" && 
    t.status === "Pending" && 
    new Date(t.date) < new Date()
  );

  const pendingLeaves = filteredLeaves.filter(l => l.status === "Pending");
  const openComplaints = filteredComplaints.filter(c => c.status !== "Resolved");
  const brokenAssets = filteredAssets.filter(a => a.status === "Broken" || a.status === "Needs Repair");

  const alerts = [];
  if (overdueTenants.length > 0) {
    alerts.push({
      id: "overdue",
      category: "Dues",
      badgeClass: styles.badgeAmber,
      message: `${overdueTenants.length} tenants have overdue rent payments requiring collection.`,
      actionLabel: "Collect Dues",
      link: "/dashboard/dues"
    });
  }

  if (pendingLeaves.length > 0) {
    alerts.push({
      id: "leaves",
      category: "Leaves",
      badgeClass: styles.badgeBlue,
      message: `${pendingLeaves.length} tenant leave requests awaiting warden approval.`,
      actionLabel: "Review Leaves",
      link: "/dashboard/leaves"
    });
  }

  if (openComplaints.length > 0) {
    alerts.push({
      id: "complaints",
      category: "Maintenance",
      badgeClass: styles.badgeRose,
      message: `${openComplaints.length} maintenance issues reported by residents.`,
      actionLabel: "Resolve Tickets",
      link: "/dashboard/complaints"
    });
  }

  if (brokenAssets.length > 0) {
    alerts.push({
      id: "assets",
      category: "Inventory",
      badgeClass: styles.badgeAmber,
      message: `${brokenAssets.length} room inventory items flagged as broken or damaged.`,
      actionLabel: "Inspect Assets",
      link: "/dashboard/assets"
    });
  }

  // Today's Operations Snapshot
  const checkinsToday = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.move_in_date === todayStr);
  const collectionsToday = transactions.filter(t => activePropertyIds.includes(t.property_id) && t.type === "Income" && t.status === "Completed" && t.date === todayStr);
  const totalCollectionsToday = collectionsToday.reduce((sum, t) => sum + (t.amount || 0), 0);
  const visitorsInside = filteredVisitors.filter(v => !v.checkout_time || v.checkout_time === "N/A");

  // Multi-Outlet Comparison Matrix
  const sortedProperties = [...properties].map(p => {
    const pRooms = rooms.filter(r => r.property_id === p.id);
    const pTenants = tenants.filter(t => t.property_id === p.id && t.status === "Active");
    const pBeds = pRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const pOcc = pBeds > 0 ? Math.round((pTenants.length / pBeds) * 100) : 0;
    
    const pTx = transactions.filter(t => t.property_id === p.id && isDateInRange(t.date));
    const pColl = pTx.filter(t => t.type === "Income" && t.category === "Rent" && t.status === "Completed").reduce((sum, t) => sum + (t.amount || 0), 0);
    const pDues = pTx.filter(t => t.type === "Income" && t.status === "Pending").reduce((sum, t) => sum + (t.amount || 0), 0);
    const pCompl = complaints.filter(c => c.property_id === p.id && c.status !== "Resolved").length;

    return {
      ...p,
      pBeds,
      pTenantsCount: pTenants.length,
      pOcc,
      pColl,
      pDues,
      pCompl
    };
  }).sort((a, b) => {
    let valA = a.name;
    let valB = b.name;
    if (sortField === "occupancy") { valA = a.pOcc; valB = b.pOcc; }
    else if (sortField === "collected") { valA = a.pColl; valB = b.pColl; }
    else if (sortField === "dues") { valA = a.pDues; valB = b.pDues; }
    else if (sortField === "complaints") { valA = a.pCompl; valB = b.pCompl; }

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
    <div className={styles.container}>

      {/* 1. TOP CONTROL BAR */}
      <section className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumbs}>
            <Building2 size={13} aria-hidden="true" />
            <span>{isAllProperties ? "All Outlets Aggregated" : (currentPropertyObj?.name || "Selected Outlet")}</span>
            <span>/</span>
            <span>Overview</span>
          </div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageSubtitle}>
            Real-time occupancy, collections, dues triage, and operational metrics.
          </p>
        </div>

        <div className={styles.controlsArea}>
          {/* Segmented Date Range Filter */}
          <div className={styles.dateFilterGroup} role="group" aria-label="Date range selector">
            {["Today", "This Month", "Last Month", "All"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setDateFilter(filter)}
                className={`${styles.dateFilterBtn} ${dateFilter === filter ? styles.dateFilterBtnActive : ""}`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <Link href="/dashboard/tenants" className={styles.actionBtnPrimary}>
            <Plus size={15} />
            <span>Add Tenant</span>
          </Link>
          <Link href="/dashboard/dues" className={styles.actionBtnSecondary}>
            <Receipt size={15} />
            <span>Collect Dues</span>
          </Link>
        </div>
      </section>

      {/* 2. THE 4 METRIC PULSE CARDS */}
      <section className={styles.metricsGrid} aria-label="Key operational metrics">
        {/* Metric 1: Bed Occupancy */}
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Bed Occupancy</span>
              <span className={`${styles.badge} ${occupancyRate >= 80 ? styles.badgeEmerald : styles.badgeAmber}`}>
                {occupiedBeds}/{totalBeds} Beds
              </span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{occupancyRate}%</span>
            </div>
            <div className={styles.metricFooter}>
              <span>{vacantBeds} vacant beds available</span>
            </div>
          </div>
          <div className={styles.miniProgressBar} aria-hidden="true">
            <div 
              className={styles.miniProgressFill} 
              style={{ width: `${occupancyRate}%`, backgroundColor: occupancyRate >= 80 ? "#10B981" : "#F59E0B" }} 
            />
          </div>
        </div>

        {/* Metric 2: Net Rent Collected */}
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Rent Collected</span>
              <span className={`${styles.badge} ${styles.badgeBlue}`}>
                {collectedPct}% Target
              </span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`} suppressHydrationWarning>
                ₹{rentCollected.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.metricFooter}>
              <span suppressHydrationWarning>of ₹{totalRentBase.toLocaleString("en-IN")} expected</span>
            </div>
          </div>
          <div className={styles.miniProgressBar} aria-hidden="true">
            <div 
              className={styles.miniProgressFill} 
              style={{ width: `${collectedPct}%`, backgroundColor: "#2563EB" }} 
            />
          </div>
        </div>

        {/* Metric 3: Pending Dues */}
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Pending Dues</span>
              <span className={`${styles.badge} ${pendingDues > 0 ? styles.badgeAmber : styles.badgeEmerald}`}>
                {overdueTenants.length} Overdue
              </span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`} style={{ color: pendingDues > 0 ? "#D97706" : "var(--foreground)" }} suppressHydrationWarning>
                ₹{pendingDues.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.metricFooter}>
              <span>{pendingDues > 0 ? "Requires collection follow-up" : "All tenant accounts settled"}</span>
            </div>
          </div>
          <div className={styles.miniProgressBar} aria-hidden="true">
            <div 
              className={styles.miniProgressFill} 
              style={{ width: `${Math.min(100 - collectedPct, 100)}%`, backgroundColor: pendingDues > 0 ? "#F59E0B" : "#10B981" }} 
            />
          </div>
        </div>

        {/* Metric 4: Operations & Service */}
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Open Maintenance</span>
              <span className={`${styles.badge} ${openComplaints.length > 0 ? styles.badgeRose : styles.badgeEmerald}`}>
                {openComplaints.length === 0 ? "All Clear" : `${openComplaints.length} Open`}
              </span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`} style={{ color: openComplaints.length > 0 ? "#E11D48" : "var(--foreground)" }}>
                {openComplaints.length}
              </span>
            </div>
            <div className={styles.metricFooter}>
              <span>{pendingLeaves.length} leaves pending • {visitorsInside.length} visitors</span>
            </div>
          </div>
          <div className={styles.miniProgressBar} aria-hidden="true">
            <div 
              className={styles.miniProgressFill} 
              style={{ width: openComplaints.length > 0 ? "60%" : "100%", backgroundColor: openComplaints.length > 0 ? "#E11D48" : "#10B981" }} 
            />
          </div>
        </div>
      </section>

      {/* 3. TWO-COLUMN OPERATIONAL LAYOUT */}
      <section className={styles.dashboardSplit}>
        
        {/* Left Column: Actionable Triage Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <AlertCircle size={17} style={{ color: "var(--primary)" }} />
                <span>Action Required Triage</span>
              </h2>
              <span className={styles.badge} style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}>
                {alerts.length} Items
              </span>
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                <CheckCircle2 size={32} style={{ color: "#10B981", margin: "0 auto 0.75rem", display: "block" }} />
                <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "0.25rem" }}>All Operations Clear</strong>
                <span>No overdue rents, pending leaves, or unresolved complaints at this time.</span>
              </div>
            ) : (
              <div className={styles.triageList}>
                {alerts.map((alert) => (
                  <div key={alert.id} className={styles.triageRow}>
                    <div className={styles.triageLeft}>
                      <span className={`${styles.badge} ${alert.badgeClass}`}>
                        {alert.category}
                      </span>
                      <span className={styles.triageText}>{alert.message}</span>
                    </div>
                    <Link href={alert.link} className={styles.triageBtn}>
                      <span>{alert.actionLabel}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Outlet Comparison Matrix (Shown when Aggregated View or multiple outlets exist) */}
          {properties.length > 1 && (
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Building2 size={17} style={{ color: "var(--primary)" }} />
                  <span>Outlets Performance Matrix</span>
                </h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {properties.length} Active Outlets
                </span>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.minimalTable}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("name")}>
                        Outlet Name
                      </th>
                      <th onClick={() => toggleSort("occupancy")} style={{ textAlign: "right" }}>
                        Occupancy
                      </th>
                      <th onClick={() => toggleSort("collected")} style={{ textAlign: "right" }}>
                        Collected
                      </th>
                      <th onClick={() => toggleSort("dues")} style={{ textAlign: "right" }}>
                        Dues
                      </th>
                      <th onClick={() => toggleSort("complaints")} style={{ textAlign: "right" }}>
                        Issues
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProperties.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPropertyId(p.id)}
                            style={{ background: "none", border: "none", color: "inherit", fontWeight: "inherit", cursor: "pointer", padding: 0, textAlign: "left" }}
                          >
                            {p.name}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular-nums">
                          <span className={`${styles.badge} ${p.pOcc >= 80 ? styles.badgeEmerald : styles.badgeAmber}`}>
                            {p.pOcc}% ({p.pTenantsCount}/{p.pBeds})
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }} className="tabular-nums" suppressHydrationWarning>
                          ₹{p.pColl.toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "right", color: p.pDues > 0 ? "#D97706" : "var(--text-muted)" }} className="tabular-nums" suppressHydrationWarning>
                          ₹{p.pDues.toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular-nums">
                          {p.pCompl > 0 ? (
                            <span className={`${styles.badge} ${styles.badgeRose}`}>{p.pCompl} Open</span>
                          ) : (
                            <span style={{ color: "#10B981" }}>0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today's Operations Velocity & Cashflow Snapshot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Today's Velocity Strip */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <TrendingUp size={17} style={{ color: "var(--primary)" }} />
                <span>Today&apos;s Velocity</span>
              </h2>
              <span className={styles.badge} style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}>
                Live
              </span>
            </div>

            <div className={styles.velocityStrip}>
              <div className={styles.velocityItem}>
                <span className={styles.velocityLabel}>Check-ins</span>
                <span className={`${styles.velocityVal} tabular-nums`}>{checkinsToday.length}</span>
              </div>
              <div className={styles.velocityItem}>
                <span className={styles.velocityLabel}>Collected</span>
                <span className={`${styles.velocityVal} tabular-nums`} style={{ fontSize: "1.05rem" }} suppressHydrationWarning>
                  ₹{totalCollectionsToday.toLocaleString("en-IN")}
                </span>
              </div>
              <div className={styles.velocityItem}>
                <span className={styles.velocityLabel}>Visitors</span>
                <span className={`${styles.velocityVal} tabular-nums`}>{visitorsInside.length}</span>
              </div>
            </div>
          </div>

          {/* Operating Financial Summary */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <IndianRupee size={17} style={{ color: "var(--primary)" }} />
                <span>P&amp;L Financial Snapshot</span>
              </h2>
              <Link href="/dashboard/finances" style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600 }}>
                Ledger →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Expected Gross Rent</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }} suppressHydrationWarning>
                  ₹{expectedRent.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Collections Received</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "#10B981" }} suppressHydrationWarning>
                  +₹{rentCollected.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Operating Expenses</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "#E11D48" }} suppressHydrationWarning>
                  -₹{monthlyExpenses.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ height: "1px", background: "var(--border)", margin: "0.25rem 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem" }}>
                <span style={{ fontWeight: 700, color: "var(--foreground)" }}>Net Operating Cashflow</span>
                <span className="tabular-nums" style={{ fontWeight: 800, color: netIncome >= 0 ? "var(--primary)" : "#E11D48", fontSize: "1.1rem" }} suppressHydrationWarning>
                  ₹{netIncome.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support / SaaS Plan status */}
          {subscription && (
            <div style={{ padding: "0.85rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={15} style={{ color: "var(--primary)" }} />
                <span>Plan: <strong>{subscription.plan_name || "Pro"}</strong></span>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                Expires: {subscription.expiry_date || "Active"}
              </span>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
