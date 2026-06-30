"use client";

import { Download } from "lucide-react";

export default function ExportComplaintsExcel({ complaints }) {
  const exportToCSV = () => {
    // Define headers matching requested schema
    const headers = [
      "Complaint ID",
      "Tenant",
      "Room",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Created Date",
      "Updated Date"
    ];

    const csvContent = [
      headers.join(","),
      ...complaints.map(ticket => {
        return [
          ticket.id,
          `"${ticket.tenants?.name || 'Unknown'}"`,
          ticket.tenants?.room_number || 'N/A',
          `"${ticket.issue.replace(/"/g, '""')}"`,
          ticket.category,
          ticket.priority,
          ticket.status,
          new Date(ticket.created_at).toLocaleDateString(),
          new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Complaints_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={exportToCSV}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
        background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer',
        fontSize: '0.85rem'
      }}
    >
      <Download size={16} /> Export Excel
    </button>
  );
}
