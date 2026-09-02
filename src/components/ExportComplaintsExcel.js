"use client";

import { Download } from "lucide-react";

export default function ExportComplaintsExcel({ complaints }) {
  const exportToCsv = () => {
    if (!complaints || complaints.length === 0) {
      alert("No complaints data to export");
      return;
    }

    const headers = ["Ticket ID", "Tenant", "Room", "Issue", "Category", "Priority", "Status", "Created Date"];
    
    const rows = complaints.map(ticket => [
      ticket.ticket_id || ticket.id,
      ticket.tenants?.name || 'N/A',
      ticket.tenants?.room_number || 'N/A',
      ticket.issue,
      ticket.category,
      ticket.priority,
      ticket.status,
      new Date(ticket.created_at).toLocaleDateString()
    ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={exportToCsv}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
        background: 'var(--card-bg)', color: 'var(--foreground)', cursor: 'pointer',
        fontSize: '0.85rem'
      }}
    >
      <Download size={16} /> Export CSV
    </button>
  );
}
