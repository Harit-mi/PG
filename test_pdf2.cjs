const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

try {
  const doc = new jsPDF();
  autoTable(doc, {
    startY: 45,
    body: [["A", "B"]]
  });
  console.log("lastAutoTable:", !!doc.lastAutoTable);
  console.log("previousAutoTable:", !!doc.previousAutoTable);
} catch (e) {
  console.error(e);
}
