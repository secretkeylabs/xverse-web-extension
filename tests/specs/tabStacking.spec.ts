import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Stacking Tab', () => {
  test.beforeEach(async ({ page, extensionId, context }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    // TODO: this fixes a temporary issue with two tabs at the start see technical debt https://linear.app/xverseapp/issue/ENG-3992/two-tabs-open-instead-of-one-since-version-0323-for-start-extension
    const pages = await context.pages();
    if (pages.length === 2) {
      await pages[1].close(); // pages[1] is the second (newest) page
    }
  });
  test.afterEach(async ({ context }) => {
    if (context.pages().length > 0) {
      // Close the context only if there are open pages
      await context.close();
    }
  });

  test('Check stacking Tab', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.navigationStacking.click();
    await expect(page.url()).toContain('stacking');
    await expect(wallet.buttonStartStacking).toBeVisible();
    await expect(wallet.headingStacking).toBeVisible();
    await expect(wallet.containerStackingInfo).toHaveCount(4);
    await expect(wallet.infoTextStacking).toBeVisible();
    await expect(wallet.labelAccountName).toBeVisible();
    await expect(wallet.buttonMenu).toBeVisible();
  });
});
