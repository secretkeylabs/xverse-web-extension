import path from 'path';

import { test as baseTest, chromium, type BrowserContext, type Page } from '@playwright/test';

const respInfo = {
  challenge_text: '["gaiahub","0","storage2.hiro.so","blockstack_storage_please_sign"]',
  latest_auth_version: 'v1',
  max_file_upload_size_megabytes: 20,
  read_url_prefix: 'https://gaia.hiro.so/hub/',
};

const respWallet = {
  publicURL: 'https://gaia.hiro.so/hub/14sTx6uNUtjaHWXqTaj2KMEdVUzsZ9eyNE/wallet-config.json',
  etag: '0x8DC817CADBAF25C',
};

export const test = baseTest.extend<{
  context: BrowserContext;
  extensionId: string;
  page: Page;
  disableOverridePageRoutes: (page: Page) => Promise<void>;
}>({
  // parts of the setup for the persistent context from https://playwright.dev/docs/chrome-extensions#testing
  context: async ({}, use) => {
    const extPath = process.env.BUILD_EXTENSION_PATH || path.join(__dirname, '../../build');
    const context = await chromium.launchPersistentContext('', {
      args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
      // slowMo: 400, // Slows down Playwright operations by 400 milliseconds for showcasing or testing reasons
    });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Xverse opens the landing page on install. Wait for it to load and
    // use it as the main page by closing the default page.
    // we give it 5 secs to start up
    const MAX_STARTUP_TIME = 5000;
    const startTime = Date.now();
    while (context.pages().length === 1) {
      if (Date.now() - startTime > MAX_STARTUP_TIME) {
        throw new Error('Xverse installation page did not load in time.');
      }

      await new Promise((r) => {
        setTimeout(r, 10);
      });
    }
    await context.pages()[0].close();

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extId = background.url().split('/')[2];
    await use(extId);
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0];

    /* These routes catch calls to the gaia hub and mock them out to avoid rate limiting issues
       and allowing us to run tests in parallel.

       This may not be desirable for all tests (e.g. when testing multiple accounts with a network switch)

       You can disable them per test by running the `disableOverridePageRoutes` fixture below.
       These are enabled by default.
     */
    await page.route('https://hub.hiro.so/hub_info', async (route) => {
      await route.fulfill({ json: respInfo });
    });

    await page.route('https://gaia.hiro.so/hub/*/wallet-config.json', async (route) => {
      await route.fulfill({ json: respWallet });
    });

    await page.route('https://hub.hiro.so/store/*/wallet-config.json', async (route) => {
      await route.fulfill({ json: respWallet });
    });

    await use(page);
  },
  disableOverridePageRoutes: async ({}, use) => {
    await use(async (page: Page) => {
      await page.route('https://hub.hiro.so/hub_info', async (route) => {
        await route.continue();
      });

      await page.route('https://gaia.hiro.so/hub/*/wallet-config.json', async (route) => {
        await route.continue();
      });

      await page.route('https://hub.hiro.so/store/*/wallet-config.json', async (route) => {
        await route.continue();
      });
    });
  },
});

export const { expect } = baseTest;
