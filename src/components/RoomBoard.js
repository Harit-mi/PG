"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Phone, FileText, ArrowRight, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import styles from "./RoomBoard.module.css";

export default function RoomBoard({ rooms = [], tenants = [], transactions = [], visitors = [] }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

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

  const handleTagClick = (tenant) => {
    if (!tenant) return;
    setSelectedTenant(tenant);
    setSidePanelOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (rooms.length === 0) {
    return (
      <div className={`${styles.pegboard} glass`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '20px', height: '40px' }}><div className={styles.pegHook}></div></div>
          <div style={{ position: 'relative', width: '20px', height: '40px' }}><div className={styles.pegHook}></div></div>
          <div style={{ position: 'relative', width: '20px', height: '40px' }}><div className={styles.pegHook}></div></div>
        </div>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: 'var(--primary)' }}>
          Your Key Rack is Bare
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '340px' }}>
          No room key hooks have been mounted to this property board. Add a room to hang your first brass key tag.
        </p>
        <a 
          href="/dashboard/rooms" 
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '10px 24px', 
            borderRadius: '99px', 
            fontWeight: 700, 
            fontSize: '0.85rem',
            textDecoration: 'none',
            boxShadow: '0 4px 10px rgba(30, 72, 119, 0.2)' 
          }}
        >
          Mount First Key Hook
        </a>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      
      {/* Pegboard style Room Board */}
      <div className={`${styles.pegboard} glass`}>
        <div className={styles.boardHeader}>
          <h2>Key Rack Board</h2>
          <p>Click any active brass tag to review tenant ledger cards.</p>
        </div>

        <div className={styles.grid}>
          {rooms.map((room, index) => {
            const roomTenants = tenantMap[room.room_number] || [];
            const activeTenant = roomTenants.find(t => t.status === "Active");
            const noticeTenant = roomTenants.find(t => t.status === "Notice Period");

            const isOccupied = !!activeTenant;
            const isNotice = !!noticeTenant;
            const tenantToShow = noticeTenant || activeTenant;

            // Staggered hang animation delay
            const hangDelay = `${Math.min(index * 30, 500)}ms`;

            return (
              <div 
                key={room.id} 
                className={styles.keyHookCell}
                style={{ animationDelay: hangDelay }}
              >
                {/* Metallic Hook Peg */}
                <div className={styles.pegHook}></div>

                {/* Hanging Key Tag */}
                {!isOccupied && !isNotice ? (
                  /* Vacant: Tag hangs on its hook */
                  <div 
                    className={`${styles.keyTag} ${styles.vacantTag}`}
                    title={`Room ${room.room_number} is Vacant`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Room ${room.room_number} is Vacant`}
                  >
                    <span className={styles.ringHole}></span>
                    <div className={styles.roomNumLabel}>{room.room_number}</div>
                    <div className={styles.statusLabel}>VACANT</div>
                  </div>
                ) : isNotice ? (
                  /* Notice Period: Tag tilted half-off the hook with Crimson highlights */
                  <div 
                    className={`${styles.keyTag} ${styles.noticeTag}`}
                    onClick={() => handleTagClick(tenantToShow)}
                    title={`Room ${room.room_number} notice: ${tenantToShow.name}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Room ${room.room_number} Notice tag for ${tenantToShow.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleTagClick(tenantToShow)}
                  >
                    <span className={styles.ringHole}></span>
                    <div className={styles.roomNumLabel}>{room.room_number}</div>
                    <div className={styles.initialsBlock}>{getInitials(tenantToShow.name)}</div>
                    <div className={styles.statusLabel} style={{ color: 'var(--danger)' }}>NOTICE</div>
                  </div>
                ) : (
                  /* Occupied: Tag lifted off hook (translated down/offset) */
                  <div 
                    className={`${styles.keyTag} ${styles.occupiedTag}`}
                    onClick={() => handleTagClick(tenantToShow)}
                    title={`Room ${room.room_number} occupied: ${tenantToShow.name}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Room ${room.room_number} Occupant tag for ${tenantToShow.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleTagClick(tenantToShow)}
                  >
                    <span className={styles.ringHole} style={{ background: '#7e6c46' }}></span>
                    <div className={styles.roomNumLabel}>{room.room_number}</div>
                    <div className={styles.initialsBlock}>{getInitials(tenantToShow.name)}</div>
                    <div className={styles.statusLabel}>OCCUPIED</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Slide-In Panel */}
      <div className={`${styles.sidePanel} ${sidePanelOpen ? styles.panelOpen : ""}`}>
        {selectedTenant && (
          <div className={styles.panelContent}>
            
            {/* Header */}
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.tagBadge}>TENANT LEDGER</span>
                <h2>{selectedTenant.name}</h2>
              </div>
              <button 
                onClick={() => setSidePanelOpen(false)}
                className={styles.closeBtn}
                aria-label="Close tenant panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className={styles.sectionBody}>
              
              {/* Profile Card */}
              <div className={styles.infoCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>CONTACT INFORMATION</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Phone: <span className="ledger-mono">{selectedTenant.phone}</span></p>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Room Number: <span className="ledger-mono">{selectedTenant.room_number}</span></p>
              </div>

              {/* Rent & Payments Ledger */}
              <div className={styles.infoCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileText size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>LEASE & RENT STATEMENT</strong>
                </div>
                
                {/* Math check for unpaid rent */}
                {(() => {
                  const tenantTx = transactions.filter(t => t.tenant_id === selectedTenant.id && t.type === 'Income');
                  const unpaidTx = tenantTx.filter(t => t.status === 'Pending');
                  const isOverdue = unpaidTx.length > 0;
                  const totalUnpaid = unpaidTx.reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Monthly Rent:</span>
                        <span className="ledger-mono">₹{selectedTenant.rent_amount?.toLocaleString() || "0"}</span>
                      </div>
                      
                      {isOverdue ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }}>
                          <span>Overdue Balance:</span>
                          <span className="ledger-mono">₹{totalUnpaid.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                          <span>Rent Account Status:</span>
                          <span>✓ Paid</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Visitor logs timeline */}
              <div className={styles.infoCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <UserCheck size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>VISITOR REGISTER TIMELINE</strong>
                </div>
                {(() => {
                  const tenantVisitors = visitors.filter(v => v.tenant_id === selectedTenant.id);
                  if (tenantVisitors.length === 0) {
                    return <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No visitors logged.</p>;
                  }
                  return (
                    <div className={styles.timeline}>
                      {tenantVisitors.map(v => (
                        <div key={v.id} className={styles.timelineItem}>
                          <div style={{ fontWeight: 600 }}>{v.name} ({v.relationship})</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <span>Purpose: {v.purpose}</span>
                            <span className="ledger-mono">{new Date(v.visit_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
