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

  readonly buttonNetwork: Locator;

  readonly buttonSave: Locator;

  readonly buttonMainnet: Locator;

  readonly buttonTestnet: Locator;

  readonly buttonBack: Locator;

  readonly inputStacksURL: Locator;

  readonly inputBTCURL: Locator;

  readonly inputFallbackBTCURL: Locator;

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

    this.buttonNetwork = page.getByRole('button', { name: 'Network' });
    this.buttonSave = page.getByRole('button', { name: 'Save' });
    this.buttonMainnet = page.getByRole('button', { name: 'Mainnet' });
    this.buttonTestnet = page.getByRole('button', { name: 'Testnet' });
    this.buttonBack = page.getByRole('button', { name: 'back button' });
    this.inputStacksURL = page.getByTestId('Stacks URL');
    this.inputBTCURL = page.getByTestId('BTC URL');
    this.inputFallbackBTCURL = page.getByTestId('Fallback BTC URL');
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

  async checkNetworkSettingVisuals() {
    await expect(this.buttonSave).toBeVisible();
    await expect(this.buttonBack).toBeVisible();
    await expect(this.buttonMainnet).toBeVisible();
    await expect(this.buttonTestnet).toBeVisible();
    await expect(this.inputStacksURL).toBeVisible();
    await expect(this.inputBTCURL).toBeVisible();
    await expect(this.inputFallbackBTCURL).toBeVisible();
  }

  async checkTestnetUrls(shouldContainTestnet) {
    const inputsURL = [this.inputStacksURL, this.inputBTCURL, this.inputFallbackBTCURL];
    const checks = inputsURL.map(async (input) => {
      const inputValue = await input.inputValue();
      const message = `URL does not contain 'testnet' in ${input}`;
      if (shouldContainTestnet) {
        return expect(inputValue, message).toContain('testnet');
      }
      return expect(inputValue, message).not.toContain('testnet');
    });
    await Promise.all(checks);
  }

  async switchtoTestnetNetwork() {
    await expect(this.buttonNetwork).toBeVisible();
    await expect(this.buttonNetwork).toHaveText('NetworkMainnet');
    await this.buttonNetwork.click();
    await this.checkNetworkSettingVisuals();
    await expect(this.buttonMainnet.locator('img')).toHaveAttribute('alt', 'tick');
    await expect(this.buttonTestnet.locator('img[alt="tick"]')).toHaveCount(0);

    await this.buttonTestnet.click();
    await expect(this.buttonTestnet.locator('img')).toHaveAttribute('alt', 'tick');
    await expect(this.buttonMainnet.locator('img[alt="tick"]')).toHaveCount(0);

    await this.checkTestnetUrls(true);

    await this.buttonSave.click();
    await expect(this.buttonNetwork).toBeVisible();
    await expect(this.buttonNetwork).toHaveText('NetworkTestnet');
  }

  async switchtoMainnetNetwork() {
    await expect(this.buttonNetwork).toBeVisible();
    await expect(this.buttonNetwork).toHaveText('NetworkTestnet');
    await this.buttonNetwork.click();
    await this.checkNetworkSettingVisuals();
    await expect(this.buttonTestnet.locator('img')).toHaveAttribute('alt', 'tick');
    await expect(this.buttonMainnet.locator('img[alt="tick"]')).toHaveCount(0);

    await this.buttonMainnet.click();
    await expect(this.buttonMainnet.locator('img')).toHaveAttribute('alt', 'tick');
    await expect(this.buttonTestnet.locator('img[alt="tick"]')).toHaveCount(0);

    await this.checkTestnetUrls(false);

    await this.buttonSave.click();
    await expect(this.buttonNetwork).toBeVisible();
    await expect(this.buttonNetwork).toHaveText('NetworkMainnet');
  }
}
