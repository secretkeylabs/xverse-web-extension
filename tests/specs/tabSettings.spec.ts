import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Settings Tab', () => {
  test('Check settings page', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonUpdatePassword).toBeVisible();
    await expect(wallet.buttonNetwork).toBeVisible();
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonBackupWallet).toBeVisible();
  });

  test('switch to testnet and back to mainnet', async ({
    page,
    extensionId,
    disableOverridePageRoutes,
  }) => {
    await disableOverridePageRoutes(page);
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);

    // generate extra account
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonGenerateAccount.click();
    await expect(wallet.labelAccountName).toHaveCount(2);

    // should always reset to first account after switching to testnet
    await wallet.labelAccountName.last().click();
    await wallet.checkVisualsStartpage();
    await expect(wallet.labelAccountName).toHaveText('Account 2');
    await page.goto(`chrome-extension://${extensionId}/popup.html#/settings`);
    await wallet.switchToTestnetNetwork();
    await wallet.navigationDashboard.click();
    await expect(wallet.labelAccountName).toHaveText('Account 1');

    // should always reset to first account after switching to mainnet
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await wallet.labelAccountName.last().click();
    await wallet.checkVisualsStartpage('testnet');
    await expect(wallet.labelAccountName).toHaveText('Account 2');
    await page.goto(`chrome-extension://${extensionId}/popup.html#/settings`);
    await wallet.switchToMainnetNetwork();
    await wallet.navigationDashboard.click();
    await expect(wallet.labelAccountName).toHaveText('Account 1');
  });
  test('Update password', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await expect(wallet.buttonUpdatePassword).toBeVisible();
    await wallet.buttonUpdatePassword.click();
    await expect(page.url()).toContain('change-password');
    await expect(onboardingPage.inputPassword).toBeVisible();
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    // error message check for wrong password
    await onboardingPage.inputPassword.fill('ABCwe234');
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();
    await expect(wallet.errorMessage).toBeVisible();
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.inputPassword.clear();
    // Update password
    await onboardingPage.inputPassword.fill(strongPW);
    await onboardingPage.buttonContinue.click();
    await expect(wallet.headerNewPassword).toBeVisible();
    await expect(onboardingPage.inputPassword).toBeVisible();
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await onboardingPage.inputPassword.fill(`${strongPW}ABC`);
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();
    await expect(onboardingPage.inputPassword).toBeVisible();
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await onboardingPage.inputPassword.fill(`${strongPW}ABC`);
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();
    await expect(wallet.infoUpdatePassword).toBeVisible();
  });
  test('Backup wallet', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonBackupWallet).toBeVisible();
    await wallet.buttonBackupWallet.click();
    await expect(onboardingPage.inputPassword).toBeVisible();
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await onboardingPage.inputPassword.fill(strongPW);
    await onboardingPage.buttonContinue.click();
    await expect(onboardingPage.buttonRevealSeed).toBeVisible();
    await expect(wallet.buttonBack).toBeVisible();
    await onboardingPage.buttonRevealSeed.click();
    await expect(onboardingPage.textSeedWords).toHaveCount(12);
  });

  test('Change currency to SGD', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await expect(wallet.textCurrency).toHaveText('USD');
    await wallet.navigationSettings.click();
    await expect(page.url()).toContain('settings');
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonCurrency).toHaveText('Fiat CurrencyUSD');
    await wallet.buttonCurrency.click();
    await expect(await wallet.selectCurrency.count()).toBeGreaterThanOrEqual(5);
    await expect(await wallet.iconFlag.count()).toBeGreaterThanOrEqual(5);
    await wallet.selectCurrency.filter({ hasText: 'SGD' }).click();
    await expect(wallet.buttonCurrency).toBeVisible();
    await expect(wallet.buttonCurrency).toHaveText('Fiat CurrencySGD');
    await wallet.navigationDashboard.click();
    await expect(wallet.textCurrency).toHaveText('SGD');
  });
});
