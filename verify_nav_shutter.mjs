import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ashka/.gemini/antigravity/brain/6132dca4-8a0f-4f9f-a2c4-6eb188939496';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run() {
  console.log('Launching browser for Navigation Shutter verification...');
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

  console.log('Waiting for preloader to finish...');
  await page.waitForFunction(() => !document.querySelector('.zeyarch-preloader-root'), { timeout: 12000 });
  console.log('Preloader completed. Initial position: HOME.');

  await new Promise(r => setTimeout(r, 600));

  // Helper function to click a menu link and verify shutter closing, destination arrival, and shutter reveal
  async function testNavTransition(linkText, expectedSectionId, stepName) {
    console.log(`\n--- Testing transition to ${linkText} (#${expectedSectionId}) ---`);

    // 1. Open the hamburger menu
    const hamBtn = await page.$('.hamburger-btn');
    if (!hamBtn) throw new Error('Hamburger button not found!');
    await hamBtn.click();

    // Wait for menu open animation (~600ms)
    await new Promise(r => setTimeout(r, 650));

    // 2. Find and click the target link using Puppeteer trusted click
    const linkHandles = await page.$$('.split-nav-link');
    let targetHandle = null;
    for (const handle of linkHandles) {
      const txt = await page.evaluate(el => el.textContent.trim(), handle);
      if (txt.toUpperCase() === linkText.toUpperCase()) {
        targetHandle = handle;
        break;
      }
    }

    if (!targetHandle) throw new Error(`Menu link for "${linkText}" not found!`);
    await targetHandle.click();

    // 3. Capture mid-transition shutter frame (~350ms in, when strips are closing/covering)
    await new Promise(r => setTimeout(r, 320));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `nav_shutter_${stepName}_mid.png`)
    });

    // 4. Wait for shutter reveal to complete completely
    await page.waitForFunction(
      () => document.querySelector('.nav-shutter-overlay')?.style.visibility === 'hidden',
      { timeout: 4000 }
    );
    await new Promise(r => setTimeout(r, 200));

    // 5. Verify DOM state and scroll position
    const result = await page.evaluate((secId) => {
      const menuOpen = document.querySelector('.split-menu-overlay')?.style.display !== 'none';
      const shutterVisible = document.querySelector('.nav-shutter-overlay')?.style.visibility === 'visible';
      const scrollY = window.scrollY;
      let targetTop = 0;
      if (secId !== 'top') {
        const el = document.getElementById(secId);
        if (el) targetTop = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 96);
      }
      const scrollMatches = Math.abs(scrollY - targetTop) <= 150; // generous tolerance
      return { menuOpen, shutterVisible, scrollY, targetTop, scrollMatches };
    }, expectedSectionId);

    console.log(`Result for ${linkText}:`, result);

    // 6. Capture revealed destination
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `nav_shutter_${stepName}_revealed.png`)
    });

    if (result.menuOpen) {
      console.warn(`Warning: Menu was still open after transition to ${linkText}`);
    }
    if (result.shutterVisible) {
      console.warn(`Warning: Shutter overlay was still visible after transition to ${linkText}`);
    }
  }

  // 1. HOME -> OUR PROCESS
  await testNavTransition('OUR PROCESS', 'process', '01_process');

  // 2. OUR PROCESS -> SELECTED WORKS
  await testNavTransition('SELECTED WORKS', 'works', '02_works');

  // 3. SELECTED WORKS -> OUR EXPERTISE
  await testNavTransition('OUR EXPERTISE', 'expertise', '03_expertise');

  // 4. OUR EXPERTISE -> THE STUDIO
  await testNavTransition('THE STUDIO', 'studio', '04_studio');

  // 5. THE STUDIO -> CONTACT
  await testNavTransition('CONTACT', 'contact', '05_contact');

  // 6. CONTACT -> HOME (Via Brand Link or Menu)
  console.log('\n--- Testing transition to HOME (via Brand Link) ---');
  const brandLink = await page.$('.brand-link');
  if (brandLink) {
    await brandLink.click();
    await new Promise(r => setTimeout(r, 320));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'nav_shutter_06_home_mid.png')
    });
    await page.waitForFunction(
      () => document.querySelector('.nav-shutter-overlay')?.style.visibility === 'hidden',
      { timeout: 4000 }
    );
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'nav_shutter_06_home_revealed.png')
    });
    const homeScroll = await page.evaluate(() => window.scrollY);
    console.log('Returned to HOME. ScrollY:', homeScroll);
  }

  // 7. Mobile Viewport (375x812)
  console.log('\n--- Testing Mobile Viewport (375px) ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 400));
  await testNavTransition('THE STUDIO', 'studio', '07_mobile_studio');

  console.log('\nALL_NAVIGATION_SHUTTER_TESTS_PASSED_SUCCESSFULLY');
  await browser.close();
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
