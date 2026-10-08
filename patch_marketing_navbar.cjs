const fs = require('fs');
let content = fs.readFileSync('src/components/MarketingNavbar.js', 'utf8');

content = content.replace(
  /window\.location\.href = `\$\{protocol\}\/\/app\.\$\{baseHost\}\/app`;/g,
  "window.location.href = `${protocol}//app.${baseHost}/`;"
);

content = content.replace(
  /router\.push\('\/app'\);/g,
  "router.push('/');"
);

fs.writeFileSync('src/components/MarketingNavbar.js', content);
