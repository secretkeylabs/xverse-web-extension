import * as bip39 from 'bip39';
import { expect, test } from '../fixtures/base';
import { passwordTestCases } from '../fixtures/passwordTestData';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('onboarding flow', () => {
  test('visual check legal page', async ({ page, context, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    // Skip Landing and go directly to legal via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/legal`);
    await onboardingPage.checkLegalPage(context);
  });

  // Visual check of the first page for backup
  test('visual check backup page main #smoketest', async ({ page }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.navigateToBackupPage();
    await onboardingPage.checkBackupPage();
  });

  // Visual check of the first page for password creation
  test('skip backup and visual check password page', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    // Skip landing and go directly to create password via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/create-password`);
    await expect(page.url()).toContain('create-password');
    await onboardingPage.checkPasswordPage();
    await onboardingPage.buttonBack.click();
    await expect(page.url()).toContain('backup');
  });

  // No Wallet is created in this step as we only check the display of the error messages and that you can't create a wallet if passwords don't align
  test('Skip backup and check password error messages #smoketest', async ({ page }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.navigateToBackupPage();
    await onboardingPage.buttonBackupLater.click();
    await expect(page.url()).toContain('create-password');

    // Check error message, security label change, and status of continue button
    await passwordTestCases.reduce(async (previousPromise, testCase) => {
      await previousPromise;
      return onboardingPage.testPasswordInput(testCase);
    }, Promise.resolve());

    await onboardingPage.inputPassword.fill(strongPW);
    await onboardingPage.buttonContinue.click();
    // check Confirm header
    await expect(page.locator('h1')).toHaveText(/confirm/i);
    // Enter wrong password to check error messages
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await onboardingPage.inputPassword.fill(`${strongPW}123`);
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();
    await expect(onboardingPage.errorMessage2).toBeVisible();
    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingPage.buttonContinue);
    await expect(onboardingPage.errorMessage2).toBeVisible();
    await onboardingPage.buttonBack.click();
    await expect(onboardingPage.inputPassword).toHaveValue(/.+/);
    await onboardingPage.buttonContinue.click();
    await expect(onboardingPage.inputPassword).toHaveValue(/.+/);
    await expect(onboardingPage.errorMessage2).toBeVisible();
  });

  test('Restore wallet error message check for false 12 word seed phrase #smoketest', async ({
    page,
  }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.navigateToRestorePage();

    await onboardingPage.checkRestoreWalletSeedPhrasePage();

    // get 12 words from bip39
    const mnemonic = bip39.generateMnemonic();
    const wordsArray = mnemonic.split(' '); // Split the mnemonic by spaces

    // We only input 11 word to cause the error message
    for (let i = 0; i < wordsArray.length - 1; i++) {
      await onboardingPage.inputWord(i).fill(wordsArray[i]);
    }

    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await expect(onboardingPage.errorMessageSeedPhrase).toBeVisible();

    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingPage.buttonContinue);
    await expect(page.url()).toContain('restoreWallet');
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingPage.errorMessageSeedPhrase).toBeVisible();

    // empty all fields and check if continue button is disabled
    for (let i = 0; i < 12; i++) {
      await onboardingPage.inputWord(i).clear();
    }

    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingPage.errorMessageSeedPhrase).toBeHidden();
  });

  test('Restore wallet Error Message check for false 24 word seed phrase', async ({ page }) => {
    const onboardingPage = new Onboarding(page);
    await onboardingPage.navigateToRestorePage();

    await onboardingPage.checkRestoreWalletSeedPhrasePage();
    await onboardingPage.button24SeedPhrase.click();

    // All input fields should now be visible and enabled
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingPage.inputSeedPhraseWord).toHaveCount(24);

    // get 24 words from bip39
    const mnemonic = bip39.generateMnemonic(256);
    const wordsArray = mnemonic.split(' '); // Split the mnemonic by spaces

    for (let i = 0; i < wordsArray.length - 1; i++) {
      await onboardingPage.inputWord(i).fill(wordsArray[i]);
    }
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await onboardingPage.buttonContinue.click();

    // As the seed phrase is not complete an error should be shown and the continue button is still enabled
    await expect(onboardingPage.buttonContinue).toBeEnabled();
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingPage.errorMessageSeedPhrase).toBeVisible();

    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingPage.buttonContinue);
    await expect(page.url()).toContain('restoreWallet');

    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingPage.errorMessageSeedPhrase).toBeVisible();

    // empty all fields and check if continue button is disabled
    for (let i = 0; i < 24; i++) {
      await onboardingPage.inputWord(i).clear();
    }
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await expect(onboardingPage.errorMessageSeedPhrase).toBeHidden();
  });

  test('Restore wallet check switch 12 to 24 seed phrase', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);

    // Skip Landing and go directly to restore wallet via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/restoreWallet`);

    await onboardingPage.checkRestoreWalletSeedPhrasePage();

    await onboardingPage.button24SeedPhrase.click();
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingPage.inputSeedPhraseWord).toHaveCount(24);
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await expect(onboardingPage.button12SeedPhrase).toBeVisible();

    await onboardingPage.button12SeedPhrase.click();
    await expect(onboardingPage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingPage.inputSeedPhraseWord).toHaveCount(24);
    await expect(onboardingPage.buttonContinue).toBeDisabled();
    await expect(onboardingPage.button24SeedPhrase).toBeVisible();
  });

  test('Lock and login #smoketest', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await expect(wallet.buttonMenu).toBeVisible();
    await wallet.buttonMenu.click();
    await expect(wallet.buttonLock).toBeVisible();
    await wallet.buttonLock.click();
    await expect(onboardingPage.inputPassword).toBeVisible();
    await onboardingPage.inputPassword.fill(strongPW);
    await onboardingPage.buttonUnlock.click();
    await wallet.checkVisualsStartpage();
  });
});
