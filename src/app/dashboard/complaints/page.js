import styles from "./page.module.css";
import { AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";

export default function ComplaintsPage() {
  const complaints = [
    { id: "TKT-001", tenant: "Aman Gupta (102)", issue: "AC not cooling", category: "Electrical", status: "Open", date: "Today, 10:30 AM", priority: "High" },
    { id: "TKT-002", tenant: "Vikram Singh (104)", issue: "WiFi dropping frequently", category: "Internet", status: "In Progress", date: "Yesterday, 4:15 PM", priority: "Medium" },
    { id: "TKT-003", tenant: "Sneha Desai (104)", issue: "Leaking tap in bathroom", category: "Plumbing", status: "Resolved", date: "15 Jun 2026", priority: "Low" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Complaints & Requests</h1>
          <p className={styles.subtitle}>Track and resolve tenant issues.</p>
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className={styles.kanbanBoard}>
        {/* Open Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <AlertCircle size={18} className={styles.iconOpen} />
              <h3>Open</h3>
            </div>
            <span className={styles.countBadge}>1</span>
          </div>
          <div className={styles.ticketList}>
            {complaints.filter(c => c.status === "Open").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <Clock size={18} className={styles.iconProgress} />
              <h3>In Progress</h3>
            </div>
            <span className={styles.countBadge}>1</span>
          </div>
          <div className={styles.ticketList}>
            {complaints.filter(c => c.status === "In Progress").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* Resolved Column */}
        <div className={`${styles.column} glass`}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <CheckCircle2 size={18} className={styles.iconResolved} />
              <h3>Resolved</h3>
            </div>
            <span className={styles.countBadge}>1</span>
          </div>
          <div className={styles.ticketList}>
            {complaints.filter(c => c.status === "Resolved").map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket }) {
  return (
    <div className={styles.ticketCard}>
      <div className={styles.ticketHeader}>
        <span className={styles.ticketId}>{ticket.id}</span>
        <span className={`${styles.priorityBadge} ${styles[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h4 className={styles.ticketIssue}>{ticket.issue}</h4>
      <p className={styles.ticketTenant}>{ticket.tenant}</p>
      <div className={styles.ticketFooter}>
        <span className={styles.ticketCategory}>{ticket.category}</span>
        <span className={styles.ticketDate}>{ticket.date}</span>
      </div>
    </div>
  );
}
