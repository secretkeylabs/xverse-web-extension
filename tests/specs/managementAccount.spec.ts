import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Account Management', () => {
  test('Check account page #smoketest', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await expect(wallet.buttonGenerateAccount).toBeVisible();
    await expect(wallet.buttonConnectHardwareWallet).toBeVisible();
    await expect(wallet.buttonBack).toBeVisible();
    await expect(wallet.buttonAccountOptions).toBeVisible();
    await expect(wallet.accountBalance).toBeVisible();
    const balanceText = await wallet.accountBalance.innerText();
    await expect(balanceText).toBe('$0.00');
    await wallet.buttonBack.click();
    await wallet.checkVisualsStartpage();
    await expect(wallet.labelAccountName).toHaveText('Account 1');
  });

  test('Rename account', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonAccountOptions.click();
    await expect(wallet.buttonRenameAccount).toBeVisible();
    await wallet.buttonRenameAccount.click();
    await expect(wallet.buttonConfirm).toBeVisible();
    await expect(wallet.buttonConfirm).toBeDisabled();
    await expect(wallet.labelInfoRenameAccount).toBeVisible();
    await expect(wallet.inputName).toBeVisible();
    await expect(wallet.buttonResetAccountName).toBeVisible();
    await expect(wallet.errorMessageRenameAccount).toBeHidden();
    // Check Errormessage for non alphabetical and numerical characters
    await wallet.inputName.fill(`!!!`);
    await expect(wallet.errorMessageRenameAccount).toBeVisible();
    await expect(wallet.buttonConfirm).toBeDisabled();
    await wallet.inputName.clear();
    await expect(wallet.errorMessageRenameAccount).toBeHidden();
    await expect(wallet.buttonConfirm).toBeDisabled();
    await wallet.inputName.fill(`RenameAccount`);
    await expect(wallet.buttonConfirm).toBeEnabled();
    await wallet.buttonConfirm.click();
    await expect(wallet.buttonGenerateAccount).toBeVisible();
    await expect(wallet.labelAccountName).toHaveText('RenameAccount');
    await expect(wallet.labelAccountName).toHaveCount(1);
  });

  test('Reset account name', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonAccountOptions.click();
    await expect(wallet.buttonRenameAccount).toBeVisible();
    await wallet.buttonRenameAccount.click();
    await expect(wallet.buttonResetAccountName).toBeVisible();
    await wallet.inputName.fill(`RenameAccount`);
    await expect(wallet.buttonConfirm).toBeEnabled();
    await wallet.buttonConfirm.click();
    await expect(wallet.buttonGenerateAccount).toBeVisible();
    await expect(wallet.labelAccountName).toHaveText('RenameAccount');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonAccountOptions.click();
    await expect(wallet.buttonRenameAccount).toBeVisible();
    await wallet.buttonRenameAccount.click();
    await expect(wallet.buttonResetAccountName).toBeVisible();
    await wallet.buttonResetAccountName.click();
    await expect(wallet.buttonGenerateAccount).toBeVisible();
    await expect(wallet.labelAccountName).toHaveText('Account 1');
  });

  test('Generate new account', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonGenerateAccount.click();
    await expect(wallet.labelAccountName).toHaveCount(2);
    await expect(wallet.buttonAccountOptions).toHaveCount(2);
    await expect(wallet.accountBalance).toHaveCount(2);
    const balanceText = await wallet.getBalanceOfAllAccounts();
    await expect(balanceText).toBe(0);
  });

  test('Switch to another account and switch back', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(wallet.labelAccountName).toHaveText('Account 1');
    await wallet.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(wallet.labelAccountName).toHaveCount(1);
    await wallet.buttonGenerateAccount.click();
    await expect(wallet.labelAccountName).toHaveCount(2);
    const balanceText = await wallet.getBalanceOfAllAccounts();
    await expect(balanceText).toBe(0);
    await wallet.labelAccountName.last().click();
    await wallet.checkVisualsStartpage();
    await expect(wallet.labelAccountName).toHaveText('Account 2');
    await wallet.labelAccountName.click();
    await wallet.labelAccountName.first().click();
    await wallet.checkVisualsStartpage();
    await expect(wallet.labelAccountName).toHaveText('Account 1');
  });
});
