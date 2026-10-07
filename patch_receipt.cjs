const fs = require('fs');
let content = fs.readFileSync('src/components/ReceiptGenerator.js', 'utf8');

content = content.replace(
  "doc.save(`Receipt_${tenantName.replace(/\\s+/g, '_')}_${paymentDate}.pdf`);",
  `const safeDate = paymentDate.replace(/\\//g, '-');\n      doc.save(\`Receipt_\${tenantName.replace(/\\s+/g, '_')}_\${safeDate}.pdf\`);`
);

fs.writeFileSync('src/components/ReceiptGenerator.js', content);
