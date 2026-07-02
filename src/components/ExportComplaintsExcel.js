"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function ExportComplaintsExcel({ complaints }) {
  const exportToExcel = () => {
    // Define rows matching requested schema
    const rows = complaints.map(ticket => ({
      "Complaint ID": ticket.id,
      "Tenant": ticket.tenants?.name || 'Unknown',
      "Room": ticket.tenants?.room_number || 'N/A',
      "Title": ticket.issue,
      "Description": ticket.issue, // The issue field contains the description/title.
      "Category": ticket.category,
      "Priority": ticket.priority,
      "Status": ticket.status,
      "Created Date": new Date(ticket.created_at).toLocaleDateString(),
      "Updated Date": new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");

    XLSX.writeFile(workbook, `Complaints_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button 
      onClick={exportToExcel}
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
