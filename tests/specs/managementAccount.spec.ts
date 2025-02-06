import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Account Management', () => {
  test('Check account page #smoketest', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.labelAccountName.click();
    expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await expect(wallet.buttonGenerateAccount).toBeVisible();
    await expect(wallet.buttonConnectHardwareWallet).toBeVisible();
    await expect(wallet.buttonBack).toBeVisible();
    await expect(wallet.buttonAccountOptions).toBeVisible();
    await expect(wallet.accountBalance).toBeVisible();
    await expect(wallet.accountBalance).toHaveText('$0.00');
    await wallet.buttonBack.click();
    await wallet.checkVisualsStartpage();
    await expect(wallet.labelAccountName).toHaveText('Account 1');
  });

  test('Reset account name', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await expect(page.getByText('Account 1')).toBeVisible();
    await page.getByText('Account 1').click();
    await expect(page.getByRole('button', { name: /open account options/i })).toBeVisible();
    await page.getByRole('button', { name: /open account options/i }).click();
    await expect(page.getByRole('button', { name: /rename account/i })).toBeVisible();
    await page.getByRole('button', { name: /rename account/i }).click();
    await expect(page.getByRole('textbox', { name: '' })).toBeVisible();
    await page.getByRole('textbox', { name: '' }).fill('Bla Bla Bla 1');
    await page.getByRole('button', { name: /confirm/i }).click();

    await expect(page.getByText('Bla Bla Bla 1')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /open account options/i }).click();
    await page.getByRole('button', { name: /rename account/i }).click();
    await page.getByRole('textbox', { name: '' }).fill('!@$$%%^&**&^(*&');
    await expect(
      page.getByText(/account name can only contain alphabetic and numeric characters and space/i),
    ).toBeVisible();
    await page.getByRole('button', { name: /reset name/i }).click();
    await expect(page.getByText('Account 1')).toBeVisible();
    await expect(page.getByRole('button', { name: /generate account/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add hardware wallet account/i })).toBeVisible();
  });

  test('Generate new account', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: /account name/i }).click();
    await expect(page.getByText('Account 1')).toBeVisible();
    await page.getByRole('button', { name: /generate account/i }).click();
    await expect(page.getByText('Account 2')).toBeVisible({ timeout: 5000 });
  });
});
