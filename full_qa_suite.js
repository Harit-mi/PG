const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = {
  mobile: { width: 375, height: 812, isMobile: true },
  tablet: { width: 768, height: 1024, isMobile: false },
  desktop: { width: 1440, height: 900, isMobile: false }
};

const ROUTES = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Room_Board', url: '/dashboard/room-board' },
  { name: 'Tenants', url: '/dashboard/tenants' },
  { name: 'Finances', url: '/dashboard/finances' }
];

async function run() {
  console.log("Starting Full QA Suite...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.join(__dirname, 'qa_reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const baseUrl = 'http://localhost:3000';
  let report = { errors: [], passes: 0, failures: 0 };

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    console.log(`\n--- Testing Viewport: ${vpName.toUpperCase()} ---`);
    for (const route of ROUTES) {
      const page = await browser.newPage();
      
      // Listen for console errors (frontend/backend bugs)
      page.on('console', msg => {
        if (msg.type() === 'error') {
          report.errors.push(`[${vpName}] ${route.name} - Console Error: ${msg.text()}`);
        }
      });
      page.on('pageerror', error => {
        report.errors.push(`[${vpName}] ${route.name} - Page Error: ${error.message}`);
      });
      page.on('response', response => {
        if (!response.ok() && response.request().resourceType() === 'fetch') {
           report.errors.push(`[${vpName}] ${route.name} - API Failed: ${response.url()} (${response.status()})`);
        }
      });

      await page.setViewport(vp);
      try {
        console.log(`Navigating to ${route.name}...`);
        await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'load', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000)); // Wait for render
        
        // Take screenshot
        const shotPath = path.join(outDir, `${route.name}_${vpName}.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        
        // Test basic interaction (click a button if it exists)
        try {
          const btn = await page.$('button');
          if (btn) {
            await btn.click();
            await new Promise(r => setTimeout(r, 500));
          }
        } catch (clickErr) {
           report.errors.push(`[${vpName}] ${route.name} - Button Click Failed: ${clickErr.message}`);
        }
        
        console.log(`✓ Passed: ${route.name} on ${vpName}`);
        report.passes++;
      } catch (err) {
        console.error(`✗ Failed: ${route.name} on ${vpName} - ${err.message}`);
        report.errors.push(`[${vpName}] ${route.name} - Crash: ${err.message}`);
        report.failures++;
      } finally {
        await page.close();
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log("\nQA Complete. Report saved.");
  await browser.close();
}
run();
