const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/leaves/LeavesClient.js', 'utf8');

const blobLogic = `    const csvString = [headers.join(","), ...rows.map(e => e.map(val => \`"\${String(val || '').replace(/"/g, '""')}"\`).join(","))].join("\\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`leave_logs_\${Date.now()}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);`;

content = content.replace(/const csvContent = "data:text\/csv;charset=utf-8,"[\s\S]*?document\.body\.removeChild\(link\);/, blobLogic);

fs.writeFileSync('src/app/dashboard/leaves/LeavesClient.js', content);
