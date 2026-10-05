const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/settings/page.js', 'utf8');

content = content.replace(
  /url={\`\$\{baseUrl\}\/pg\/\$\{propertyId\}\/tenant-portal\/leaves\`}/g,
  "url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=leave`}"
);
content = content.replace(
  /url={\`\$\{baseUrl\}\/pg\/\$\{propertyId\}\/tenant-portal\/rent\`}/g,
  "url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=payments`}"
);
content = content.replace(
  /url={\`\$\{baseUrl\}\/pg\/\$\{propertyId\}\/tenant-portal\/visitors\`}/g,
  "url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=visitor`}"
);
content = content.replace(
  /url={\`\$\{baseUrl\}\/pg\/\$\{propertyId\}\/tenant-portal\/complaints\`}/g,
  "url={`${baseUrl}/pg/${propertyId}/tenant-portal?tab=complaint`}"
);

// Add Main Portal Link
content = content.replace(
  /<CopyablePortalLink \n                label="Tenant Leave Request Portal"/,
  '<CopyablePortalLink \n                label="Main Tenant Portal" \n                url={`${baseUrl}/pg/${propertyId}/tenant-portal`} \n              />\n              <CopyablePortalLink \n                label="Tenant Leave Request Portal"'
);

fs.writeFileSync('src/app/dashboard/settings/page.js', content);
