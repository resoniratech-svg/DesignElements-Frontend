const { chromium } = require('playwright');

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log("Navigating to dashboard...");
  try {
    // We navigate to login first to see if it redirects,
    // but the screenshot shows the URL is already /client/dashboard so maybe we just need the console error.
    // However, if we aren't logged in, it will redirect. Let's just mock localStorage and go directly.
    await page.goto('http://localhost:5173/client/dashboard');
    
    // We need to inject user into localStorage to bypass AuthContext redirect
    await page.evaluate(() => {
      localStorage.setItem('trek_user', JSON.stringify({ id: 30, name: 'venu', email: 'venu@gmail.com', role: 'CLIENT', token: 'fake-token' }));
      localStorage.setItem('trek_token', 'fake-token');
    });

    console.log("Mocked token, reloading...");
    await page.goto('http://localhost:5173/client/dashboard', { waitUntil: 'networkidle' });

    // Wait a couple of seconds to capture async errors
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error("Navigation error:", err);
  } finally {
    await browser.close();
  }
})();
