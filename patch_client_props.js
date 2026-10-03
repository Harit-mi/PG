const fs = require('fs');
const path = 'src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'todayMenu = null,',
  'todayMenu = null, \n  weeklyMenu = [],'
);

fs.writeFileSync(path, code);
