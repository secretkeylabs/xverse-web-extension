import { Locator, Page } from '@playwright/test';

export default class Landing {
  readonly buttonCreateWallet: Locator;

  readonly buttonRestoreWallet: Locator;

  constructor(readonly page: Page) {
    this.buttonCreateWallet = page.getByRole('button', { name: 'Create Wallet' });
    this.buttonRestoreWallet = page.getByRole('button', { name: 'Restore Wallet' });
  }
}
