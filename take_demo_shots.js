const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const shotPath = path.join(__dirname, 'shots');
  if (!fs.existsSync(shotPath)) fs.mkdirSync(shotPath);

  // Note: Localhost server should be running
  const baseUrl = 'http://localhost:3000';

  try {
    // 1. Dashboard Overview
    console.log("Navigating to dashboard...");
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Hide the bypass button if we're somehow on login, or wait for dashboard
    await new Promise(r => setTimeout(r, 2000)); 
    await page.screenshot({ path: path.join(shotPath, 'demo_dashboard.png') });

    // 2. Room Board
    console.log("Navigating to room board...");
    await page.goto(`${baseUrl}/dashboard/room-board`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(shotPath, 'demo_rooms.png') });

    // 3. Tenants
    console.log("Navigating to tenants...");
    await page.goto(`${baseUrl}/dashboard/tenants`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(shotPath, 'demo_tenants.png') });

    // 4. Food Menu
    console.log("Navigating to food menu...");
    await page.goto(`${baseUrl}/dashboard/menu`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(shotPath, 'demo_menu.png') });

    console.log("Screenshots saved.");
  } catch (err) {
    console.error("Error during screenshots:", err);
  } finally {
    await browser.close();
  }
}
run();
