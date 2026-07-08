"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReceiptGenerator({ transaction }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const tenantName = transaction.tenants?.name || "Tenant";
      const roomNumber = transaction.tenants?.room_number || "N/A";
      const amount = transaction.amount;
      const paymentDate = transaction.payment_date 
        ? new Date(transaction.payment_date).toLocaleDateString() 
        : new Date(transaction.date).toLocaleDateString();
      const paymentMethod = transaction.payment_method || "Cash";
      const transactionId = transaction.id;
      const propertyName = transaction.properties?.name || "Premium PG Management";
      const collectedBy = transaction.employees?.name || "Admin";

      // Header & Logo (Stylized text for now)
      doc.setFillColor(41, 128, 185);
      doc.rect(20, 15, 12, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("PG", 22, 23);
      
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text("PAYMENT RECEIPT", 105, 22, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(propertyName, 190, 22, { align: "right" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Receipt ID: ${transactionId.slice(0, 8).toUpperCase()}`, 105, 28, { align: "center" });
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 105, 33, { align: "center" });

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 40, 190, 40);

      // Details Table
      doc.autoTable({
        startY: 45,
        theme: "plain",
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [60, 60, 60], cellWidth: 60 },
          1: { textColor: [100, 100, 100] }
        },
        body: [
          ["Receipt No. / Txn ID:", transactionId],
          ["Received From (Tenant Name):", tenantName],
          ["Room Number:", roomNumber],
          ["Payment For:", transaction.category || "Rent"],
          ["Payment Date:", paymentDate],
          ["Payment Method:", paymentMethod],
          ["Collected By:", collectedBy]
        ]
      });

      // Amount Box
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(20, finalY, 170, 30, 3, 3, "F");
      
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text("Amount Paid:", 30, finalY + 19);

      doc.setFontSize(18);
      doc.setTextColor(39, 174, 96); // Green color
      doc.text(`Rs. ${amount.toLocaleString()}`, 160, finalY + 19, { align: "right" });

      // Signature Area
      const sigY = finalY + 50;
      doc.setDrawColor(150, 150, 150);
      doc.line(140, sigY, 190, sigY);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("Authorized Signature", 165, sigY + 5, { align: "center" });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your prompt payment.", 105, sigY + 20, { align: "center" });
      doc.text("This is a computer generated receipt and is valid without a physical signature.", 105, sigY + 27, { align: "center" });

      // Save the PDF
      doc.save(`Receipt_${tenantName.replace(/\s+/g, '_')}_${paymentDate}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate receipt.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)',
        padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
        fontSize: '0.75rem', fontWeight: '500', marginLeft: '0.5rem'
      }}
      title="Download Receipt"
    >
      <Download size={14} /> {loading ? "..." : "Receipt"}
    </button>
  );
}
