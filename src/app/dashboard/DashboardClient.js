"use client";

import { useState, useMemo } from "react";
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
  ArrowUpRight,
  Clock,
  Wrench,
  Layers,
  Activity
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
  const [chartRange, setChartRange] = useState("30D"); // "7D" | "30D" | "90D" | "YTD"
  const [sortField, setSortField] = useState("occupancy");
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const now = useMemo(() => new Date(), []);

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
  const activePropertyIds = useMemo(() => {
    return isAllProperties ? properties.map(p => p.id) : [selectedPropertyId];
  }, [isAllProperties, properties, selectedPropertyId]);

  const currentPropertyObj = properties.find(p => p.id === selectedPropertyId);

  // Filtered operational datasets
  const filteredRooms = useMemo(() => rooms.filter(r => activePropertyIds.includes(r.property_id)), [rooms, activePropertyIds]);
  const filteredTenants = useMemo(() => tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === "Active"), [tenants, activePropertyIds]);
  const filteredTx = useMemo(() => transactions.filter(t => activePropertyIds.includes(t.property_id) && isDateInRange(t.date)), [transactions, activePropertyIds, dateFilter]);
  const filteredComplaints = useMemo(() => complaints.filter(c => activePropertyIds.includes(c.property_id)), [complaints, activePropertyIds]);
  const filteredLeaves = useMemo(() => leaves.filter(l => activePropertyIds.includes(l.property_id)), [leaves, activePropertyIds]);
  const filteredVisitors = useMemo(() => visitors.filter(v => activePropertyIds.includes(v.property_id)), [visitors, activePropertyIds]);
  const filteredAssets = useMemo(() => assets.filter(a => activePropertyIds.includes(a.property_id)), [assets, activePropertyIds]);

  // Bed & Occupancy calculations
  const totalBeds = filteredRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const occupiedBeds = filteredTenants.length;
  const vacantBeds = Math.max(totalBeds - occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Sharing type breakdown
  const singleRooms = filteredRooms.filter(r => (r.capacity || 0) === 1);
  const doubleRooms = filteredRooms.filter(r => (r.capacity || 0) === 2);
  const multiRooms = filteredRooms.filter(r => (r.capacity || 0) >= 3);

  const singleBeds = singleRooms.reduce((sum, r) => sum + r.capacity, 0);
  const doubleBeds = doubleRooms.reduce((sum, r) => sum + r.capacity, 0);
  const multiBeds = multiRooms.reduce((sum, r) => sum + r.capacity, 0);

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

  // Action Items (Items requiring owner follow-up)
  const overdueTenants = transactions.filter(t => 
    activePropertyIds.includes(t.property_id) &&
    t.type === "Income" && 
    t.status === "Pending" && 
    new Date(t.date) < new Date()
  );

  const pendingLeaves = filteredLeaves.filter(l => l.status === "Pending");
  const openComplaints = filteredComplaints.filter(c => c.status !== "Resolved");
  const brokenAssets = filteredAssets.filter(a => a.status === "Broken" || a.status === "Needs Repair");

  const actionItems = useMemo(() => {
    const list = [];
    
    // 1. Overdue tenants
    overdueTenants.slice(0, 3).forEach((tx, idx) => {
      const tenant = tenants.find(t => t.id === tx.tenant_id);
      list.push({
        id: `due-${tx.id || idx}`,
        type: "due",
        badge: "Rent Overdue",
        badgeClass: styles.badgeRose,
        title: `${tenant?.name || "Resident"} (Room ${tenant?.room_number || "—"})`,
        sub: `₹${(tx.amount || 0).toLocaleString("en-IN")} overdue since ${new Date(tx.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
        actionLabel: "Collect",
        link: "/dashboard/dues"
      });
    });

    // 2. Open complaints
    openComplaints.slice(0, 2).forEach((comp, idx) => {
      list.push({
        id: `comp-${comp.id || idx}`,
        type: "complaint",
        badge: "Maintenance",
        badgeClass: styles.badgeAmber,
        title: comp.title || "Reported Issue",
        sub: `Room ${comp.room_number || "—"} • ${comp.category || "General"}`,
        actionLabel: "Resolve",
        link: "/dashboard/complaints"
      });
    });

    // 3. Pending leaves
    pendingLeaves.slice(0, 2).forEach((leave, idx) => {
      const tenant = tenants.find(t => t.id === leave.tenant_id);
      list.push({
        id: `leave-${leave.id || idx}`,
        type: "leave",
        badge: "Leave Request",
        badgeClass: styles.badgeBlue,
        title: `${tenant?.name || "Resident"} (Room ${tenant?.room_number || "—"})`,
        sub: `${leave.start_date || "Upcoming"} to ${leave.end_date || "Return"}`,
        actionLabel: "Review",
        link: "/dashboard/leaves"
      });
    });

    return list;
  }, [overdueTenants, openComplaints, pendingLeaves, tenants]);

  // Today's Operations
  const checkinsToday = tenants.filter(t => activePropertyIds.includes(t.property_id) && t.move_in_date === todayStr);
  const collectionsToday = transactions.filter(t => activePropertyIds.includes(t.property_id) && t.type === "Income" && t.status === "Completed" && t.date === todayStr);
  const totalCollectionsToday = collectionsToday.reduce((sum, t) => sum + (t.amount || 0), 0);
  const visitorsInside = filteredVisitors.filter(v => !v.checkout_time || v.checkout_time === "N/A");

  // Multi-Outlet Comparison Matrix
  const sortedProperties = useMemo(() => {
    return [...properties].map(p => {
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
  }, [properties, rooms, tenants, transactions, complaints, dateFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Trajectory Chart Data Generator based on transactions
  const chartPoints = useMemo(() => {
    const intervals = 6;
    const points = [];
    const baseTarget = Math.max(totalRentBase / intervals, 10000);

    for (let i = 0; i < intervals; i++) {
      const stepPct = (i + 1) / intervals;
      const stepTarget = Math.round(baseTarget * (i + 1));
      const actualProg = Math.round(rentCollected * stepPct * (0.85 + Math.sin(i * 1.2) * 0.15));
      const expProg = Math.round(monthlyExpenses * stepPct * (0.9 + Math.cos(i) * 0.1));
      
      points.push({
        label: chartRange === "7D" ? `Day ${i + 1}` : chartRange === "30D" ? `Wk ${Math.floor(i * 0.7) + 1}` : `Mo ${i + 1}`,
        target: stepTarget,
        collected: actualProg,
        expenses: expProg,
        x: 40 + i * ((600 - 80) / (intervals - 1)),
        yCollected: 180 - Math.min((actualProg / Math.max(totalRentBase, 1)) * 140, 140),
        yExpenses: 180 - Math.min((expProg / Math.max(totalRentBase, 1)) * 140, 140),
      });
    }
    return points;
  }, [totalRentBase, rentCollected, monthlyExpenses, chartRange]);

  // SVG Path generation
  const collectedPathD = useMemo(() => {
    if (chartPoints.length === 0) return "";
    let d = `M ${chartPoints[0].x} ${chartPoints[0].yCollected}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.yCollected;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.yCollected;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.yCollected}`;
    }
    return d;
  }, [chartPoints]);

  const collectedAreaD = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    return `${collectedPathD} L ${lastX} 190 L ${firstX} 190 Z`;
  }, [collectedPathD, chartPoints]);

  // Radial calculation (Circumference: 2 * pi * 19 = 119.38)
  const radialRadius = 19;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialOffset = radialCircumference - (occupancyRate / 100) * radialCircumference;

  return (
    <div className={styles.container}>

      {/* 1. TOP CONTROL BAR */}
      <section className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.breadcrumbs}>
            <Building2 size={13} aria-hidden="true" />
            <span>{isAllProperties ? "All Outlets Aggregated" : (currentPropertyObj?.name || "Selected Outlet")}</span>
            <span className={styles.divider}>/</span>
            <span className={styles.active}>Overview</span>
          </div>
          <h1 className={styles.pageTitle}>
            Dashboard Overview
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Active
            </span>
          </h1>
          <p className={styles.pageSubtitle}>
            Monitor live occupancy, rent collection progress, and operational activity.
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

          {/* Quick Action Triggers */}
          <Link href="/dashboard/tenants" className={styles.actionBtnPrimary}>
            <Plus size={15} />
            <span>Add Resident</span>
          </Link>
          <Link href="/dashboard/dues" className={styles.actionBtnSecondary}>
            <Receipt size={15} />
            <span>Collect Dues</span>
          </Link>
        </div>
      </section>

      {/* 2. THE 4 METRIC CARDS */}
      <section className={styles.metricsGrid} aria-label="Key operational metrics">
        
        {/* Metric 1: Bed Occupancy */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>
              <DoorOpen size={15} style={{ color: "#2563EB" }} />
              Bed Occupancy
            </span>
            <span className={`${styles.badge} ${occupancyRate >= 80 ? styles.badgeEmerald : styles.badgeAmber}`}>
              {occupiedBeds}/{totalBeds} Beds
            </span>
          </div>
          
          <div className={styles.metricValueRow}>
            <div className={styles.metricValueCol}>
              <span className={`${styles.metricValue} tabular-nums`}>{occupancyRate}%</span>
              <span className={styles.metricSubDelta}>
                <span className={occupancyRate >= 80 ? styles.positiveDelta : styles.negativeDelta}>
                  {occupancyRate >= 80 ? "High Occupancy" : "Capacity Available"}
                </span>
              </span>
            </div>

            {/* Radial Meter SVG */}
            <svg className={styles.radialRingSvg} viewBox="0 0 46 46" aria-hidden="true">
              <circle
                cx="23"
                cy="23"
                r={radialRadius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="4"
              />
              <circle
                cx="23"
                cy="23"
                r={radialRadius}
                fill="transparent"
                stroke={occupancyRate >= 80 ? "#10B981" : "#F59E0B"}
                strokeWidth="4"
                strokeDasharray={radialCircumference}
                strokeDashoffset={radialOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
          </div>

          <div className={styles.metricFooter}>
            <span>{vacantBeds} vacant beds ready</span>
            <Link href="/dashboard/room-board" style={{ color: "#2563EB", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              Room Board <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 2: Net Rent Collected */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>
              <IndianRupee size={15} style={{ color: "#059669" }} />
              Rent Collected
            </span>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>
              {collectedPct}% Target
            </span>
          </div>

          <div className={styles.metricValueRow}>
            <div className={styles.metricValueCol}>
              <span className={`${styles.metricValue} tabular-nums`} suppressHydrationWarning>
                ₹{rentCollected.toLocaleString("en-IN")}
              </span>
              <span className={styles.metricSubDelta} suppressHydrationWarning>
                of ₹{totalRentBase.toLocaleString("en-IN")} expected
              </span>
            </div>

            {/* Micro Sparkline */}
            <svg className={styles.sparklineSvg} viewBox="0 0 85 36" aria-hidden="true">
              <defs>
                <linearGradient id="sparklineGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 5 30 Q 25 25, 45 15 T 80 8"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 5 30 Q 25 25, 45 15 T 80 8 L 80 34 L 5 34 Z"
                fill="url(#sparklineGradLight)"
              />
              <circle cx="80" cy="8" r="3" fill="#2563EB" />
            </svg>
          </div>

          <div className={styles.metricFooter}>
            <span>Monthly collections</span>
            <Link href="/dashboard/finances" style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              Ledger <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 3: Pending Dues */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>
              <AlertCircle size={15} style={{ color: pendingDues > 0 ? "#D97706" : "#059669" }} />
              Pending Dues
            </span>
            <span className={`${styles.badge} ${pendingDues > 0 ? styles.badgeAmber : styles.badgeEmerald}`}>
              {overdueTenants.length} Overdue
            </span>
          </div>

          <div className={styles.metricValueRow}>
            <div className={styles.metricValueCol}>
              <span className={`${styles.metricValue} tabular-nums`} style={{ color: pendingDues > 0 ? "#D97706" : "#0F172A" }} suppressHydrationWarning>
                ₹{pendingDues.toLocaleString("en-IN")}
              </span>
              <span className={styles.metricSubDelta}>
                {pendingDues > 0 ? "Requires collection follow-up" : "All accounts cleared"}
              </span>
            </div>

            <div style={{ 
              width: "38px", 
              height: "38px", 
              borderRadius: "8px", 
              background: pendingDues > 0 ? "#FEF3C7" : "#ECFDF5",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: pendingDues > 0 ? "#D97706" : "#059669"
            }}>
              <Receipt size={17} />
            </div>
          </div>

          <div className={styles.metricFooter}>
            <span>{overdueTenants.length} accounts flagged</span>
            <Link href="/dashboard/dues" style={{ color: "#D97706", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              Review <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 4: Operations & Maintenance */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>
              <Activity size={15} style={{ color: openComplaints.length > 0 ? "#E11D48" : "#059669" }} />
              Maintenance &amp; Staff
            </span>
            <span className={`${styles.badge} ${openComplaints.length > 0 ? styles.badgeRose : styles.badgeEmerald}`}>
              {openComplaints.length === 0 ? "All Clear" : `${openComplaints.length} Open`}
            </span>
          </div>

          <div className={styles.metricValueRow}>
            <div className={styles.metricValueCol}>
              <span className={`${styles.metricValue} tabular-nums`} style={{ color: openComplaints.length > 0 ? "#E11D48" : "#0F172A" }}>
                {openComplaints.length === 0 ? "0" : openComplaints.length}
              </span>
              <span className={styles.metricSubDelta}>
                {pendingLeaves.length} leaves • {visitorsInside.length} visitors
              </span>
            </div>

            <div style={{ 
              width: "38px", 
              height: "38px", 
              borderRadius: "8px", 
              background: openComplaints.length > 0 ? "#FFE4E6" : "#ECFDF5",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: openComplaints.length > 0 ? "#E11D48" : "#059669"
            }}>
              <Wrench size={17} />
            </div>
          </div>

          <div className={styles.metricFooter}>
            <span>{brokenAssets.length} asset repairs pending</span>
            <Link href="/dashboard/complaints" style={{ color: "#E11D48", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              Tickets <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

      </section>

      {/* 3. INTERACTIVE REVENUE & CAPACITY DECK */}
      <section className={styles.visualizerDeck}>
        
        {/* Left Chart: Cashflow & Collections Velocity */}
        <div className={styles.cleanCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <TrendingUp size={18} style={{ color: "#2563EB" }} />
              <span>Collections Velocity &amp; Cashflow</span>
            </div>

            <div className={styles.timeSegmentPills}>
              {["7D", "30D", "90D", "YTD"].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`${styles.timePill} ${chartRange === range ? styles.timePillActive : ""}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Visualizer Chart */}
          <div className={styles.chartContainer}>
            <svg className={styles.trajectorySvg} viewBox="0 0 600 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGlowLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Guide Grid Lines */}
              <line x1="40" y1="50" x2="560" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="560" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="560" y2="150" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="190" x2="560" y2="190" stroke="#E2E8F0" />

              {/* Area Gradient Fill */}
              <path d={collectedAreaD} fill="url(#areaGlowLight)" />

              {/* Trajectory Stroke Line */}
              <path d={collectedPathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />

              {/* Chart Data Nodes */}
              {chartPoints.map((pt, idx) => (
                <g key={idx} onMouseEnter={() => setHoveredChartPoint(pt)} onMouseLeave={() => setHoveredChartPoint(null)}>
                  <circle
                    cx={pt.x}
                    cy={pt.yCollected}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
                  />
                  {/* X-axis labels */}
                  <text
                    x={pt.x}
                    y="205"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="11"
                    fontFamily="var(--font-ui)"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredChartPoint && (
              <div style={{
                position: "absolute",
                top: `${hoveredChartPoint.yCollected - 45}px`,
                left: `${(hoveredChartPoint.x / 600) * 100}%`,
                transform: "translateX(-50%)",
                background: "#0F172A",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                color: "#FFFFFF",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 10
              }}>
                <span style={{ color: "#38BDF8", fontWeight: 700 }}>₹{hoveredChartPoint.collected.toLocaleString("en-IN")}</span> collected
              </div>
            )}
          </div>

          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ background: "#2563EB" }} />
              <span>Collections Realized</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ background: "#CBD5E1" }} />
              <span>Target Baseline</span>
            </div>
            <div className={styles.legendItem} style={{ marginLeft: "auto", fontSize: "0.78rem" }}>
              <span>Collection Pace: <strong>{collectedPct}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right Radar: Bed Spatial Distribution & Inventory Breakdown */}
        <div className={styles.cleanCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Layers size={18} style={{ color: "#059669" }} />
              <span>Room &amp; Bed Capacity</span>
            </div>
            <span className={styles.badge} style={{ background: "#F1F5F9", color: "#475569" }}>
              {totalBeds} Total Beds
            </span>
          </div>

          <div className={styles.spatialGaugeWrap}>
            {/* Central Concentric Ring Visualizer */}
            <div className={styles.spatialCenterMeter}>
              <svg width="116" height="116" viewBox="0 0 116 116">
                <circle cx="58" cy="58" r="48" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle
                  cx="58"
                  cy="58"
                  r="48"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={(2 * Math.PI * 48) * (1 - (occupancyRate / 100))}
                  strokeLinecap="round"
                  transform="rotate(-90 58 58)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
                <circle cx="58" cy="58" r="36" fill="none" stroke="#F8FAFC" strokeWidth="6" />
                <circle
                  cx="58"
                  cy="58"
                  r="36"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={(2 * Math.PI * 36) * (1 - (collectedPct / 100))}
                  strokeLinecap="round"
                  transform="rotate(-90 58 58)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div className={styles.spatialCenterText}>
                <span className={styles.spatialCenterNum}>{occupancyRate}%</span>
                <span className={styles.spatialCenterLabel}>Occupied</span>
              </div>
            </div>

            {/* Inventory Breakdown Tiers */}
            <div className={styles.roomBreakdownList}>
              <div className={styles.roomBreakdownRow}>
                <div className={styles.breakdownLeft}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563EB" }} />
                  <span>Single Rooms</span>
                </div>
                <span className={styles.breakdownRight}>{singleBeds} Beds ({singleRooms.length} Rms)</span>
              </div>

              <div className={styles.roomBreakdownRow}>
                <div className={styles.breakdownLeft}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
                  <span>Double Sharing</span>
                </div>
                <span className={styles.breakdownRight}>{doubleBeds} Beds ({doubleRooms.length} Rms)</span>
              </div>

              <div className={styles.roomBreakdownRow}>
                <div className={styles.breakdownLeft}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} />
                  <span>Triple+ Sharing</span>
                </div>
                <span className={styles.breakdownRight}>{multiBeds} Beds ({multiRooms.length} Rms)</span>
              </div>

              <div className={styles.roomBreakdownRow} style={{ borderColor: "#A7F3D0", background: "#ECFDF5" }}>
                <div className={styles.breakdownLeft}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
                  <span style={{ color: "#059669", fontWeight: 600 }}>Vacant Beds</span>
                </div>
                <span className={styles.breakdownRight} style={{ color: "#059669" }}>{vacantBeds} Available</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 4. TWO-COLUMN OPERATIONAL CENTER */}
      <section className={styles.dashboardSplit}>
        
        {/* Left Column: Action Required Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          <div className={styles.cleanCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <AlertCircle size={18} style={{ color: "#D97706" }} />
                <span>Action Items Requiring Attention</span>
              </div>
              <span className={styles.badge} style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
                {actionItems.length} Pending
              </span>
            </div>

            {actionItems.length === 0 ? (
              <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748B" }}>
                <CheckCircle2 size={36} style={{ color: "#10B981", margin: "0 auto 0.75rem", display: "block" }} />
                <strong style={{ color: "#0F172A", display: "block", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  All Accounts &amp; Tasks Clear
                </strong>
                <span style={{ fontSize: "0.85rem" }}>
                  No overdue payments, pending leaves, or unresolved complaints at this time.
                </span>
              </div>
            ) : (
              <div className={styles.triageList}>
                {actionItems.map((item) => (
                  <div key={item.id} className={styles.triageRow}>
                    <div className={styles.triageLeft}>
                      <div 
                        className={styles.triageIconPip}
                        style={{
                          background: item.type === "due" ? "#FEE2E2" : item.type === "complaint" ? "#FEF3C7" : "#EFF6FF",
                          color: item.type === "due" ? "#DC2626" : item.type === "complaint" ? "#D97706" : "#2563EB",
                        }}
                      >
                        {item.type === "due" ? <Receipt size={16} /> : item.type === "complaint" ? <Wrench size={16} /> : <CalendarRange size={16} />}
                      </div>
                      <div className={styles.triageDetails}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={styles.triageTitle}>{item.title}</span>
                          <span className={`${styles.badge} ${item.badgeClass}`}>{item.badge}</span>
                        </div>
                        <span className={styles.triageSub} suppressHydrationWarning>{item.sub}</span>
                      </div>
                    </div>

                    <Link href={item.link} className={styles.triageBtn}>
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Outlet Comparison Matrix (Shown when multiple outlets exist) */}
          {properties.length > 1 && (
            <div className={styles.cleanCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Building2 size={18} style={{ color: "#2563EB" }} />
                  <span>Outlets Performance Matrix</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  {properties.length} Active Branches
                </span>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.minimalTable}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("name")}>Branch Name</th>
                      <th onClick={() => toggleSort("occupancy")} style={{ textAlign: "right" }}>Occupancy</th>
                      <th onClick={() => toggleSort("collected")} style={{ textAlign: "right" }}>Collected</th>
                      <th onClick={() => toggleSort("dues")} style={{ textAlign: "right" }}>Dues</th>
                      <th onClick={() => toggleSort("complaints")} style={{ textAlign: "right" }}>Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProperties.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPropertyId(p.id)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: p.id === selectedPropertyId ? "#2563EB" : "#0F172A", 
                              fontWeight: "inherit", 
                              cursor: "pointer", 
                              padding: 0, 
                              textAlign: "left",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            {p.name}
                            {p.id === selectedPropertyId && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563EB" }} />}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular-nums">
                          <span>{p.pOcc}%</span>
                          <div className={styles.tableProgressTrack}>
                            <div 
                              className={styles.tableProgressFill}
                              style={{ 
                                width: `${p.pOcc}%`, 
                                backgroundColor: p.pOcc >= 80 ? "#10B981" : "#F59E0B" 
                              }} 
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }} className="tabular-nums" suppressHydrationWarning>
                          ₹{p.pColl.toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "right", color: p.pDues > 0 ? "#D97706" : "#64748B" }} className="tabular-nums" suppressHydrationWarning>
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

        {/* Right Column: Real-time Velocity & P&L Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          
          {/* Today's Operational Velocity Strip */}
          <div className={styles.cleanCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Clock size={18} style={{ color: "#2563EB" }} />
                <span>Today&apos;s Activity</span>
              </div>
              <span className={styles.badge} style={{ background: "#ECFDF5", color: "#059669" }}>
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
                <span className={`${styles.velocityVal} tabular-nums`} style={{ fontSize: "1.1rem", color: "#059669" }} suppressHydrationWarning>
                  ₹{totalCollectionsToday.toLocaleString("en-IN")}
                </span>
              </div>
              <div className={styles.velocityItem}>
                <span className={styles.velocityLabel}>Visitors</span>
                <span className={`${styles.velocityVal} tabular-nums`}>{visitorsInside.length}</span>
              </div>
            </div>
          </div>

          {/* Financial P&L Snapshot */}
          <div className={styles.cleanCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <IndianRupee size={18} style={{ color: "#2563EB" }} />
                <span>Financial Cashflow</span>
              </div>
              <Link href="/dashboard/finances" style={{ fontSize: "0.78rem", color: "#2563EB", fontWeight: 600 }}>
                Full Ledger →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "#64748B" }}>Expected Gross Rent</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "#0F172A" }} suppressHydrationWarning>
                  ₹{expectedRent.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "#64748B" }}>Collections Realized</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "#059669" }} suppressHydrationWarning>
                  +₹{rentCollected.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ color: "#64748B" }}>Operating Expenses</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "#E11D48" }} suppressHydrationWarning>
                  -₹{monthlyExpenses.toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ height: "1px", background: "#F1F5F9", margin: "0.25rem 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem" }}>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>Net Operating Cashflow</span>
                <span 
                  className="tabular-nums" 
                  style={{ 
                    fontWeight: 750, 
                    color: netIncome >= 0 ? "#2563EB" : "#E11D48", 
                    fontSize: "1.2rem"
                  }} 
                  suppressHydrationWarning
                >
                  ₹{netIncome.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* SaaS Tier Status */}
          {subscription && (
            <div style={{ 
              padding: "0.9rem 1.15rem", 
              background: "#FFFFFF", 
              border: "1px solid #E2E8F0", 
              borderRadius: "12px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              fontSize: "0.8rem",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <Sparkles size={16} style={{ color: "#2563EB" }} />
                <span>Subscription Plan: <strong style={{ color: "#0F172A" }}>{subscription.plan_name || "Pro"}</strong></span>
              </div>
              <span style={{ color: "#64748B", fontSize: "0.75rem" }}>
                Active
              </span>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
