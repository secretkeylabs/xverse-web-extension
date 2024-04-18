import * as bip39 from 'bip39';
import { expect, test } from '../fixtures/base';
import { passwordTestCases } from '../fixtures/passwordTestData';
import Onboarding from '../pages/onboarding';
import StartPage from '../pages/startPage';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('onboarding flow', () => {
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

  test('visual check legal page', async ({ page, context, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    // Skip Landing and go directly to legal via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/legal`);
    await onboardingpage.checkLegalPage(context);
  });

  // Visual check of the first page for backup
  test('visual check backup page main #smoketest', async ({ page }) => {
    const onboardingpage = new Onboarding(page);
    await onboardingpage.navigateToBackupPage();
    await onboardingpage.checkBackupPage();
  });

  // Visual check of the first page for password creation
  test('skip backup and visual check password page', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    // Skip landing and go directly to create password via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/create-password`);
    await expect(page.url()).toContain('create-password');
    await onboardingpage.checkPasswordPage();
    await onboardingpage.buttonBack.click();
    await expect(page.url()).toContain('backup');
  });

  // No Wallet is created in this step as we only check the display of the error messages and that you can't create a wallet if passwords don't align
  test('Skip backup and check password error messages #smoketest', async ({ page }) => {
    const onboardingpage = new Onboarding(page);
    await onboardingpage.navigateToBackupPage();
    await onboardingpage.buttonBackupLater.click();
    await expect(page.url()).toContain('create-password');

    // Check error message, security label change, and status of continue button
    await passwordTestCases.reduce(async (previousPromise, testCase) => {
      await previousPromise;
      return onboardingpage.testPasswordInput(testCase);
    }, Promise.resolve());

    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonContinue.click();
    // check Confirm header
    await expect(page.locator('h1')).toHaveText(/confirm/i);
    // Enter wrong password to check error messages
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await onboardingpage.inputPassword.fill(`${strongPW}123`);
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.errorMessage2).toBeVisible();
    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingpage.buttonContinue);
    await expect(onboardingpage.errorMessage2).toBeVisible();
    await onboardingpage.buttonBack.click();
    await expect(onboardingpage.inputPassword).toHaveValue(/.+/);
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.inputPassword).toHaveValue(/.+/);
    await expect(onboardingpage.errorMessage2).toBeVisible();
  });

  test('Restore wallet error message check for false 12 word seed phrase #smoketest', async ({
    page,
  }) => {
    const onboardingpage = new Onboarding(page);
    await onboardingpage.navigateToRestorePage();

    await onboardingpage.checkRestoreWalletSeedPhrasePage();

    // get 12 words from bip39
    const mnemonic = bip39.generateMnemonic();
    const wordsArray = mnemonic.split(' '); // Split the mnemonic by spaces

    // We only input 11 word to cause the error message
    for (let i = 0; i < wordsArray.length - 1; i++) {
      await onboardingpage.inputWord(i).fill(wordsArray[i]);
    }

    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await expect(onboardingpage.errorMessageSeedPhrase).toBeVisible();

    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingpage.buttonContinue);
    await expect(page.url()).toContain('restoreWallet');
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingpage.errorMessageSeedPhrase).toBeVisible();

    // empty all fields and check if continue button is disabled
    for (let i = 0; i < 12; i++) {
      await onboardingpage.inputWord(i).clear();
    }

    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingpage.errorMessageSeedPhrase).toBeHidden();
  });

  test('Restore wallet Error Message check for false 24 word seed phrase', async ({ page }) => {
    const onboardingpage = new Onboarding(page);
    await onboardingpage.navigateToRestorePage();

    await onboardingpage.checkRestoreWalletSeedPhrasePage();
    await onboardingpage.button24SeedPhrase.click();

    // All input fields should now be visible and enabled
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingpage.inputSeedPhraseWord).toHaveCount(24);

    // get 24 words from bip39
    const mnemonic = bip39.generateMnemonic(256);
    const wordsArray = mnemonic.split(' '); // Split the mnemonic by spaces

    for (let i = 0; i < wordsArray.length - 1; i++) {
      await onboardingpage.inputWord(i).fill(wordsArray[i]);
    }
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await onboardingpage.buttonContinue.click();

    // As the seed phrase is not complete an error should be shown and the continue button is still enabled
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingpage.errorMessageSeedPhrase).toBeVisible();

    // multiple times clicking on continue to check that the user stays on the page and can't continue even of clicked multiple times
    await Onboarding.multipleClickCheck(onboardingpage.buttonContinue);
    await expect(page.url()).toContain('restoreWallet');

    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingpage.errorMessageSeedPhrase).toBeVisible();

    // empty all fields and check if continue button is disabled
    for (let i = 0; i < 24; i++) {
      await onboardingpage.inputWord(i).clear();
    }
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await expect(onboardingpage.errorMessageSeedPhrase).toBeHidden();
  });

  test('Restore wallet check switch 12 to 24 seed phrase', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);

    // Skip Landing and go directly to restore wallet via URL
    await page.goto(`chrome-extension://${extensionId}/options.html#/restoreWallet`);

    await onboardingpage.checkRestoreWalletSeedPhrasePage();

    await onboardingpage.button24SeedPhrase.click();
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(0);
    await expect(onboardingpage.inputSeedPhraseWord).toHaveCount(24);
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await expect(onboardingpage.button12SeedPhrase).toBeVisible();

    await onboardingpage.button12SeedPhrase.click();
    await expect(onboardingpage.inputSeedPhraseWordDisabled).toHaveCount(12);
    await expect(onboardingpage.inputSeedPhraseWord).toHaveCount(24);
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await expect(onboardingpage.button24SeedPhrase).toBeVisible();
  });

  test('Lock and login #smoketest', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const startpage = new StartPage(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(startpage.buttonMenu).toBeVisible();
    await startpage.buttonMenu.click();
    await expect(startpage.buttonLock).toBeVisible();
    await startpage.buttonLock.click();
    await expect(onboardingpage.inputPassword).toBeVisible();
    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonUnlock.click();
    await startpage.checkVisuals();
  });
});
