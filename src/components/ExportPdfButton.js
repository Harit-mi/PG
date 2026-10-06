"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPdfButton({ transactions, className }) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Financial Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    
    const tableData = transactions.map(txn => {
      if (txn.type === "Income") totalIncome += (txn.amount || 0);
      else totalExpense += (txn.amount || 0);

      return [
        new Date(txn.date).toLocaleDateString(),
        txn.tenants ? `${txn.tenants.name} (${txn.tenants.room_number})` : txn.category,
        txn.category,
        txn.type,
        `Rs ${(txn.amount || 0).toLocaleString()}`
      ];
    });

    // Add totals summary
    doc.text(`Total Income: Rs ${totalIncome.toLocaleString()}`, 14, 40);
    doc.text(`Total Expense: Rs ${totalExpense.toLocaleString()}`, 14, 46);
    doc.text(`Net Balance: Rs ${(totalIncome - totalExpense).toLocaleString()}`, 14, 52);

    // Add table
    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Brand primary color
    });

    doc.save(`PG_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button onClick={handleExport} className={className || "secondaryBtn"} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
      <Download size={18} /> Export PDF
    </button>
  );
}
