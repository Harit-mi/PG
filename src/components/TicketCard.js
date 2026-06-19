"use client";

import { updateComplaintStatus } from "@/app/actions";
import styles from "../app/dashboard/complaints/page.module.css";
import { useState } from "react";

export default function TicketCard({ ticket }) {
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setLoading(true);
    await updateComplaintStatus(ticket.id, newStatus);
    setLoading(false);
  }

  return (
    <div className={styles.ticketCard} style={{ opacity: loading ? 0.6 : 1 }}>
      <div className={styles.ticketHeader}>
        <span className={styles.ticketId}>{ticket.id.substring(0, 8)}</span>
        <span className={`${styles.priorityBadge} ${styles[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h4 className={styles.ticketIssue}>{ticket.issue}</h4>
      <p className={styles.ticketTenant}>
        {ticket.tenants ? `${ticket.tenants.name} (${ticket.tenants.room_number})` : 'Unknown Tenant'}
      </p>
      
      <div className={styles.ticketFooter}>
        <span className={styles.ticketCategory}>{ticket.category}</span>
        
        <select 
          value={ticket.status} 
          onChange={handleStatusChange}
          disabled={loading}
          style={{ 
            fontSize: '0.75rem', 
            padding: '2px 4px', 
            borderRadius: '4px', 
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--foreground)'
          }}
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      <div className={styles.ticketDate}>
        {new Date(ticket.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
