const jsPDF = require('jspdf');
require('jspdf-autotable');

try {
  const doc = new jsPDF.jsPDF();
  doc.autoTable({
    startY: 45,
    body: [["A", "B"]]
  });
  console.log("lastAutoTable:", !!doc.lastAutoTable);
  console.log("previousAutoTable:", !!doc.previousAutoTable);
  console.log("autoTable.previous:", !!doc.autoTable.previous);
} catch (e) {
  console.error(e);
}
