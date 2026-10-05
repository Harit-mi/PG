const fs = require('fs');
const path = 'src/app/dashboard/DashboardClient.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /  \}, \[properties, rooms, tenants, transactions, complaints, sortField, sortAsc\]\);/g,
  '  }, [properties, rooms, tenants, transactions, complaints, sortField, sortAsc, dateFilter]);'
);

fs.writeFileSync(path, content);
console.log("Fixed dependencies");
