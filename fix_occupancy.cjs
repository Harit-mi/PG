const fs = require('fs');
const path = 'src/app/dashboard/DashboardClient.js';
let content = fs.readFileSync(path, 'utf8');

const oldFilter = `  // Date filtering helper
  const isDateInRange = (dateStr) => {`;

const newFilter = `  // Tenant historical occupancy helper
  const isTenantOccupyingInPeriod = (dateStr) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (dateFilter === "Last Month") {
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date < startOfThisMonth;
    }
    return true; // For Today, This Month, and All, an Active tenant is always occupying
  };

  // Date filtering helper
  const isDateInRange = (dateStr) => {`;

content = content.replace(oldFilter, newFilter);

const oldTenants = `  const filteredTenants = useMemo(() => tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === "Active"), [tenants, activePropertyIds]);`;
const newTenants = `  const filteredTenants = useMemo(() => tenants.filter(t => activePropertyIds.includes(t.property_id) && t.status === "Active" && isTenantOccupyingInPeriod(t.move_in_date || t.created_at)), [tenants, activePropertyIds, dateFilter, now]);`;

content = content.replace(oldTenants, newTenants);

fs.writeFileSync(path, content);
console.log("Fixed occupancy logic");
