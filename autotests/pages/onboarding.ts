import { Locator, Page } from '@playwright/test';

export default class Onboarding {
  readonly buttonNext: Locator;
  readonly buttonContinue: Locator;
  readonly buttonAccept: Locator;
  readonly buttonBackupNow: Locator;
  readonly buttonBackupLater: Locator;
  readonly buttonShowSeed: Locator;
  readonly textSeedWords: Locator;
  readonly header: Locator;
  readonly inputPassword: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly buttonCloseTab: Locator;
  constructor(readonly page: Page) {
    this.buttonNext = page.getByRole('button', { name: 'Next' });
    this.buttonContinue = page.getByRole('button', { name: 'Continue' });
    this.buttonAccept = page.getByRole('button', { name: 'Accept' });
    this.buttonBackupNow = page.getByRole('button', { name: 'Backup now' });
    this.buttonBackupLater = page.getByRole('button', { name: 'Backup later' });
    this.buttonShowSeed = page.getByRole('button', { name: 'Show' });
    this.textSeedWords = page.locator('p[class^="SeedWord"]');
    this.header = page.locator('h3[class^="Heading"]');
    this.inputPassword = page.locator('input[type="password"]');
    this.title = page.locator('h1[class^="Title"]');
    this.subtitle = page.locator('h3[class^="Subtitle"]');
    this.buttonCloseTab = page.getByRole('button', { name: 'Close this tab' });
  }
  // id starts from 0
  inputWord = (id: number) => this.page.locator(`#input${id}`);

  async selectSeedWord(seedWords: string[]): Promise<void> {
    const digitsOnly = ((await this.header.last().textContent()) as string).replace(/\D/g, '');
    let seedWord = seedWords[Number(digitsOnly) - 1];
    await this.page.locator(`button[value="${seedWord}"]`).click();
  }
}
