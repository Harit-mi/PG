const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log("Launching puppeteer browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const routes = [
    { url: 'http://localhost:3005/dashboard', filename: 'dashboard.png' },
    { url: 'http://localhost:3005/dashboard/room-board', filename: 'room_board.png' },
    { url: 'http://localhost:3005/dashboard/rooms', filename: 'rooms.png' },
    { url: 'http://localhost:3005/dashboard/tenants', filename: 'tenants.png' },
    { url: 'http://localhost:3005/dashboard/finances', filename: 'finances.png' },
    { url: 'http://localhost:3005/dashboard/dues', filename: 'dues.png' },
    { url: 'http://localhost:3005/dashboard/kitchen', filename: 'kitchen.png' },
    { url: 'http://localhost:3005/dashboard/complaints', filename: 'complaints.png' }
  ];

  const targetDir = '/Users/haritmishra/.gemini/antigravity/brain/58c9ff16-eef6-420b-9651-50478fd60920';

  for (const r of routes) {
    try {
      console.log(`Navigating to ${r.url}...`);
      await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 10000 });
      const dest = path.join(targetDir, r.filename);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`Saved screenshot to ${dest}`);
    } catch (err) {
      console.error(`Failed to capture ${r.url}:`, err.message);
    }
  }

  await browser.close();
  console.log("Screenshot capture process finished successfully.");
})();
