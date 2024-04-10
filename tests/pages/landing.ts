import { Locator, Page, expect } from '@playwright/test';
// Pageobject for landing page under options.html#/landing
export default class Landing {
  readonly buttonCreateWallet: Locator;

  readonly buttonRestoreWallet: Locator;

  readonly landingTitle: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.buttonCreateWallet = page.getByRole('button', { name: 'Create a new wallet' });
    this.buttonRestoreWallet = page.getByRole('button', { name: 'Restore an existing wallet' });
    this.landingTitle = page.getByText('The Bitcoin wallet for everyone');
  }

  // Initialization Method for intial visual check of page object
  async initialize() {
    await expect(this.buttonCreateWallet).toBeVisible();
    await expect(this.buttonRestoreWallet).toBeVisible();
    await expect(this.landingTitle).toBeVisible();
  }
}
