const fs = require('fs');
const path = 'src/app/dashboard/DashboardClient.js';
let content = fs.readFileSync(path, 'utf8');

const oldComplaints = `  const filteredComplaints = useMemo(() => complaints.filter(c => activePropertyIds.includes(c.property_id)), [complaints, activePropertyIds]);`;
const newComplaints = `  const filteredComplaints = useMemo(() => complaints.filter(c => activePropertyIds.includes(c.property_id) && isTenantOccupyingInPeriod(c.created_at)), [complaints, activePropertyIds, dateFilter, now]);`;

content = content.replace(oldComplaints, newComplaints);

fs.writeFileSync(path, content);
console.log("Fixed complaints logic");
