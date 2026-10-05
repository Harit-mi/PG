const fs = require('fs');
let content = fs.readFileSync('src/app/layout.js', 'utf8');

// Remove api.fontshare.com link and the Google fonts link for Syncopate/Bricolage
content = content.replace(/<link rel="preconnect" href="https:\/\/api\.fontshare\.com" \/>\n\s*<link\n\s*href="https:\/\/api\.fontshare\.com\/v2\/css\?f\[\]=general-sans[^>]+>\n/g, '');
content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>\n\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossOrigin="anonymous" \/>\n\s*<link\n\s*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Syncopate[^>]+>\n/g, '');

fs.writeFileSync('src/app/layout.js', content);
console.log("Removed unnecessary font links from layout.js");
