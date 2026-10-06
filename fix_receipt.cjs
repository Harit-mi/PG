const fs = require('fs');
let content = fs.readFileSync('src/components/ReceiptGenerator.js', 'utf8');

// Replace import
content = content.replace(/import "jspdf-autotable";/, 'import autoTable from "jspdf-autotable";');

// Replace doc.autoTable(
content = content.replace(/doc\.autoTable\(\{/g, 'autoTable(doc, {');

fs.writeFileSync('src/components/ReceiptGenerator.js', content);
