const fs = require('fs');

// Fix ExportPdfButton
let pdfContent = fs.readFileSync('src/components/ExportPdfButton.js', 'utf8');
pdfContent = pdfContent.replace(/txn\.amount\.toLocaleString\(\)/g, '(txn.amount || 0).toLocaleString()');
pdfContent = pdfContent.replace(/totalIncome \+= txn\.amount;/g, 'totalIncome += (txn.amount || 0);');
pdfContent = pdfContent.replace(/totalExpense \+= txn\.amount;/g, 'totalExpense += (txn.amount || 0);');
pdfContent = pdfContent.replace(/className=\{className\}/, 'className={className || "secondaryBtn"} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}');
fs.writeFileSync('src/components/ExportPdfButton.js', pdfContent);

// Fix ExportExcelButton
let excelContent = fs.readFileSync('src/components/ExportExcelButton.js', 'utf8');
excelContent = excelContent.replace(/className=\{className\}/, 'className={className || "secondaryBtn"} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}');
fs.writeFileSync('src/components/ExportExcelButton.js', excelContent);
