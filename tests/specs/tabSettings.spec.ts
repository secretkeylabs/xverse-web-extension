import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Settings Tab', () => {
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

  test('Check settings page', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonUpdatePassword).toBeVisible();
    await expect(wallet.buttonNetwork).toBeVisible();
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonBackupWallet).toBeVisible();
  });

  test('switch to testnet and back to mainnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html#/settings`);

    await wallet.switchtoTestnetNetwork();
    await wallet.switchtoMainnetNetwork();
  });
  test('Update password', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.navigationSettings.click();
    await expect(wallet.buttonUpdatePassword).toBeVisible();
    await wallet.buttonUpdatePassword.click();
    await expect(page.url()).toContain('change-password');
    await expect(onboardingpage.inputPassword).toBeVisible();
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    // errormessage check for wrong password
    await onboardingpage.inputPassword.fill('ABCwe234');
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();
    await expect(wallet.errorMessage).toBeVisible();
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.inputPassword.clear();
    // Update password
    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonContinue.click();
    await expect(wallet.headerNewPassword).toBeVisible();
    await expect(onboardingpage.inputPassword).toBeVisible();
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await onboardingpage.inputPassword.fill(`${strongPW}ABC`);
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.inputPassword).toBeVisible();
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await onboardingpage.inputPassword.fill(`${strongPW}ABC`);
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();
    await expect(wallet.infoUpdatePassword).toBeVisible();
  });
  test('Backup wallet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonBackupWallet).toBeVisible();
    await wallet.buttonBackupWallet.click();
    await expect(onboardingpage.inputPassword).toBeVisible();
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.buttonRevealSeed).toBeVisible();
    await expect(wallet.buttonBack).toBeVisible();
    await onboardingpage.buttonRevealSeed.click();
    await expect(onboardingpage.textSeedWords).toHaveCount(12);
  });

  test('Change currency to SGD', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(wallet.textCurrency).toHaveText('USD');
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonCurrency).toHaveText('Fiat CurrencyUSD');
    await wallet.buttonCurrency.click();
    await expect(await wallet.selectCurrency.count()).toBeGreaterThanOrEqual(5);
    await expect(await wallet.iconFlag.count()).toBeGreaterThanOrEqual(5);
    await wallet.selectCurrency.filter({ hasText: 'SGD' }).click();
    await wallet.buttonBack.click();
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonCurrency).toHaveText('Fiat CurrencySGD');
    await wallet.navigationDashboard.click();
    await expect(wallet.textCurrency).toHaveText('SGD');
  });
});
