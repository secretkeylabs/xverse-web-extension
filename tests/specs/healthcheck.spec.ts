import { expect, test } from '../fixtures/base';

test.describe('healthcheck', () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });
  test.afterEach(async ({ context }) => {
    await context.close();
  });

  test('healthcheck', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    //TODO: put texts for selectors into extra file to have one location to maintain them
    await expect(page.locator('h1')).toHaveText('The Bitcoin wallet for everyone');
    await expect(
      page.getByRole('button', { name: 'Create a new wallet' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Restore an existing wallet' }),
    ).toBeVisible();
    console.log('healthcheck successfull');
  });
});
