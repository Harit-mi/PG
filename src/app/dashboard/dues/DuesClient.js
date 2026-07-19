"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import FAIcon from "@/components/FAIcon";
import MarkPaidModal from "@/components/MarkPaidModal";
import ReceiptGenerator from "@/components/ReceiptGenerator";
import { supabase } from "@/utils/supabase";

export default function DuesClient({ initialDues, propertyId, paymentMethods = [] }) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // "All", "Paid", "Pending", "Overdue"
  const [dateFilter, setDateFilter] = useState("All"); // "Today", "This Week", "This Month", "All"

  useEffect(() => {
    const query = searchParams?.get("search");
    if (query) {
      setSearchTerm(query);
      setStatusFilter("All"); // clear status filter so the user actually sees the dues of this tenant regardless of status!
    }
  }, [searchParams]);

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
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Ledger Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <FAIcon icon="magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <input 
            type="text" 
            placeholder="Filter by name or room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}
          />
        </div>
        
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
          <option value="All">All Dates</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>
      </div>

      {/* Ruled Ledger Table */}
      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto', background: 'var(--card-bg)' }}>
        {filteredDues.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <FAIcon icon="circle-check" style={{ fontSize: "48px", margin: "0 auto 1rem", color: "var(--primary)" }} />
            <h3>No Records in Register</h3>
            <p>Try adjusting your ledger search filters.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem' }}>Tenant Name</th>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem' }}>Room / Bed</th>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem' }}>Due Date</th>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ textTransform: 'uppercase', padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.map((due) => {
                const tenant = due.tenants || {};
                const isOverdue = due.status === 'Pending' && new Date(due.date) < new Date();
                
                const upiId = "yourname@upi";
                const message = `Hi ${tenant.name}, a gentle reminder that your rent of ₹${due.amount} is pending. Please pay via UPI: ${upiId}.`;
                const whatsappUrl = `https://wa.me/${tenant.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

                // Style overdue row with Danger highlight
                const rowStyle = isOverdue ? {
                  borderLeft: '4px solid var(--danger)',
                  backgroundColor: 'rgba(230, 43, 57, 0.04)'
                } : {};

                return (
                  <tr key={due.id} style={rowStyle}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{tenant.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="ledger-mono" style={{ background: 'rgba(30,72,119,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {tenant.room_number || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }} className="ledger-mono">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FAIcon icon="clock" style={{ color: isOverdue ? 'var(--danger)' : 'var(--primary)', fontSize: '13px' }} />
                        {new Date(due.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {due.status === 'Pending' && due.payment_reference ? (
                        <span style={{ background: 'rgba(30, 72, 119, 0.15)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Pending Verification
                        </span>
                      ) : isOverdue ? (
                        <span style={{ background: 'rgba(230, 43, 57, 0.15)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FAIcon icon="triangle-exclamation" style={{ fontSize: '12px' }} /> Overdue
                        </span>
                      ) : (
                        <span style={{ 
                          background: due.status === 'Completed' ? 'rgba(30, 72, 119, 0.15)' : 'rgba(30, 72, 119, 0.1)', 
                          color: due.status === 'Completed' ? 'var(--primary)' : 'var(--primary)', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase' 
                        }}>
                          {due.status === 'Completed' ? 'Paid' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: isOverdue ? 'var(--danger)' : (due.status === 'Completed' ? 'var(--primary)' : 'var(--foreground)') }} className="ledger-mono">
                      ₹{due.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {due.status === 'Pending' && (
                          <>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '99px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                              Remind
                            </a>
                            <MarkPaidModal transactionId={due.id} paymentMethods={paymentMethods} />
                            {due.payment_reference && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, background: 'rgba(30,72,119,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                Ref: {due.payment_reference}
                              </div>
                            )}
                          </>
                        )}
                        {due.status === 'Completed' && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ReceiptGenerator transaction={due} />
                          </div>
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

    </div>
  );
}
