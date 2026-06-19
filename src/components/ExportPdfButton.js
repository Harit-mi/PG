"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
      if (txn.type === "Income") totalIncome += txn.amount;
      else totalExpense += txn.amount;

      return [
        new Date(txn.date).toLocaleDateString(),
        txn.tenants ? `${txn.tenants.name} (${txn.tenants.room_number})` : txn.category,
        txn.category,
        txn.type,
        `Rs ${txn.amount.toLocaleString()}`
      ];
    });

    // Add totals summary
    doc.text(`Total Income: Rs ${totalIncome.toLocaleString()}`, 14, 40);
    doc.text(`Total Expense: Rs ${totalExpense.toLocaleString()}`, 14, 46);
    doc.text(`Net Balance: Rs ${(totalIncome - totalExpense).toLocaleString()}`, 14, 52);

    // Add table
    doc.autoTable({
      startY: 60,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Brand primary color
    });

    doc.save(`PG_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button onClick={handleExport} className={className}>
      <Download size={18} /> Export PDF
    </button>
  );
}
