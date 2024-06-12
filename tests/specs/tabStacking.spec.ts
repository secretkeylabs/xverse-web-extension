import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Stacking Tab', () => {
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
