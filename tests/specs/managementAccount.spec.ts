import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import StartPage from '../pages/startPage';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Account Management', () => {
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

  test('Check account page', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await startpage.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await expect(startpage.buttonGenerateAccount).toBeVisible();
    await expect(startpage.buttonConnectHardwareWallet).toBeVisible();
    await expect(startpage.buttonBack).toBeVisible();
    await expect(startpage.buttonAccountOptions).toBeVisible();
    await expect(startpage.accountBalance).toBeVisible();
    const balanceText = await startpage.accountBalance.innerText();
    await expect(balanceText).toBe('$0.00');
    await startpage.buttonBack.click();
    await startpage.checkVisuals();
    await expect(startpage.labelAccountName).toHaveText('Account 1');
  });

  test('Rename account', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await startpage.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await startpage.buttonAccountOptions.click();
    await expect(startpage.buttonRenameAccount).toBeVisible();
    await startpage.buttonRenameAccount.click();
    await expect(startpage.buttonConfirm).toBeVisible();
    await expect(startpage.buttonConfirm).toBeDisabled();
    await expect(startpage.labelInfoRenameAccount).toBeVisible();
    await expect(startpage.inputName).toBeVisible();
    await expect(startpage.buttonResetAccountName).toBeVisible();
    await expect(startpage.errorMessageRenameAccount).toBeHidden();
    // Check Errormessage for non alphabetical and numerical characters
    await startpage.inputName.fill(`!!!`);
    await expect(startpage.errorMessageRenameAccount).toBeVisible();
    await expect(startpage.buttonConfirm).toBeDisabled();
    await startpage.inputName.clear();
    await expect(startpage.errorMessageRenameAccount).toBeHidden();
    await expect(startpage.buttonConfirm).toBeDisabled();
    await startpage.inputName.fill(`RenameAccount`);
    await expect(startpage.buttonConfirm).toBeEnabled();
    await startpage.buttonConfirm.click();
    await expect(startpage.buttonGenerateAccount).toBeVisible();
    await expect(startpage.labelAccountName).toHaveText('RenameAccount');
    await expect(startpage.labelAccountName).toHaveCount(1);
  });

  test('Reset account name', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await startpage.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await startpage.buttonAccountOptions.click();
    await expect(startpage.buttonRenameAccount).toBeVisible();
    await startpage.buttonRenameAccount.click();
    await expect(startpage.buttonResetAccountName).toBeVisible();
    await startpage.inputName.fill(`RenameAccount`);
    await expect(startpage.buttonConfirm).toBeEnabled();
    await startpage.buttonConfirm.click();
    await expect(startpage.buttonGenerateAccount).toBeVisible();
    await expect(startpage.labelAccountName).toHaveText('RenameAccount');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await startpage.buttonAccountOptions.click();
    await expect(startpage.buttonRenameAccount).toBeVisible();
    await startpage.buttonRenameAccount.click();
    await expect(startpage.buttonResetAccountName).toBeVisible();
    await startpage.buttonResetAccountName.click();
    await expect(startpage.buttonGenerateAccount).toBeVisible();
    await expect(startpage.labelAccountName).toHaveText('Account 1');
  });

  test('Generate new account', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await startpage.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await startpage.buttonGenerateAccount.click();
    await expect(startpage.labelAccountName).toHaveCount(2);
    await expect(startpage.buttonAccountOptions).toHaveCount(2);
    await expect(startpage.accountBalance).toHaveCount(2);
    const balanceText = await startpage.getBalanceOfAllAccounts();
    await expect(balanceText).toBe(0);
  });

  test('Switch to another account and switch back', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(startpage.labelAccountName).toHaveText('Account 1');
    await startpage.labelAccountName.click();
    await expect(page.url()).toContain('account-list');
    await expect(startpage.labelAccountName).toHaveCount(1);
    await startpage.buttonGenerateAccount.click();
    await expect(startpage.labelAccountName).toHaveCount(2);
    const balanceText = await startpage.getBalanceOfAllAccounts();
    await expect(balanceText).toBe(0);
    await startpage.labelAccountName.last().click();
    await startpage.checkVisuals();
    await expect(startpage.labelAccountName).toHaveText('Account 2');
    await startpage.labelAccountName.click();
    await startpage.labelAccountName.first().click();
    await startpage.checkVisuals();
    await expect(startpage.labelAccountName).toHaveText('Account 1');
  });
});
