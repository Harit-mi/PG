"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import FAIcon from "@/components/FAIcon";
import MarkPaidModal from "@/components/MarkPaidModal";
import ReceiptGenerator from "@/components/ReceiptGenerator";

export default function DuesClient({ initialDues = [], propertyId, paymentMethods = [] }) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // "All", "Paid", "Pending", "Overdue"
  const [dateFilter, setDateFilter] = useState("All"); // "Today", "This Week", "This Month", "All"
  const [activeTab, setActiveTab] = useState("ledger"); // "ledger", "breakdown"

  useEffect(() => {
    const query = searchParams?.get("search");
    if (query) {
      setSearchTerm(query);
      setStatusFilter("All");
    }
  }, [searchParams]);

  // Compute Days Overdue helper
  const getDaysOverdue = (dueDateStr) => {
    if (!dueDateStr) return 0;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today - dueDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  // Filter and sort by urgency (highest days overdue first)
  const filteredDues = initialDues.filter(due => {
    const tenant = due.tenants || {};
    const matchesSearch = 
      (tenant.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.room_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "Paid") matchesStatus = due.status === "Completed";
    if (statusFilter === "Pending") matchesStatus = due.status === "Pending";
    if (statusFilter === "Overdue") {
      matchesStatus = due.status === "Pending" && new Date(due.date) < new Date();
    }

    let matchesDate = true;
    const dueTime = new Date(due.date).getTime();
    const now = new Date();
    if (dateFilter === "Today") {
      matchesDate = new Date(due.date).toDateString() === now.toDateString();
    } else if (dateFilter === "This Week") {
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      matchesDate = dueTime >= oneWeekAgo && dueTime <= now.getTime();
    } else if (dateFilter === "This Month") {
      matchesDate = new Date(due.date).getMonth() === now.getMonth() && new Date(due.date).getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    // Priority: Pending overdue first (sorted by days overdue desc), then regular pending, then completed
    const isOverdueA = a.status === 'Pending' && new Date(a.date) < new Date();
    const isOverdueB = b.status === 'Pending' && new Date(b.date) < new Date();
    
    if (isOverdueA && !isOverdueB) return -1;
    if (!isOverdueA && isOverdueB) return 1;

    if (isOverdueA && isOverdueB) {
      return getDaysOverdue(b.date) - getDaysOverdue(a.date);
    }

    if (a.status === 'Pending' && b.status === 'Completed') return -1;
    if (a.status === 'Completed' && b.status === 'Pending') return 1;

    return new Date(b.date) - new Date(a.date);
  });

  // Calculate totals
  const totalPendingSum = initialDues.filter(d => d.status === 'Pending').reduce((sum, d) => sum + d.amount, 0);
  const totalCollectedSum = initialDues.filter(d => d.status === 'Completed').reduce((sum, d) => sum + d.amount, 0);
  const severelyOverdueCount = initialDues.filter(d => d.status === 'Pending' && getDaysOverdue(d.date) >= 30).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Financial Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
            Total Outstanding Dues
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
            ₹{totalPendingSum.toLocaleString()}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
            Rent Settled / Collected
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
            ₹{totalCollectedSum.toLocaleString()}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
            Severely Overdue (30+ Days)
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: severelyOverdueCount > 0 ? 'var(--danger)' : 'var(--success)', marginTop: '4px' }}>
            {severelyOverdueCount} Tenants
          </div>
        </div>

      </div>

      {/* Tab Switcher: Dues Register vs Financial Category Breakdown */}
      <div className={styles.tabNav}>
        <button 
          onClick={() => setActiveTab("ledger")}
          className={`${styles.tabBtn} ${activeTab === "ledger" ? styles.tabActive : ""}`}
        >
          📖 Ruled Ledger Dues Register
        </button>
        <button 
          onClick={() => setActiveTab("breakdown")}
          className={`${styles.tabBtn} ${activeTab === "breakdown" ? styles.tabActive : ""}`}
        >
          📊 Income & Expense Breakdown
        </button>
      </div>

      {activeTab === "ledger" ? (
        <>
          {/* Ledger Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <FAIcon icon="magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                type="text" 
                placeholder="Search tenant name or room number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 650 }}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Dues</option>
                <option value="Overdue">Overdue Only</option>
                <option value="Paid">Paid / Completed</option>
              </select>

              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 650 }}>
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* Ruled Ledger Table */}
          <div className={styles.ledgerContainer}>
            {filteredDues.length === 0 ? (
              <div style={{ padding: "3.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                <FAIcon icon="circle-check" style={{ fontSize: "42px", margin: "0 auto 1rem", color: "var(--success)", display: "block" }} />
                <h3 style={{ margin: "0 0 4px", color: "var(--success)", fontWeight: 700 }}>No Outstanding Dues Found</h3>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>Adjust your status or timeframe search filters above.</p>
              </div>
            ) : (
              <table className={styles.ruledTable}>
                <thead>
                  <tr>
                    <th>Tenant Name</th>
                    <th>Room / Bed</th>
                    <th>Due Date & Urgency</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDues.map((due) => {
                    const tenant = due.tenants || {};
                    const isPending = due.status === 'Pending';
                    const daysOverdue = getDaysOverdue(due.date);
                    const isOverdue = isPending && daysOverdue > 0;
                    const isSeverelyOverdue = isPending && daysOverdue >= 30;

                    // Row Urgency styling
                    let rowClass = styles.rowPendingNormal;
                    if (due.status === 'Completed') {
                      rowClass = styles.rowPaid;
                    } else if (isSeverelyOverdue) {
                      rowClass = styles.rowSeverelyOverdue;
                    } else if (isOverdue) {
                      rowClass = styles.rowModeratelyOverdue;
                    }

                    const upiId = "owner@upi";
                    const message = `Hi ${tenant.name}, gentle reminder that your rent of ₹${due.amount} for Room ${tenant.room_number || ''} is pending. Please complete your payment.`;
                    const whatsappUrl = `https://wa.me/${tenant.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

                    return (
                      <tr key={due.id} className={rowClass}>
                        
                        {/* Tenant Name */}
                        <td style={{ fontWeight: 750, color: 'var(--primary)' }}>
                          {tenant.name || 'Unknown Resident'}
                          {tenant.phone && (
                            <span className="tabular-nums" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                              📱 {tenant.phone}
                            </span>
                          )}
                        </td>

                        {/* Room */}
                        <td>
                          <span className="tabular-nums" style={{ background: 'rgba(30,72,119,0.08)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 750 }}>
                            R-{tenant.room_number || 'N/A'}
                          </span>
                        </td>

                        {/* Due Date & Urgency */}
                        <td>
                          <div className="tabular-nums" style={{ fontWeight: 650 }}>
                            {new Date(due.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {isSeverelyOverdue ? (
                            <span className={styles.badgeSeverelyOverdue}>
                              <FAIcon icon="circle-exclamation" /> {daysOverdue} DAYS OVERDUE
                            </span>
                          ) : isOverdue ? (
                            <span className={styles.badgeModeratelyOverdue}>
                              <FAIcon icon="clock" /> {daysOverdue} Days Overdue
                            </span>
                          ) : isPending ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Current Month</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Payment Recorded</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          {due.status === 'Completed' ? (
                            <span className={styles.badgePaid}>✓ SETTLED</span>
                          ) : due.payment_reference ? (
                            <span className={styles.badgePending} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#B45309' }}>
                              VERIFY PROOF
                            </span>
                          ) : (
                            <span className={styles.badgePending}>UNPAID</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="tabular-nums" style={{ fontWeight: 800, fontSize: '0.95rem', color: isOverdue ? 'var(--danger)' : due.status === 'Completed' ? 'var(--success)' : 'var(--foreground)' }}>
                          ₹{due.amount.toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {isPending && (
                              <>
                                {tenant.phone && (
                                  <a 
                                    href={whatsappUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                      background: 'rgba(30,72,119,0.08)', 
                                      color: 'var(--primary)', 
                                      padding: '6px 12px', 
                                      borderRadius: '99px', 
                                      fontSize: '0.78rem', 
                                      fontWeight: 700, 
                                      textDecoration: 'none' 
                                    }}
                                  >
                                    WhatsApp
                                  </a>
                                )}
                                <MarkPaidModal transactionId={due.id} paymentMethods={paymentMethods} />
                              </>
                            )}

                            {due.status === 'Completed' && (
                              <ReceiptGenerator transaction={due} />
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* Secondary Financial Breakdown */
        <div className="glass" style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem', fontWeight: 750, color: 'var(--primary)' }}>
            📊 Income & Expense Ledger Breakdown
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Consolidated breakdown by transaction category across all operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>RENT INCOME</span>
              <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{initialDues.filter(d => d.type === 'Income' && d.status === 'Completed').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </span>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>MAINTENANCE & REPAIRS</span>
              <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                ₹{initialDues.filter(d => d.type === 'Expense' && d.category === 'Maintenance').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
