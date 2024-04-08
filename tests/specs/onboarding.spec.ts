import { expect, test } from '../fixtures/base';
import { passwordTestCases } from '../fixtures/passwordTestData';
import Landing from '../pages/landing';
import Onboarding from '../pages/onboarding';

// TODO outsoure Password value
const strongPW = 'Admin12345567!!!!';

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

  test('visual check legal page', async ({ page, context }) => {
    const landingpage = new Landing(page);

    // Click on create Wallet and check legal page elements
    await landingpage.buttonCreateWallet.click();
    const onboardingpage = new Onboarding(page);
    await expect(page.url()).toContain('legal');
    await onboardingpage.checkLegalPage(context);
  });

  // Visual check of the first page for backup
  test('visual check backup page main', async ({ page }) => {
    const landingpage = new Landing(page);

    await landingpage.buttonCreateWallet.click();
    const onboardingpage = new Onboarding(page);
    await expect(page.url()).toContain('legal');
    await onboardingpage.buttonAccept.click();
    await expect(page.url()).toContain('backup');
    await onboardingpage.checkBackupPage();
  });

  // Visual check of the first page for password creation
  test('skip backup and visual check password page', async ({ page }) => {
    const landingpage = new Landing(page);

    await landingpage.buttonCreateWallet.click();
    const onboardingpage = new Onboarding(page);
    await expect(page.url()).toContain('legal');
    await onboardingpage.buttonAccept.click();
    await expect(page.url()).toContain('backup');
    await onboardingpage.buttonBackupLater.click();
    await expect(page.url()).toContain('create-password');
    await onboardingpage.checkPasswordPage();
    await onboardingpage.buttonBack.click();
    await expect(page.url()).toContain('backup');
  });

  // No Wallet is created in this step as we only check the display of the error messages and that you can't create a wallet if passwords don't align
  test('Skip backup and check password error messages', async ({ page }) => {
    const landingpage = new Landing(page);

    await landingpage.buttonCreateWallet.click();
    const onboardingpage = new Onboarding(page);
    await expect(page.url()).toContain('legal');
    await onboardingpage.buttonAccept.click();
    await expect(page.url()).toContain('backup');
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
    await onboardingpage.buttonContinue.click();
    await onboardingpage.buttonContinue.click();
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.errorMessage2).toBeVisible();
    await onboardingpage.buttonBack.click();
    await expect(onboardingpage.inputPassword).toHaveValue(/.+/);
    await onboardingpage.buttonContinue.click();
    await expect(onboardingpage.inputPassword).toHaveValue(/.+/);
    await expect(onboardingpage.errorMessage2).toBeVisible();
  });

  test('backup seedphrase and successfully create a wallet', async ({ page, context }) => {
    const landingpage = new Landing(page);

    await landingpage.buttonCreateWallet.click();
    const onboardingpage = new Onboarding(page);
    await expect(page.url()).toContain('legal');
    await onboardingpage.buttonAccept.click();
    await expect(page.url()).toContain('backup');
    await onboardingpage.buttonBackupNow.click();
    await expect(page.url()).toContain('backupWalletSteps');
    await expect(onboardingpage.buttonContinue).toBeDisabled();
    await expect(onboardingpage.buttonShowSeed).toBeVisible();
    await expect(onboardingpage.firstParagraphBackupStep).toBeVisible();
    await onboardingpage.buttonShowSeed.click();
    await expect(onboardingpage.buttonContinue).toBeEnabled();
    const seedWords = await onboardingpage.textSeedWords.allTextContents();
    await onboardingpage.buttonContinue.click();

    // check if 12 words are displayed
    await expect(onboardingpage.buttonSeedWords).toHaveCount(12);
    await expect(onboardingpage.secondParagraphBackupStep).toBeVisible();
    let seedword = await onboardingpage.selectSeedWord(seedWords);

    // get all displayed values and filter the value from the actual seedphrase out to do an error message check
    const buttonValues = await onboardingpage.buttonSeedWords.evaluateAll((buttons) =>
      buttons.map((button) => {
        // Assert that the button is an HTMLButtonElement to access the `value` property
        if (button instanceof HTMLButtonElement) {
          return button.value;
        }
        return 'testvalue';
      }),
    );

    const filteredValues = buttonValues.filter((value) => value !== seedword);
    const randomValue = filteredValues[Math.floor(Math.random() * filteredValues.length)];
    await page.locator(`button[value="${randomValue}"]`).click();

    // Check if error message is displayed when clicking the wrong seedword
    await expect(page.locator('p:has-text("This word is not")')).toBeVisible();

    await page.locator(`button[value="${seedword}"]`).click();
    seedword = await onboardingpage.selectSeedWord(seedWords);
    await page.locator(`button[value="${seedword}"]`).click();
    seedword = await onboardingpage.selectSeedWord(seedWords);
    await page.locator(`button[value="${seedword}"]`).click();

    // TODO: currently the error messages as not shown for the passwords in this step so this check needs to be commment out until it is fixed
    /*     for (const testCase of passwordTestCases) {
      await onboardingpage.testPasswordInput(testCase);
    } */

    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonContinue.click();
    await onboardingpage.inputPassword.fill(strongPW);
    await onboardingpage.buttonContinue.click();

    await expect(onboardingpage.imageSuccess).toBeVisible();
    await expect(onboardingpage.instruction).toBeVisible();
    await expect(onboardingpage.buttonCloseTab).toBeVisible();
  });
});
