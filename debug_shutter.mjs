import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE:', msg.text()));
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('zeyarch_modal_session_shown', 'true');
    localStorage.setItem('zeyarch_modal_dismissed_until', (Date.now() + 86400000).toString());
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.querySelector('.zeyarch-preloader-root'));

  await page.click('.hamburger-btn');
  await new Promise(r => setTimeout(r, 650));

  const links = await page.$$('.split-nav-link');
  console.log('Clicking OUR PROCESS...');
  await links[1].click();

  await new Promise(r => setTimeout(r, 280));
  const snap = await page.evaluate(() => {
    const c = document.querySelector('.nav-shutter-overlay');
    const s = document.querySelectorAll('.nav-shutter-strip');
    return {
      cVis: c ? c.style.visibility : null,
      cComputedVis: c ? window.getComputedStyle(c).visibility : null,
      cDisplay: c ? window.getComputedStyle(c).display : null,
      cZ: c ? window.getComputedStyle(c).zIndex : null,
      stripsCount: s.length,
      strip0Inline: s[0] ? s[0].style.transform : null,
      strip0Computed: s[0] ? window.getComputedStyle(s[0]).transform : null,
      strip0Rect: s[0] ? s[0].getBoundingClientRect() : null,
      overlayBounds: c ? c.getBoundingClientRect() : null
    };
  });
  console.log('Snap at 280ms:', JSON.stringify(snap, null, 2));
  await page.screenshot({ path: 'C:/Users/ashka/.gemini/antigravity/brain/6132dca4-8a0f-4f9f-a2c4-6eb188939496/debug_shutter.png' });
  await browser.close();
}

run().catch(console.error);
