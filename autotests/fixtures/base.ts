import { BrowserContext, Page, test as baseTest, chromium } from '@playwright/test';
import path from 'path';
import Landing from '../pages/landing';

export const test = baseTest.extend<{
  context: BrowserContext;
  extensionId: string;
  page: Page;
  landing: Landing;
}>({
  context: async ({}, use) => {
    const extPath = path.join(__dirname, '../../build');
    const context = await chromium.launchPersistentContext('', {
      args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
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
  landing: async ({ page }, use) => {
    await use(new Landing(page));
  },
});

export default test;
export const expect = baseTest.expect;
