import { expect, type Locator, type Page } from '@playwright/test';

export default class StartPage {
  readonly balance: Locator;

  readonly allupperButtons: Locator;

  readonly manageTokenButton: Locator;

  readonly buttonMenu: Locator;

  readonly buttonLock: Locator;

  readonly buttonResetWallet: Locator;

  readonly buttonDenyDataCollection: Locator;

  readonly buttonCopyBitcoinAddress: Locator;

  readonly buttonCopyOrdinalsAddress: Locator;

  readonly buttonCopyStacksAddress: Locator;

  readonly buttonConfirmCopyAddress: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.balance = page.getByTestId('total-balance-value');
    this.allupperButtons = page.getByTestId('transaction-buttons-row').getByRole('button');
    this.manageTokenButton = page.getByRole('button', { name: 'Manage token list' });
    this.buttonMenu = page.getByRole('button', { name: 'Open Header Options' });
    this.buttonLock = page.getByRole('button', { name: 'Lock' });
    this.buttonResetWallet = page.getByRole('button', { name: 'Reset Wallet' });
    this.buttonDenyDataCollection = page.getByRole('button', { name: 'Deny' });
    this.buttonCopyBitcoinAddress = page.locator('#copy-address-Bitcoin');
    this.buttonCopyOrdinalsAddress = page.locator(
      '#copy-address-Ordinals\\,\\ BRC-20\\ \\&\\ Runes',
    );
    this.buttonCopyStacksAddress = page.locator(
      '#copy-address-Stacks\\ NFTs\\ \\&\\ SIP-10\\ tokens',
    );

    this.buttonConfirmCopyAddress = page.getByRole('button', { name: 'I understand' });
  }

  async checkVisuals() {
    // Deny data collection --> modal window is not always appearing so when it does we deny the data collection
    if (await this.buttonDenyDataCollection.isVisible()) {
      await this.buttonDenyDataCollection.click();
    }

    // Check if specific visual elements are loaded
    await expect(this.balance).toBeVisible();
    await expect(this.manageTokenButton).toBeVisible();
    await expect(this.buttonMenu).toBeVisible();
    // Check if all 4 buttons (send, receive, swap, buy) are visible
    await expect(this.allupperButtons).toHaveCount(4);
  }

  async getAddress(button) {
    await expect(button).toBeVisible();
    await button.click();
    await expect(this.buttonConfirmCopyAddress).toBeVisible();
    await this.buttonConfirmCopyAddress.click();
    const address = await this.page.evaluate('navigator.clipboard.readText()');
    return address;
  }
}
