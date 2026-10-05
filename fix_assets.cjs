const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/assets/AssetsClient.js', 'utf8');
content = content.replace(/value="Other"/g, 'value="Custom Category"');
content = content.replace(/>Other \(Specify Name\)</g, '>Custom Category<');
content = content.replace(/newAssetName === "Other"/g, 'newAssetName === "Custom Category"');
fs.writeFileSync('src/app/dashboard/assets/AssetsClient.js', content);
