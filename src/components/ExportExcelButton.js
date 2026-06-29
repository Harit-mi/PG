"use client";

import { Download } from "lucide-react";

export default function ExportExcelButton({ transactions, className }) {
  const exportToCsv = () => {
    if (!transactions || transactions.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Date", "Type", "Category", "Amount", "Status", "Description"];
    
    const rows = transactions.map(txn => {
      const description = txn.tenants ? `${txn.tenants.name} (${txn.tenants.room_number})` : 
                          txn.employees ? `Salary: ${txn.employees.name}` : 
                          txn.category;
                          
      return [
        txn.id,
        new Date(txn.date).toLocaleDateString(),
        txn.type,
        txn.category,
        txn.amount,
        txn.status,
        description
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finances_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={exportToCsv} className={className}>
      <Download size={18} /> Export CSV
    </button>
  );
}
