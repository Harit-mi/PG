const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log("Starting browser for PRO recording...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    videoFrame: { width: 1440, height: 900 },
    aspectRatio: '16:9',
  });

  const rawVideoPath = path.join(__dirname, 'raw_video.mp4');
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const savePath = path.join(desktopPath, 'PG_Owner_App_Demo_Pro.mp4');

  const baseUrl = 'http://localhost:3001'; // Using the PRODUCTION build

  try {
    console.log("Starting recording...");
    await recorder.start(rawVideoPath);

    // Timeline synced to the 32 second voiceover:
    // 0-2s: "Welcome to OUR P G. The ultimate management software for your hostel."
    console.log("Navigating to dashboard...");
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // 2-10s: "From the smart dashboard, you can see your active tenants and monthly revenue at a glance."
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    // 10-18s: "Navigate to the visual room board to instantly know which beds are occupied, or which ones are vacant."
    console.log("Navigating to room board...");
    await page.goto(`${baseUrl}/dashboard/room-board`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));

    // 18-24s: "Let's switch over to the Tenant Directory, where you can track all residents, their move-in dates, and pending dues."
    console.log("Navigating to tenants...");
    await page.goto(`${baseUrl}/dashboard/tenants`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 6000));

    // 24-30s: "And finally, check out the Kitchen module, where you can publish the weekly food menu directly to the tenant's mobile portal."
    console.log("Navigating to food menu...");
    await page.goto(`${baseUrl}/dashboard/menu`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 6000));
    
    // 30-32s: "Managing your P G has never been this easy. Get started today."
    await new Promise(r => setTimeout(r, 2000));

    console.log("Stopping recording...");
    await recorder.stop();
    await browser.close();

    console.log("Muxing audio and video...");
    // Use the local ffmpeg binary to mux raw_video.mp4 and voiceover.mp3
    const ffmpegPath = path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'darwin-arm64', 'ffmpeg');
    execSync(`"${ffmpegPath}" -y -i raw_video.mp4 -i voiceover.mp3 -c:v copy -c:a aac -shortest "${savePath}"`);
    
    console.log(`Professional Video with Voiceover saved successfully to ${savePath}`);
  } catch (err) {
    console.error("Error during recording:", err);
  } finally {
    if (browser.isConnected()) await browser.close();
  }
}
run();
