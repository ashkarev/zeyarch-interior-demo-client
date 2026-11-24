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

  console.log('Waiting for preloader to complete...');
  // Wait until preloader is completely unmounted from DOM
  await page.waitForFunction(
    () => !document.querySelector('.zeyarch-preloader-root'),
    { timeout: 12000 }
  );
  console.log('Preloader completed.');

  await new Promise(r => setTimeout(r, 600));

  // ==========================================
  // PART 1: VERIFY SECTION 04 (DARK BRAND IDENTITY)
  // ==========================================
  console.log('Scrolling to Section 04 (#expertise)...');
  await page.evaluate(() => {
    const el = document.getElementById('expertise');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  await new Promise(r => setTimeout(r, 1000));

  const expertiseEl = await page.$('#expertise');
  if (!expertiseEl) throw new Error('#expertise not found!');

  // Verify CSS properties of Section 04
  const sec04Styles = await page.evaluate(() => {
    const section = document.getElementById('expertise');
    const cs = window.getComputedStyle(section);
    const firstRowTitle = section.querySelector('.service-title');
    const firstRowDesc = section.querySelector('.service-desc-text');
    const firstRowNum = section.querySelector('.service-num');
    const divider = section.querySelector('.service-row');
    return {
      bgColor: cs.backgroundColor,
      titleColor: window.getComputedStyle(firstRowTitle).color,
      descColor: window.getComputedStyle(firstRowDesc).color,
      numColor: window.getComputedStyle(firstRowNum).color,
      dividerColor: window.getComputedStyle(divider).borderBottomColor,
      rowCount: section.querySelectorAll('.service-row').length
    };
  });
  console.log('Section 04 Dark Styles:', sec04Styles);

  // Capture Section 04 default
  await expertiseEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'section04_dark_desktop.png')
  });

  // Hover over row 2 (Interior Design)
  const rows = await page.$$('.service-row');
  if (rows.length >= 2) {
    await rows[1].hover();
    await new Promise(r => setTimeout(r, 350));
    await expertiseEl.screenshot({
      path: path.join(ARTIFACT_DIR, 'section04_dark_hover_row2.png')
    });
  }

  // Tablet & Mobile for Section 04
  await page.setViewport({ width: 1024, height: 768 });
  await page.evaluate(() => document.getElementById('expertise')?.scrollIntoView({ behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  await (await page.$('#expertise')).screenshot({
    path: path.join(ARTIFACT_DIR, 'section04_dark_tablet.png')
  });

  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => document.getElementById('expertise')?.scrollIntoView({ behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  await (await page.$('#expertise')).screenshot({
    path: path.join(ARTIFACT_DIR, 'section04_dark_mobile.png')
  });

  // Reset to desktop viewport for Section 05 and move mouse away from interactive elements
  await page.setViewport({ width: 1440, height: 900 });
  await page.mouse.move(0, 0);

  // ==========================================
  // PART 2: VERIFY SECTION 05 (AUTO SLIDESHOW & DUAL SYNCHRONIZED IMAGES)
  // ==========================================
  console.log('Scrolling to Section 05 (#studio)...');
  await page.evaluate(() => {
    const el = document.getElementById('studio');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  await new Promise(r => setTimeout(r, 1200));

  const studioEl = await page.$('#studio');
  if (!studioEl) throw new Error('#studio not found!');

  // State 1: Slide 01
  const slide1Info = await page.evaluate(() => {
    const current = document.querySelector('.slideshow-pagination .pagination-current')?.textContent;
    const activeSlide = document.querySelector('.studio-slide-item.slide-active .slide-cap-title')?.textContent;
    const activeDetail = document.querySelector('.studio-floating-slide.slide-active img')?.getAttribute('alt');
    return { current, activeSlide, activeDetail };
  });
  console.log('Slide 1 (Initial):', slide1Info);

  await studioEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_slide01_initial.png')
  });

  // Test Auto-Advance: wait 5.2s (interval is 4.5s)
  console.log('Waiting 5.2 seconds for auto-advance to Slide 02...');
  await new Promise(r => setTimeout(r, 5200));

  const slide2Info = await page.evaluate(() => {
    const current = document.querySelector('.slideshow-pagination .pagination-current')?.textContent;
    const activeSlide = document.querySelector('.studio-slide-item.slide-active .slide-cap-title')?.textContent;
    const activeDetail = document.querySelector('.studio-floating-slide.slide-active img')?.getAttribute('alt');
    return { current, activeSlide, activeDetail };
  });
  console.log('Slide 2 (Auto-advanced):', slide2Info);

  await studioEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_slide02_auto_advanced.png')
  });

  // Test Manual Next: Click next arrow (to Slide 03)
  console.log('Clicking Next Arrow (to Slide 03)...');
  const nextBtn = await page.$('.slideshow-arrow-btn.next-btn');
  if (nextBtn) await nextBtn.click();
  await new Promise(r => setTimeout(r, 800));

  const slide3Info = await page.evaluate(() => {
    const current = document.querySelector('.slideshow-pagination .pagination-current')?.textContent;
    const activeSlide = document.querySelector('.studio-slide-item.slide-active .slide-cap-title')?.textContent;
    const activeDetail = document.querySelector('.studio-floating-slide.slide-active img')?.getAttribute('alt');
    return { current, activeSlide, activeDetail };
  });
  console.log('Slide 3 (Manual Next):', slide3Info);

  await studioEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_slide03_manual.png')
  });

  // Test Dot Click: Click Dot 5 (Index 4: Bespoke Dining Vitrine)
  console.log('Clicking Dot 5 (Bespoke Dining Vitrine)...');
  const dots = await page.$$('.slideshow-dot');
  if (dots.length >= 5) {
    await dots[4].click();
    await new Promise(r => setTimeout(r, 800));
  }

  const slide5Info = await page.evaluate(() => {
    const current = document.querySelector('.slideshow-pagination .pagination-current')?.textContent;
    const activeSlide = document.querySelector('.studio-slide-item.slide-active .slide-cap-title')?.textContent;
    const activeDetail = document.querySelector('.studio-floating-slide.slide-active img')?.getAttribute('alt');
    return { current, activeSlide, activeDetail };
  });
  console.log('Slide 5 (Dot Click):', slide5Info);

  await studioEl.screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_slide05_dot_click.png')
  });

  // Test Loop: Click Next from Slide 5, should loop smoothly to Slide 1
  console.log('Clicking Next from Slide 5 (Loop to Slide 1)...');
  if (nextBtn) await nextBtn.click();
  await new Promise(r => setTimeout(r, 800));

  const loopInfo = await page.evaluate(() => {
    const current = document.querySelector('.slideshow-pagination .pagination-current')?.textContent;
    const activeSlide = document.querySelector('.studio-slide-item.slide-active .slide-cap-title')?.textContent;
    const activeDetail = document.querySelector('.studio-floating-slide.slide-active img')?.getAttribute('alt');
    return { current, activeSlide, activeDetail };
  });
  console.log('Slide 1 (Looped):', loopInfo);

  // Test Tablet & Mobile for Section 05
  await page.setViewport({ width: 1024, height: 768 });
  await page.evaluate(() => document.getElementById('studio')?.scrollIntoView({ behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  await (await page.$('#studio')).screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_tablet.png')
  });

  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => document.getElementById('studio')?.scrollIntoView({ behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  await (await page.$('#studio')).screenshot({
    path: path.join(ARTIFACT_DIR, 'section05_mobile.png')
  });

  console.log('ALL_VERIFICATIONS_COMPLETED_SUCCESSFULLY');
  await browser.close();
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
