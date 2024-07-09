import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Explore Tab', () => {
  test('Check explore Tab', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationExplore.click();
    await expect(page.url()).toContain('explore');
    await expect(wallet.carouselApp).toBeVisible();
    // More than 1 app is shown in the carousel and recommended App
    await expect(await wallet.divAppSlide.count()).toBeGreaterThan(1);
    await expect(await wallet.divAppCard.count()).toBeGreaterThan(1);
    await expect(await wallet.divAppTitle.count()).toBeGreaterThan(1);
  });
});
