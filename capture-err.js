import puppeteer from 'puppeteer';

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR LOG:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE EXCEPTION:', error.message);
    });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log("Loaded landing page");
    
    await page.evaluate(() => localStorage.clear()); // Clear auth just in case
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    console.log("Loaded login page");
    
    await page.evaluate(() => {
       const btn = Array.from(document.querySelectorAll('button')).find(e => e.textContent.includes('Admin'));
       if (btn) btn.click();
    });
    console.log("Clicked Admin Demo Login");
    
    await new Promise(r => setTimeout(r, 1500));
    
    await page.evaluate(() => {
       const loginSubmitBtn = document.getElementById('login-submit');
       if (loginSubmitBtn) loginSubmitBtn.click();
    });
    console.log("Submitted Login");
    
    await new Promise(r => setTimeout(r, 1500));
    
    console.log("Navigating to /projects");
    await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
    console.log("Done");
})();
