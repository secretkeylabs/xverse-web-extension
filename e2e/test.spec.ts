import { test, expect } from '@playwright/test';
// import { chromium } from 'playwright';
// import { strictEqual } from 'assert';

// (async () => {
//   const browser = await chromium.launch();
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // Navigate to the web store page for the extension
//   await page.goto('https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg');

//   // Click the "Add to Chrome" button
//   await page.click('#install-button');

//   // Wait for the extension to finish downloading
//   await page.waitForSelector('#install-button[aria-hidden="true"]');

//   // Check that the extension is now installed
//   const installed = await page.evaluate(() => {
//     return document.querySelector('#install-button[aria-hidden="true"]') !== null;
//   });
//   strictEqual(installed, true);

//   await browser.close();
// })();
// // This test will launch a chromium browser, navigate to the web store page for the extension "Xverse Wallet", click the "Add to Chrome" button, wait for the extension to finish downloading, and then check that the extension is now installed.

// // Make sure you have installed playwright and typescript npm i playwright typescript and you have set up a typescript project and configure it to run with playwright.

// // Also, when running the test, you need to have a chromium browser installed on your machine, otherwise, you could specify the path of the browser executable in the launch function, like this chromium.launch({executablePath: 'path-to-executable'})
test.describe( "base URL", () => {
    test.beforeEach(async({page}) => {
        await page.goto('https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg');
    });
    test( 'get starter link', async ( {page}) => {

        await expect(page).toHaveURL(/.*xverse-wallet/);
    });

}
   
);



