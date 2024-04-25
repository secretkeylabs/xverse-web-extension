import path from 'path';

import { BrowserContext, Page, test as baseTest, chromium } from '@playwright/test';

export const test = baseTest.extend<{
  context: BrowserContext;
  extensionId: string;
  page: Page;
}>({
  // parts of the setup for the persistent context from https://playwright.dev/docs/chrome-extensions#testing
  context: async ({}, use) => {
    const extPath = process.env.BUILD_EXTENSION_PATH || path.join(__dirname, '../../build');
    const context = await chromium.launchPersistentContext('', {
      args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
      // slowMo: 400, // Slows down Playwright operations by 400 milliseconds for showcasing or testing reasons
    });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await use(context);
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extId = background.url().split('/')[2];
    await use(extId);
  },
  page: async ({ context }, use) => {
    await use(context.pages()[0]);
  },
});

export const { expect } = baseTest;
