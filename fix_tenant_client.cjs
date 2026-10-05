const fs = require('fs');
let content = fs.readFileSync('src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js', 'utf8');

if (!content.includes('useSearchParams')) {
  content = content.replace(
    /import \{ useState, useEffect \} from "react";/,
    'import { useState, useEffect } from "react";\nimport { useSearchParams } from "next/navigation";'
  );
  
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState\("home"\);/,
    'const searchParams = useSearchParams();\n  const initialTab = searchParams.get("tab") || "home";\n  const [activeTab, setActiveTab] = useState(initialTab);'
  );
}

fs.writeFileSync('src/app/pg/[property_id]/tenant-portal/TenantPortalClient.js', content);
