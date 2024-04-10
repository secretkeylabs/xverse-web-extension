import { expect, type Locator, type Page } from '@playwright/test';

export default class Onboarding {
  readonly linkTOS: Locator;

  readonly linkPrivacy: Locator;

  readonly buttonAccept: Locator;

  readonly buttonBackupNow: Locator;

  readonly buttonBackupLater: Locator;

  readonly imageBackup: Locator;

  readonly titleBackupOnboarding: Locator;

  readonly subTitleBackupOnboarding: Locator;

  readonly buttonBack: Locator;

  readonly inputPassword: Locator;

  readonly errorMessage: Locator;

  readonly errorMessage2: Locator;

  readonly buttonContinue: Locator;

  readonly labelSecurityLevelWeak: Locator;

  readonly labelSecurityLevelMedium: Locator;

  readonly labelSecurityLevelStrong: Locator;

  readonly firstParagraphBackupStep: Locator;

  readonly buttonShowSeed: Locator;

  readonly secondParagraphBackupStep: Locator;

  readonly textSeedWords: Locator;

  readonly buttonSeedWords: Locator;

  readonly header: Locator;

  readonly instruction: Locator;

  readonly buttonCloseTab: Locator;

  readonly imageSuccess: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.buttonContinue = page.getByRole('button', { name: 'Continue' });
    this.buttonBack = page.getByRole('button', { name: 'Back' });
    this.buttonBackupNow = page.getByRole('button', { name: 'Backup now' });
    this.buttonBackupLater = page.getByRole('button', { name: 'Backup later' });
    this.imageBackup = page.locator('img[alt="backup"]');
    this.titleBackupOnboarding = page.getByRole('heading', { name: 'Backup' });
    this.subTitleBackupOnboarding = page.getByRole('heading', { name: 'Your seedphrase' });
    this.firstParagraphBackupStep = page.locator('p').filter({ hasText: 'Write down your' });
    this.buttonShowSeed = page.getByRole('button', { name: 'Show' });
    this.secondParagraphBackupStep = page.getByRole('heading', { name: 'Confirm you' });
    this.textSeedWords = page.locator('p[translate="no"]');
    this.buttonSeedWords = page.locator('button[value]:not([value=""])');
    // TODO: find more stable selector
    this.header = page.locator('#app h3');
    this.inputPassword = page.locator('input[type="password"]');
    this.errorMessage = page.getByRole('heading', { name: 'Your password should be at' });
    this.errorMessage2 = page.getByRole('heading', { name: 'Please make sure your' });
    this.labelSecurityLevelWeak = page.locator('p').filter({ hasText: 'Weak' });
    this.labelSecurityLevelMedium = page.locator('p').filter({ hasText: 'Medium' });
    this.labelSecurityLevelStrong = page.locator('p').filter({ hasText: 'Strong' });
    this.linkTOS = page.getByRole('link', { name: 'Terms of Service' });
    this.linkPrivacy = page.getByRole('link', { name: 'Privacy Policy' });
    this.buttonAccept = page.getByRole('button', { name: 'Accept' });
    this.imageSuccess = page.locator('img[alt="success"]');
    this.instruction = page.getByRole('heading', { name: 'Locate Xverse' });
    this.buttonCloseTab = page.getByRole('button', { name: 'Close this tab' });
  }

  // TODO add function here for the steps of the onboarding for the case a created wallet should always be created via the UI and is then needed for all following test suits

  // id starts from 0
  inputWord = (id: number) => this.page.locator(`#input${id}`);

  async selectSeedWord(seedWords: string[]): Promise<string> {
    const digitsOnly = ((await this.header.last().textContent()) as string).replace(/\D/g, '');
    const seedWord = seedWords[Number(digitsOnly) - 1];
    return seedWord;
  }

  async checkLegalPage(context) {
    // TODO: Selector outsource
    await expect(this.page.locator('div > h1:first-child')).toHaveText(/Legal/);
    // check that the links contain href values
    // TODO better selectors for link selection
    const linkList = this.page.locator('#app a');
    for (let i = 0; i < (await linkList.count()); i++) {
      expect(await linkList.nth(i).getAttribute('href')).not.toBeNull();
    }
    await expect(this.page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(this.buttonAccept).toBeVisible();

    // check links
    await this.linkTOS.click();
    await context.waitForEvent('page');
    // To check the newest open Tab
    let newPage = await context.pages()[context.pages().length - 1];
    await newPage.waitForURL('https://www.xverse.app/terms');
    await newPage.close();
    await this.linkPrivacy.click();
    await context.waitForEvent('page');
    newPage = await context.pages()[context.pages().length - 1];
    await newPage.waitForURL('https://www.xverse.app/privacy');
    await newPage.close();
  }

  async checkBackupPage() {
    await expect(this.buttonBackupNow).toBeVisible();
    await expect(this.buttonBackupLater).toBeVisible();
    await expect(this.imageBackup).toBeVisible();
    await expect(this.titleBackupOnboarding).toBeVisible();
    await expect(this.subTitleBackupOnboarding).toBeVisible();
  }

  // Check the viuals on the first password page before inputting any values in the input field
  async checkPasswordPage() {
    await expect(this.buttonBack).toBeVisible();
    await expect(this.inputPassword).toBeVisible();
    await expect(this.buttonContinue).toBeVisible();
    await expect(this.buttonContinue).toBeDisabled();
    await expect(this.errorMessage).toBeHidden();
    await expect(this.labelSecurityLevelWeak).toBeHidden();
    await expect(this.labelSecurityLevelMedium).toBeHidden();
    await expect(this.labelSecurityLevelStrong).toBeHidden();
  }

  async testPasswordInput({ password, expectations }) {
    // Fill in the password input field with the specified password.
    await this.inputPassword.fill(password);

    // Check if an error message is expected to be visible.
    if (expectations.errorMessageVisible) {
      // If yes, verify that the error message element is visible.
      await expect(this.errorMessage).toBeVisible();
    } else {
      // If not, verify that the error message element is hidden.
      await expect(this.errorMessage).toBeHidden();
    }

    // Define a mapping of security levels to their corresponding label elements.
    const visibilityChecks = {
      Weak: this.labelSecurityLevelWeak,
      Medium: this.labelSecurityLevelMedium,
      Strong: this.labelSecurityLevelStrong,
    };

    // Concurrently verify the visibility of each security level label.
    await Promise.all(
      Object.entries(visibilityChecks).map(async ([level, element]) => {
        // If the current level matches the expected security level, check that its label is visible.
        if (expectations.securityLevel === level) {
          await expect(element).toBeVisible();
        } else {
          // Otherwise, ensure the label is hidden.
          await expect(element).toBeHidden();
        }
      }),
    );

    // Check if the continue button is expected to be enabled.
    if (expectations.continueButtonEnabled) {
      // If yes, verify that the continue button is enabled.
      await expect(this.buttonContinue).toBeEnabled();
    } else {
      // If not, verify that the continue button is disabled.
      await expect(this.buttonContinue).toBeDisabled();
    }

    // Clear the password input field after all checks are done.
    await this.inputPassword.clear();
  }
}
