import { test } from '../fixtures/base';
import Landing from '../pages/landing';

test.describe('healthcheck', () => {
  test.afterEach(async ({ context }) => {
    await context.close();
  });

  test('healthcheck #smoketest', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    const landingpage = new Landing(page);
    await landingpage.initialize();
  });
});
