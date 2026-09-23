"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  DoorOpen, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  CalendarRange, 
  Search, 
  Plus, 
  X, 
  ArrowRight,
  Layers,
  Sparkles,
  UserPlus
} from "lucide-react";
import { updateTenantStatusAndRoom } from "@/app/actions";
import { getFloorName } from "@/utils/roomUtils";
import styles from "./RoomBoard.module.css";

export default function RoomBoard({ 
  rooms = [], 
  tenants = [], 
  transactions = [], 
  visitors = [] 
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assigningBedIndex, setAssigningBedIndex] = useState(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignError, setAssignError] = useState("");
  
  // Filters
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Helper: Get user initials
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Group tenants by room number
  const tenantMap = useMemo(() => {
    const map = {};
    tenants.forEach(t => {
      if (t.room_number) {
        if (!map[t.room_number]) {
          map[t.room_number] = [];
        }
        map[t.room_number].push(t);
      }
    });
    return map;
  }, [tenants]);

  // Overall Statistics
  const totalBeds = useMemo(() => rooms.reduce((sum, r) => sum + (r.capacity || 0), 0), [rooms]);
  const activeTenantsCount = useMemo(() => tenants.filter(t => t.status === "Active").length, [tenants]);
  const noticeTenantsCount = useMemo(() => tenants.filter(t => t.status === "Notice Period").length, [tenants]);
  const totalOccupiedBeds = activeTenantsCount + noticeTenantsCount;
  const totalVacantBeds = Math.max(totalBeds - totalOccupiedBeds, 0);
  const overallOccPct = totalBeds > 0 ? Math.round((totalOccupiedBeds / totalBeds) * 100) : 0;

  // Group rooms by Floor
  const floorMap = useMemo(() => {
    const map = {};
    rooms.forEach(room => {
      const floor = room.floor || getFloorName(room.room_number);
      if (!map[floor]) {
        map[floor] = [];
      }
      map[floor].push(room);
    });
    return map;
  }, [rooms]);

  const floorNames = useMemo(() => Object.keys(floorMap).sort(), [floorMap]);

  // Filtered rooms
  const filteredFloorMap = useMemo(() => {
    const result = {};
    const q = searchQuery.toLowerCase().trim();

    floorNames.forEach(floorName => {
      if (selectedFloor !== "All" && selectedFloor !== floorName) {
        return;
      }

      const matchingRooms = floorMap[floorName].filter(room => {
        const roomTenants = tenantMap[room.room_number] || [];
        const active = roomTenants.filter(t => t.status === "Active");
        const notice = roomTenants.filter(t => t.status === "Notice Period");
        const capacity = room.capacity || 1;
        const vacantCount = Math.max(capacity - (active.length + notice.length), 0);

        // Status filter
        if (statusFilter === "Vacant" && vacantCount === 0) return false;
        if (statusFilter === "Occupied" && vacantCount > 0) return false;
        if (statusFilter === "Notice" && notice.length === 0) return false;

        // Search query
        if (q) {
          const matchRoom = room.room_number.toLowerCase().includes(q) || (room.room_type || "").toLowerCase().includes(q);
          const matchTenant = roomTenants.some(t => t.name.toLowerCase().includes(q) || (t.phone && t.phone.includes(q)));
          if (!matchRoom && !matchTenant) return false;
        }

        return true;
      });

      if (matchingRooms.length > 0) {
        result[floorName] = matchingRooms;
      }
    });

    return result;
  }, [floorMap, floorNames, selectedFloor, statusFilter, searchQuery, tenantMap]);

  const handleRoomClick = (room, bedIdx = null) => {
    setSelectedRoom(room);
    setModalOpen(true);
    setAssigningBedIndex(bedIdx);
    setAssignSearch("");
    setAssignError("");
  };

  // Unassigned tenants eligible for bed assignment
  const unassignedTenants = useMemo(() => {
    return tenants.filter(
      t => (!t.room_number || t.room_number.trim() === "") && t.status !== "Checked Out"
    );
  }, [tenants]);

  const handleAssignTenant = (tenantId) => {
    if (!selectedRoom) return;
    setAssignError("");
    startTransition(async () => {
      const res = await updateTenantStatusAndRoom(tenantId, "Active", selectedRoom.room_number);
      if (res.success) {
        setAssigningBedIndex(null);
        setAssignSearch("");
        router.refresh();
      } else {
        setAssignError(res.error || "Could not assign tenant. Please try again.");
      }
    });
  };

  // Empty State
  if (rooms.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "4rem 2rem",
        textAlign: "center",
        maxWidth: "540px",
        margin: "2rem auto"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "12px",
          background: "var(--surface-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
          color: "var(--primary)"
        }}>
          <DoorOpen size={28} />
        </div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 750, color: "var(--foreground)", margin: "0 0 0.5rem" }}>
          No Rooms Configured Yet
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>
          Add your hostel rooms to start monitoring live bed occupancy and assigning residents.
        </p>
        <Link 
          href="/dashboard/rooms" 
          style={{
            background: "var(--primary)",
            color: "#FFFFFF",
            padding: "0.65rem 1.4rem",
            borderRadius: "8px",
            fontWeight: 650,
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Plus size={16} />
          <span>Configure Rooms &amp; Beds</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      
      {/* 1. TOP OVERVIEW & TELEMETRY STRIP */}
      <section className={styles.telemetryStrip} aria-label="Room occupancy summary">
        <div className={styles.telemetryCard}>
          <span className={styles.telemetryLabel}>Total Capacity</span>
          <div className={styles.telemetryValueRow}>
            <span className={`${styles.telemetryNum} tabular-nums`}>{totalBeds}</span>
            <span className={styles.telemetrySub}>{rooms.length} Rooms</span>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <span className={styles.telemetryLabel}>Occupied Beds</span>
          <div className={styles.telemetryValueRow}>
            <span className={`${styles.telemetryNum} tabular-nums`}>{totalOccupiedBeds}</span>
            <span className={`${styles.badge} ${overallOccPct >= 80 ? styles.badgeVacant : styles.badgeNotice}`}>
              {overallOccPct}% Fill
            </span>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <span className={styles.telemetryLabel}>Available to Move-in</span>
          <div className={styles.telemetryValueRow}>
            <span className={`${styles.telemetryNum} tabular-nums`} style={{ color: totalVacantBeds > 0 ? "#059669" : "var(--foreground)" }}>
              {totalVacantBeds}
            </span>
            <span className={styles.telemetrySub}>Vacant Beds</span>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <span className={styles.telemetryLabel}>Notice Period</span>
          <div className={styles.telemetryValueRow}>
            <span className={`${styles.telemetryNum} tabular-nums`} style={{ color: noticeTenantsCount > 0 ? "#D97706" : "var(--foreground)" }}>
              {noticeTenantsCount}
            </span>
            <span className={styles.telemetrySub}>{noticeTenantsCount > 0 ? "Departing soon" : "Zero departing"}</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <section className={styles.filterToolbar}>
        <div className={styles.toolbarLeft}>
          {/* Floor Selector Pills */}
          <div className={styles.pillTabs} role="tablist" aria-label="Filter rooms by floor">
            <button
              type="button"
              role="tab"
              aria-selected={selectedFloor === "All"}
              onClick={() => setSelectedFloor("All")}
              className={`${styles.pillBtn} ${selectedFloor === "All" ? styles.pillBtnActive : ""}`}
            >
              All Floors ({rooms.length})
            </button>
            {floorNames.map(f => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={selectedFloor === f}
                onClick={() => setSelectedFloor(f)}
                className={`${styles.pillBtn} ${selectedFloor === f ? styles.pillBtnActive : ""}`}
              >
                {f} ({floorMap[f]?.length || 0})
              </button>
            ))}
          </div>

          {/* Status Dropdown Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
            aria-label="Filter rooms by vacancy status"
          >
            <option value="All">All Statuses</option>
            <option value="Vacant">Vacant Beds Available</option>
            <option value="Occupied">Fully Occupied</option>
            <option value="Notice">Notice Period Active</option>
          </select>
        </div>

        {/* Search Input */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search room # or resident…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </section>

      {/* 3. ARCHITECTURAL ROOM CARDS BY FLOOR */}
      {Object.keys(filteredFloorMap).length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
          <p style={{ margin: 0, fontSize: "0.95rem" }}>No rooms match the selected filters or search query.</p>
        </div>
      ) : (
        Object.keys(filteredFloorMap).map(floorName => {
          const floorRooms = filteredFloorMap[floorName];
          const floorBeds = floorRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
          const floorOccupants = floorRooms.flatMap(r => tenantMap[r.room_number] || []).filter(t => t.status === "Active" || t.status === "Notice Period");

          return (
            <div key={floorName} className={styles.floorSection}>
              {/* Floor Header Bar */}
              <div className={styles.floorHeader}>
                <h2 className={styles.floorTitle}>
                  <Layers size={17} style={{ color: "var(--primary)" }} />
                  <span>{floorName}</span>
                </h2>
                <span className={styles.floorStats}>
                  {floorOccupants.length} of {floorBeds} Beds Filled ({floorRooms.length} Rooms)
                </span>
              </div>

              {/* Rooms Grid */}
              <div className={styles.roomsGrid}>
                {floorRooms.map(room => {
                  const roomTenants = tenantMap[room.room_number] || [];
                  const active = roomTenants.filter(t => t.status === "Active");
                  const notice = roomTenants.filter(t => t.status === "Notice Period");
                  const capacity = room.capacity || 1;
                  const occupiedCount = active.length + notice.length;
                  const vacantCount = Math.max(capacity - occupiedCount, 0);

                  // Status badge state
                  let badgeClass = styles.badgeOccupied;
                  let badgeText = "Occupied";

                  if (vacantCount === capacity) {
                    badgeClass = styles.badgeVacant;
                    badgeText = `${capacity} Vacant`;
                  } else if (notice.length > 0) {
                    badgeClass = styles.badgeNotice;
                    badgeText = `${notice.length} Notice`;
                  } else if (vacantCount > 0) {
                    badgeClass = styles.badgePartial;
                    badgeText = `${vacantCount} Available`;
                  }

                  // Build bed slots array
                  const bedsList = [];
                  for (let i = 0; i < capacity; i++) {
                    bedsList.push(roomTenants[i] || null);
                  }

                  const rentAmount = room.rent_per_bed || room.rent_amount || 0;

                  return (
                    <div 
                      key={room.id}
                      className={styles.roomCard}
                      onClick={() => handleRoomClick(room)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Room ${room.room_number}, ${capacity} beds, ${badgeText}`}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleRoomClick(room)}
                    >
                      {/* Room Card Header */}
                      <div className={styles.roomCardHeader}>
                        <div className={styles.roomTitleGroup}>
                          <div className={styles.roomNumRow}>
                            <span className={styles.roomTag}>ROOM</span>
                            <span className={styles.roomNum}>{room.room_number}</span>
                          </div>
                          <span className={styles.roomTypeMeta}>
                            {room.room_type || "Standard"}
                          </span>
                        </div>
                        <span className={`${styles.badge} ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Bed Slots Rail */}
                      <div className={styles.bedSlotsRail} onClick={(e) => e.stopPropagation()}>
                        {bedsList.map((occupant, bedIdx) => {
                          const bedLetter = String.fromCharCode(65 + bedIdx); // A, B, C...

                          if (!occupant) {
                            return (
                              <button
                                key={bedIdx}
                                type="button"
                                onClick={() => handleRoomClick(room, bedIdx)}
                                className={`${styles.bedSlot} ${styles.bedSlotVacant}`}
                                title={`Assign resident to Bed ${bedLetter}`}
                              >
                                <span>Bed {bedLetter}</span>
                                <span className={styles.bedSlotAction}>
                                  <Plus size={12} />
                                  <span>Assign</span>
                                </span>
                              </button>
                            );
                          }

                          const isNotice = occupant.status === "Notice Period";
                          return (
                            <div 
                              key={occupant.id || bedIdx}
                              className={`${styles.bedSlot} ${isNotice ? styles.bedSlotNotice : styles.bedSlotOccupied}`}
                            >
                              <div className={styles.bedTenantInfo}>
                                <div className={styles.tenantAvatar}>
                                  {getInitials(occupant.name)}
                                </div>
                                <span className={styles.tenantName}>
                                  {occupant.name}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.68rem", fontWeight: 650 }}>
                                Bed {bedLetter} {isNotice ? "• Notice" : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Room Card Footer */}
                      <div className={styles.roomCardFooter}>
                        <span className={`${styles.rentRate} tabular-nums`} suppressHydrationWarning>
                          ₹{rentAmount.toLocaleString("en-IN")} / bed
                        </span>
                        <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                          Inspect →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* 4. ROOM INSPECTION & RESIDENT ASSIGNMENT MODAL */}
      {modalOpen && selectedRoom && (
        <div 
          className={styles.modalOverlay} 
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-modal-title"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 id="room-modal-title" className={styles.modalTitle}>
                  Room {selectedRoom.room_number}
                </h3>
                <span className={styles.modalSubtitle}>
                  {selectedRoom.floor || getFloorName(selectedRoom.room_number)} • {selectedRoom.room_type || "Standard Room"}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setModalOpen(false)} 
                className={styles.modalCloseBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              
              {/* Room Specifications Strip */}
              <div className={styles.modalSpecsStrip}>
                <div className={styles.specCol}>
                  <span className={styles.specLabel}>Rent per Bed</span>
                  <span className={`${styles.specValue} tabular-nums`} suppressHydrationWarning>
                    ₹{(selectedRoom.rent_per_bed || selectedRoom.rent_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={styles.specCol}>
                  <span className={styles.specLabel}>Bed Capacity</span>
                  <span className={styles.specValue}>
                    {selectedRoom.capacity || 1} Beds
                  </span>
                </div>
                <div className={styles.specCol}>
                  <span className={styles.specLabel}>Total Potential</span>
                  <span className={`${styles.specValue} tabular-nums`} style={{ color: "#059669" }} suppressHydrationWarning>
                    ₹{((selectedRoom.rent_per_bed || selectedRoom.rent_amount || 0) * (selectedRoom.capacity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Bed Allocation List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)" }}>
                    Bed Allocation &amp; Current Residents
                  </span>
                  <Link href="/dashboard/tenants" style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>
                    Tenant Directory →
                  </Link>
                </div>

                {(() => {
                  const roomTenants = tenantMap[selectedRoom.room_number] || [];
                  const capacity = selectedRoom.capacity || 1;
                  const beds = [];
                  for (let i = 0; i < capacity; i++) {
                    beds.push(roomTenants[i] || null);
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {beds.map((tenant, bedIdx) => {
                        const bedLetter = String.fromCharCode(65 + bedIdx);

                        return (
                          <div key={bedIdx} className={styles.modalBedCard}>
                            <div className={styles.modalBedHeader}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontWeight: 750, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                  Bed {bedLetter}:
                                </span>
                                {tenant ? (
                                  <strong style={{ fontSize: "0.88rem", color: "var(--foreground)" }}>
                                    {tenant.name}
                                  </strong>
                                ) : (
                                  <span style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 650 }}>
                                    Vacant &amp; Ready
                                  </span>
                                )}
                              </div>

                              {tenant ? (
                                <Link 
                                  href="/dashboard/tenants"
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--primary)",
                                    fontWeight: 600,
                                    textDecoration: "none"
                                  }}
                                >
                                  Manage Profile →
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssigningBedIndex(assigningBedIndex === bedIdx ? null : bedIdx);
                                    setAssignSearch("");
                                    setAssignError("");
                                  }}
                                  style={{
                                    background: "var(--primary)",
                                    color: "#FFFFFF",
                                    border: "none",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    fontSize: "0.74rem",
                                    fontWeight: 650,
                                    cursor: "pointer"
                                  }}
                                >
                                  {assigningBedIndex === bedIdx ? "Cancel" : "+ Assign Resident"}
                                </button>
                              )}
                            </div>

                            {tenant && (
                              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                Phone: <span className="tabular-nums">{tenant.phone}</span> • Joined: <span className="tabular-nums">{tenant.move_in_date || "N/A"}</span>
                                {tenant.status === "Notice Period" && (
                                  <span style={{ color: "#D97706", fontWeight: 700, marginLeft: "6px" }}>
                                    ⚠️ Leaving: {tenant.notice_end_date || "End of Month"}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Inline unassigned-resident selector */}
                            {!tenant && assigningBedIndex === bedIdx && (
                              <div className={styles.assignPicker}>
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search unassigned resident by name or phone…"
                                  value={assignSearch}
                                  onChange={(e) => setAssignSearch(e.target.value)}
                                  className={styles.assignSearchInput}
                                />

                                {assignError && (
                                  <p style={{ color: "#E11D48", fontSize: "0.74rem", fontWeight: 650, margin: "0 0 0.5rem" }}>
                                    {assignError}
                                  </p>
                                )}

                                <div className={styles.unassignedList}>
                                  {unassignedTenants
                                    .filter(
                                      t =>
                                        !assignSearch ||
                                        t.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                        (t.phone && t.phone.includes(assignSearch))
                                    )
                                    .map(t => (
                                      <button
                                        key={t.id}
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleAssignTenant(t.id)}
                                        className={styles.unassignedOption}
                                      >
                                        <div>
                                          <strong>{t.name}</strong>
                                          <span style={{ marginLeft: "8px", fontSize: "0.72rem", color: "inherit", opacity: 0.8 }}>
                                            {t.phone}
                                          </span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>Assign →</span>
                                      </button>
                                    ))}

                                  {unassignedTenants.length === 0 && (
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem", textAlign: "center" }}>
                                      No unassigned residents found. Add a tenant in the directory first.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
