"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FAIcon from "./FAIcon";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Quick initials helper
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
  const tenantMap = {};
  tenants.forEach(t => {
    if (t.room_number) {
      if (!tenantMap[t.room_number]) {
        tenantMap[t.room_number] = [];
      }
      tenantMap[t.room_number].push(t);
    }
  });

  // Group rooms by Floor
  const floorMap = {};
  rooms.forEach(room => {
    const floor = room.floor || getFloorName(room.room_number);
    if (!floorMap[floor]) {
      floorMap[floor] = [];
    }
    floorMap[floor].push(room);
  });

  const floorNames = Object.keys(floorMap).sort();

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
    setAssigningBedIndex(null);
    setAssignSearch("");
    setAssignError("");
  };

  // Unassigned tenants eligible for bed assignment
  const unassignedTenants = tenants.filter(
    (t) => (!t.room_number || t.room_number.trim() === "") && t.status !== "Checked Out"
  );

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

  // Empty State handling
  if (rooms.length === 0) {
    return (
      <div className={`${styles.pegboard} glass`} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(30, 72, 119, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
          <FAIcon icon="key" />
        </div>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: 'var(--primary)', fontWeight: 800 }}>
          Your Key Rack Board is Mounted & Ready
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', maxWidth: '420px', margin: '0 auto 1.75rem' }}>
          No room key hooks have been configured for this property yet. Add your first room to hang physical brass key tags.
        </p>
        <Link 
          href="/dashboard/rooms" 
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '12px 28px', 
            borderRadius: '99px', 
            fontWeight: 750, 
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(30, 72, 119, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FAIcon icon="plus" /> Configure Rooms & Mount Key Pegs
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      
      {/* Pegboard Master Console */}
      <div className={`${styles.pegboard} glass`}>
        
        {/* Header & Legend */}
        <div className={styles.boardHeader}>
          <div>
            <h2><FAIcon icon="key" /> Warden Key-Rack Pegboard</h2>
            <p>Spatial room key rack displaying active bed occupancies, vacant slots, and notice period tags.</p>
          </div>

          <div className={styles.legendBar}>
            <div className={styles.legendItem}>
              <span className={styles.dotVacant}></span> Vacant Bed
            </div>
            <div className={styles.legendItem}>
              <span className={styles.dotOccupied}></span> Occupied
            </div>
            <div className={styles.legendItem}>
              <span className={styles.dotNotice}></span> Notice Period
            </div>
          </div>
        </div>

        {/* Render Floors */}
        {floorNames.map(floorName => {
          const floorRooms = floorMap[floorName];
          
          // Floor statistics
          const floorTotalBeds = floorRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
          const floorTenants = floorRooms.flatMap(r => tenantMap[r.room_number] || []).filter(t => t.status === 'Active' || t.status === 'Notice Period');
          const floorOccPct = floorTotalBeds > 0 ? Math.round((floorTenants.length / floorTotalBeds) * 100) : 0;

          return (
            <div key={floorName} className={styles.floorSection}>
              
              {/* Floor Header Bar */}
              <div className={styles.floorHeader}>
                <h3 className={styles.floorTitle}>📍 {floorName}</h3>
                <span className={`${styles.floorMeta} tabular-nums`}>
                  {floorTenants.length}/{floorTotalBeds} Beds Occupied ({floorOccPct}%)
                </span>
              </div>

              {/* Room Key Pegs Grid */}
              <div className={styles.grid}>
                {floorRooms.map(room => {
                  const roomTenants = tenantMap[room.room_number] || [];
                  const activeTenants = roomTenants.filter(t => t.status === 'Active');
                  const noticeTenants = roomTenants.filter(t => t.status === 'Notice Period');
                  const totalCapacity = room.capacity || 1;

                  const isFullyVacant = activeTenants.length === 0 && noticeTenants.length === 0;
                  const hasNotice = noticeTenants.length > 0;
                  const isFullyOccupied = activeTenants.length + noticeTenants.length >= totalCapacity;

                  // Overall Peg Tag style class
                  let tagStyleClass = styles.occupiedTag;
                  let statusBadgeText = `OCCUPIED (${activeTenants.length}/${totalCapacity})`;
                  let statusBadgeClass = styles.badgeOccupied;

                  if (isFullyVacant) {
                    tagStyleClass = styles.vacantTag;
                    statusBadgeText = "ALL VACANT";
                    statusBadgeClass = styles.badgeVacant;
                  } else if (hasNotice) {
                    tagStyleClass = styles.noticeTag;
                    statusBadgeText = `NOTICE (${noticeTenants.length})`;
                    statusBadgeClass = styles.badgeNotice;
                  } else if (!isFullyOccupied) {
                    statusBadgeText = `PARTIAL (${activeTenants.length}/${totalCapacity})`;
                  }

                  // Build bed slots array up to capacity
                  const bedsList = [];
                  for (let i = 0; i < totalCapacity; i++) {
                    const occupant = roomTenants[i];
                    bedsList.push(occupant || null);
                  }

                  return (
                    <div key={room.id} className={styles.keyHookCell}>
                      
                      {/* Brass Metal Hook */}
                      <div className={styles.pegHook}></div>

                      {/* Physical Key Tag Peg */}
                      <div 
                        className={`${styles.keyTag} ${tagStyleClass}`}
                        onClick={() => handleRoomClick(room)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Room ${room.room_number} key tag`}
                        onKeyDown={(e) => e.key === 'Enter' && handleRoomClick(room)}
                      >
                        {/* Metallic Ring Hole */}
                        <div className={styles.ringHole}></div>

                        {/* Room Number & Type */}
                        <div className={styles.roomHeaderBlock}>
                          <div className={styles.roomNumLabel}>R-{room.room_number}</div>
                          <div className={styles.roomTypeMeta}>{room.room_type || 'Standard'} • ₹{room.rent_per_bed?.toLocaleString() || room.rent_amount?.toLocaleString()}/mo</div>
                        </div>

                        {/* Per-Bed Granular Slots inside Peg Body */}
                        <div className={styles.bedListBlock}>
                          {bedsList.map((occupant, bedIdx) => {
                            if (!occupant) {
                              return (
                                <div key={bedIdx} className={`${styles.bedSlotPill} ${styles.bedSlotVacant}`}>
                                  <span>Bed {bedIdx + 1}</span>
                                  <span style={{ fontSize: '0.65rem' }}>+ Vacant</span>
                                </div>
                              );
                            }

                            const isNoticeState = occupant.status === 'Notice Period';
                            return (
                              <div 
                                key={occupant.id || bedIdx} 
                                className={`${styles.bedSlotPill} ${isNoticeState ? styles.bedSlotNotice : styles.bedSlotOccupied}`}
                                title={occupant.name}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85px' }}>
                                  {getInitials(occupant.name)} {occupant.name.split(' ')[0]}
                                </span>
                                <span style={{ fontSize: '0.65rem' }}>
                                  {isNoticeState ? "Notice" : "Occupied"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Overall Status Footer Badge */}
                        <div className={`${styles.statusBadge} ${statusBadgeClass}`}>
                          {statusBadgeText}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}

      </div>


      {/* INTERACTIVE ROOM MANAGEMENT MODAL */}
      {modalOpen && selectedRoom && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  KEY RACK DESK • ROOM DETAILS
                </span>
                <h2 style={{ fontSize: '1.3rem', margin: '2px 0 0', fontWeight: 800, color: 'var(--primary)' }}>
                  Room {selectedRoom.room_number} ({selectedRoom.room_type || 'Standard'})
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className={styles.closeBtn}>
                <FAIcon icon="xmark" />
              </button>
            </div>

            {/* Modal Content */}
            <div className={styles.modalBody}>
              
              {/* Room Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(30,72,119,0.04)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>RENT PER BED</span>
                  <span className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{(selectedRoom.rent_per_bed || selectedRoom.rent_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>BED CAPACITY</span>
                  <span className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {selectedRoom.capacity || 1} Beds
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>TOTAL POTENTIAL</span>
                  <span className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{((selectedRoom.rent_per_bed || selectedRoom.rent_amount || 0) * (selectedRoom.capacity || 1)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Occupants & Bed Allocation */}
              <div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem', fontWeight: 750, color: 'var(--primary)' }}>
                  Bed Allocation & Current Residents
                </h4>

                {(() => {
                  const roomTenants = tenantMap[selectedRoom.room_number] || [];
                  const capacity = selectedRoom.capacity || 1;
                  const beds = [];
                  for (let i = 0; i < capacity; i++) {
                    beds.push(roomTenants[i] || null);
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {beds.map((tenant, bedIdx) => (
                        <div key={bedIdx}>
                          <div
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '10px',
                              border: '1px solid var(--border)',
                              background: tenant ? (tenant.status === 'Notice Period' ? 'rgba(220, 38, 38, 0.04)' : 'rgba(30, 72, 119, 0.03)') : 'rgba(40, 167, 69, 0.04)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '1rem'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>Bed {bedIdx + 1}:</span>
                                {tenant ? (
                                  <span style={{ fontWeight: 750, fontSize: '0.9rem', color: 'var(--foreground)' }}>{tenant.name}</span>
                                ) : (
                                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>Vacant & Ready</span>
                                )}
                              </div>

                              {tenant && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Phone: <span className="tabular-nums">{tenant.phone}</span> • Joined: <span className="tabular-nums">{tenant.move_in_date || 'N/A'}</span>
                                  {tenant.status === 'Notice Period' && (
                                    <span style={{ color: 'var(--danger)', fontWeight: 700, marginLeft: '6px' }}>
                                      ⚠️ Notice Period (Leaving: {tenant.notice_end_date || 'End of Month'})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {tenant ? (
                              <Link href="/dashboard/tenants">
                                <button style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                  Manage Resident →
                                </button>
                              </Link>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssigningBedIndex(assigningBedIndex === bedIdx ? null : bedIdx);
                                  setAssignSearch("");
                                  setAssignError("");
                                }}
                                style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                {assigningBedIndex === bedIdx ? "Cancel" : "+ Assign Tenant"}
                              </button>
                            )}
                          </div>

                          {/* Inline unassigned-tenant picker — no page navigation required */}
                          {!tenant && assigningBedIndex === bedIdx && (
                            <div
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.85rem',
                                borderRadius: '10px',
                                border: '1px dashed var(--primary)',
                                background: 'rgba(30, 72, 119, 0.03)',
                              }}
                            >
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search unassigned residents by name or phone…"
                                value={assignSearch}
                                onChange={(e) => setAssignSearch(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border)',
                                  fontSize: '0.8rem',
                                  marginBottom: '0.5rem',
                                  boxSizing: 'border-box',
                                }}
                              />

                              {assignError && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                                  {assignError}
                                </p>
                              )}

                              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {unassignedTenants
                                  .filter(
                                    (t) =>
                                      !assignSearch ||
                                      t.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                      (t.phone && t.phone.includes(assignSearch))
                                  )
                                  .map((t) => (
                                    <button
                                      key={t.id}
                                      disabled={isPending}
                                      onClick={() => handleAssignTenant(t.id)}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface)',
                                        cursor: isPending ? 'wait' : 'pointer',
                                        fontSize: '0.8rem',
                                        opacity: isPending ? 0.6 : 1,
                                      }}
                                    >
                                      <span style={{ fontWeight: 700 }}>{t.name}</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }} className="tabular-nums">
                                        {t.phone}
                                      </span>
                                    </button>
                                  ))}

                                {unassignedTenants.length === 0 && (
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                                    No unassigned residents on this property.{" "}
                                    <Link href="/dashboard/tenants" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                      Add a new tenant →
                                    </Link>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 650, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Close Key Desk
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
