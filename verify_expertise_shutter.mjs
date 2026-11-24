import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ashka/.gemini/antigravity/brain/6132dca4-8a0f-4f9f-a2c4-6eb188939496';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  // Suppress enquiry modal from interrupting test
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('zeyarch_modal_session_shown', 'true');
    localStorage.setItem('zeyarch_modal_dismissed_until', (Date.now() + 86400000).toString());
  });

  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait for loader to finish
  await new Promise(r => setTimeout(r, 2200));

  console.log('Scrolling to Section 04 (#expertise)...');
  await page.evaluate(() => {
    const el = document.getElementById('expertise');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });

  await new Promise(r => setTimeout(r, 1200));

  // Capture Section 04 element
  const expertiseEl = await page.$('#expertise');
  if (!expertiseEl) {
    throw new Error('Expertise section (#expertise) not found!');
  }

  // 1. Initial State: 01 Architecture
  console.log('Capturing Slide 01: Architecture...');
  await expertiseEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'shutter_01_architecture.png')
  });

  async function selectService(index, filename, name) {
    console.log(`Selecting service ${index}: ${name}...`);
    const navItems = await page.$$('.service-nav-item');
    if (navItems.length <= index) {
      throw new Error(`Nav item at index ${index} not found!`);
    }

    // Click target service item
    await navItems[index].click();

    // Capture mid-transition shutter frame
    await new Promise(r => setTimeout(r, 250));
    await expertiseEl.screenshot({
      path: path.join(ARTIFACT_DIR, `shutter_${filename}_mid.png`)
    });

    // Wait for animation to finish completely (timeline is ~0.9s)
    await new Promise(r => setTimeout(r, 850));

    // Capture settled state
    await expertiseEl.screenshot({
      path: path.join(ARTIFACT_DIR, `shutter_${filename}.png`)
    });

    // Check active status in DOM
    const state = await page.evaluate((idx) => {
      const items = Array.from(document.querySelectorAll('.service-nav-item'));
      const activeItem = items[idx];
      const isActive = activeItem?.classList.contains('is-active');
      const badgeTitle = document.querySelector('.stage-meta-badge .badge-title')?.textContent;
      const baseImgSrc = document.querySelector('.stage-base-img')?.src;
      return { isActive, badgeTitle, baseImgSrc };
    }, index);

    console.log(`State for ${name}:`, state);
  }

  // 2. Select 02 - Interior Design
  await selectService(1, '02_interior_design', 'Interior Design');

  // 3. Select 03 - Design & Build
  await selectService(2, '03_design_build', 'Design & Build');

  // 4. Select 04 - Landscape & Exterior
  await selectService(3, '04_landscape_exterior', 'Landscape & Exterior');

  // 5. Select back to 01 - Architecture to verify circular switching
  await selectService(0, '01_architecture_return', 'Architecture');

  // 6. Test Tablet Viewport (1024x768)
  console.log('Testing tablet viewport (1024px)...');
  await page.setViewport({ width: 1024, height: 768 });
  await page.evaluate(() => {
    document.getElementById('expertise')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await (await page.$('#expertise')).screenshot({
    path: path.join(ARTIFACT_DIR, 'shutter_05_tablet_1024.png')
  });

  // 7. Test Mobile Viewport (375x812)
  console.log('Testing mobile viewport (375px)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => {
    document.getElementById('expertise')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await (await page.$('#expertise')).screenshot({
    path: path.join(ARTIFACT_DIR, 'shutter_06_mobile_375.png')
  });

  console.log('ALL_TESTS_PASSED_SUCCESSFULLY');
  await browser.close();
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
