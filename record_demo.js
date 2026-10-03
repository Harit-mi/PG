const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const os = require('os');
const path = require('path');

async function run() {
  console.log("Starting browser for recording...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    ffmpeg_Path: null, // It will use ffmpeg-static automatically if installed by the module
    videoFrame: {
      width: 1440,
      height: 900,
    },
    aspectRatio: '16:9',
  });

  const desktopPath = path.join(os.homedir(), 'Desktop');
  const savePath = path.join(desktopPath, 'PG_Owner_App_Demo.mp4');

  const baseUrl = 'http://localhost:3000';

  try {
    console.log("Starting recording...");
    await recorder.start(savePath);

    // 1. Dashboard Overview
    console.log("Navigating to dashboard...");
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Simulate user reading/scrolling
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1000));

    // 2. Room Board
    console.log("Navigating to room board...");
    await page.goto(`${baseUrl}/dashboard/room-board`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // 3. Tenants
    console.log("Navigating to tenants...");
    await page.goto(`${baseUrl}/dashboard/tenants`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // 4. Food Menu
    console.log("Navigating to food menu...");
    await page.goto(`${baseUrl}/dashboard/menu`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log("Stopping recording...");
    await recorder.stop();
    console.log(`Video saved successfully to ${savePath}`);
  } catch (err) {
    console.error("Error during recording:", err);
  } finally {
    await browser.close();
  }
}
run();
