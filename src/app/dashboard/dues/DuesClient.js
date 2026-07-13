"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { CheckCircle, Clock, Search, Filter } from "lucide-react";
import MarkPaidModal from "@/components/MarkPaidModal";
import ReceiptGenerator from "@/components/ReceiptGenerator";
import { supabase } from "@/utils/supabase";

export default function DuesClient({ initialDues, propertyId, paymentMethods = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // "All", "Paid", "Pending", "Overdue"
  const [dateFilter, setDateFilter] = useState("All"); // "Today", "This Week", "This Month", "All"

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

  const generateDummyData = async () => {
    if (propertyId === 'all' || !propertyId) {
      alert("Please select a specific property from the sidebar to generate dummy data.");
      return;
    }
    
    // Find some tenants
    const { data: tenants } = await supabase.from('tenants').select('id').eq('property_id', propertyId).limit(3);
    
    if (!tenants || tenants.length === 0) {
      alert("You need at least one tenant to generate dummy dues.");
      return;
    }

    const dummyTransactions = [
      {
        property_id: propertyId,
        tenant_id: tenants[0]?.id,
        type: 'Income',
        category: 'Rent',
        amount: 8000,
        status: 'Pending',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Overdue
      },
      {
        property_id: propertyId,
        tenant_id: tenants[1]?.id || tenants[0]?.id,
        type: 'Income',
        category: 'Rent',
        amount: 9500,
        status: 'Pending',
        date: new Date().toISOString() // Today
      },
      {
        property_id: propertyId,
        tenant_id: tenants[2]?.id || tenants[0]?.id,
        type: 'Income',
        category: 'Rent',
        amount: 7000,
        status: 'Completed',
        date: new Date().toISOString()
      }
    ];

    await supabase.from('transactions').insert(dummyTransactions);
    window.location.reload();
  };

  return (
    <div>
      <div className={styles.controls} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className={styles.searchBar} style={{ flex: 1, minWidth: '250px', background: 'rgba(255, 255, 255, 0.5)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <Search size={20} className={styles.searchIcon} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by name or room number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
          />
        </div>
        
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}>
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}>
          <option value="All">All Dates</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>

        <button onClick={generateDummyData} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
          Generate Dummy Data
        </button>
      </div>

      <div className={`${styles.tableContainer} glass`}>
        {filteredDues.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle size={48} style={{ margin: "0 auto 1rem", color: "var(--success)" }} />
            <h3>No Records Found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.map((due) => {
                const tenant = due.tenants || {};
                const upiId = "yourname@upi";
                const message = `Hi ${tenant.name}, a gentle reminder that your rent of ₹${due.amount} is pending. Please pay via UPI: ${upiId}.`;
                const whatsappUrl = `https://wa.me/${tenant.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

                return (
                  <tr key={due.id}>
                    <td style={{ fontWeight: '600' }}>{tenant.name || 'Unknown'}</td>
                    <td><span className={styles.roomBadge}>{tenant.room_number || 'N/A'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} style={{ color: due.status === 'Completed' ? 'var(--success)' : 'var(--warning)' }} />
                        {new Date(due.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {due.status === 'Pending' && due.payment_reference ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          Pending Verification
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${due.status === 'Completed' ? styles.Completed : ''}`} style={due.status === 'Pending' ? { background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' } : {}}>
                          {due.status}
                        </span>
                      )}
                    </td>
                    <td style={{ color: due.status === 'Completed' ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>₹{due.amount.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {due.status === 'Pending' && (
                          <>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.waBtn} style={{ background: '#25D366', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem' }}>
                              WhatsApp
                            </a>
                            <MarkPaidModal transactionId={due.id} paymentMethods={paymentMethods} />
                            {due.payment_reference && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                Ref: {due.payment_reference}
                              </div>
                            )}
                          </>
                        )}
                        {due.status === 'Completed' && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Paid</span>
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
