import { test } from '../fixtures/base';
import Landing from '../pages/landing';

test.describe('healthCheck', () => {
  test('healthCheck #smoketest', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    const landingPage = new Landing(page);
    await landingPage.initialize();
  });
});
