import { expect, type Locator, type Page } from '@playwright/test';

export default class Wallet {
  readonly balance: Locator;

  readonly allupperButtons: Locator;

  readonly labelAccountName: Locator;

  readonly buttonGenerateAccount: Locator;

  readonly buttonConnectHardwareWallet: Locator;

  readonly inputName: Locator;

  readonly buttonAccountOptions: Locator;

  readonly accountBalance: Locator;

  readonly buttonRenameAccount: Locator;

  readonly buttonResetAccountName: Locator;

  readonly labelInfoRenameAccount: Locator;

  readonly errorMessageRenameAccount: Locator;

  readonly manageTokenButton: Locator;

  readonly buttonMenu: Locator;

  readonly buttonLock: Locator;

  readonly buttonConfirm: Locator;

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

  readonly labelCoinTitle: Locator;

  readonly checkboxToken: Locator;

  readonly checkboxTokenActive: Locator;

  readonly checkboxTokenInactive: Locator;

  readonly buttonSip10: Locator;

  readonly buttonBRC20: Locator;

  readonly buttonRunes: Locator;

  readonly headingTokens: Locator;

  readonly divTokenRow: Locator;

  readonly labelTokenSubtitle: Locator;

  readonly labelCoinBalance: Locator;

  readonly navigationDashboard: Locator;

  readonly navigationNFT: Locator;

  readonly navigationStacking: Locator;

  readonly navigationExplore: Locator;

  readonly navigationSettings: Locator;

  readonly divAppSlide: Locator;

  readonly divAppCard: Locator;

  readonly divAppTitle: Locator;

  readonly carouselApp: Locator;

  readonly buttonStartStacking: Locator;

  readonly headingStacking: Locator;

  readonly containerStackingInfo: Locator;

  readonly infoTextStacking: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.navigationDashboard = page.getByTestId('nav-dashboard');
    this.navigationNFT = page.getByTestId('nav-nft');
    this.navigationStacking = page.getByTestId('nav-stacking');
    this.navigationExplore = page.getByTestId('nav-explore');
    this.navigationSettings = page.getByTestId('nav-settings');
    this.balance = page.getByTestId('total-balance-value');
    this.allupperButtons = page.getByTestId('transaction-buttons-row').getByRole('button');
    this.labelAccountName = page.getByLabel('Account Name');
    this.buttonAccountOptions = page.getByLabel('Open Account Options');
    this.accountBalance = page.getByTestId('account-balance');
    this.buttonRenameAccount = page.getByRole('button', { name: 'Rename account' });
    this.buttonResetAccountName = page.getByRole('button', { name: 'Reset name' });
    this.labelInfoRenameAccount = page
      .locator('form div')
      .filter({ hasText: 'name can only include alphabetical and numerical' });
    this.buttonGenerateAccount = page.getByRole('button', { name: 'Generate account' });
    this.buttonConnectHardwareWallet = page.getByRole('button', {
      name: 'Connect hardware wallet',
    });
    this.inputName = page.locator('input[type="text"]');
    this.errorMessageRenameAccount = page
      .locator('p')
      .filter({ hasText: 'contain alphabetic and numeric' });
    this.manageTokenButton = page.getByRole('button', { name: 'Manage token list' });
    this.buttonMenu = page.getByRole('button', { name: 'Open Header Options' });
    this.buttonLock = page.getByRole('button', { name: 'Lock' });
    this.buttonConfirm = page.getByRole('button', { name: 'Confirm' });
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

    // Settings network
    this.buttonNetwork = page.getByRole('button', { name: 'Network' });
    this.buttonSave = page.getByRole('button', { name: 'Save' });
    this.buttonMainnet = page.getByRole('button', { name: 'Mainnet' });
    this.buttonTestnet = page.getByRole('button', { name: 'Testnet' });
    this.buttonBack = page.getByTestId('back-button');
    this.inputStacksURL = page.getByTestId('Stacks URL');
    this.inputBTCURL = page.getByTestId('BTC URL');
    this.inputFallbackBTCURL = page.getByTestId('Fallback BTC URL');

    // Token
    this.labelCoinTitle = page.getByLabel('Coin Title');
    this.checkboxToken = page.locator('input[type="checkbox"]');
    this.checkboxTokenActive = page.locator('input[type="checkbox"]:checked');
    this.checkboxTokenInactive = page.locator('input[type="checkbox"]:not(:checked)');
    this.buttonSip10 = page.getByRole('button', { name: 'SIP-10' });
    this.buttonBRC20 = page.getByRole('button', { name: 'BRC-20' });
    this.buttonRunes = page.getByRole('button', { name: 'RUNES' });
    this.headingTokens = page.getByRole('heading', { name: 'Manage tokens' });
    this.divTokenRow = page.getByLabel('Token Row');
    this.labelTokenSubtitle = page.getByLabel('Token SubTitle');
    this.labelCoinBalance = page.getByLabel('CoinBalance Container').locator('span');

    // Explore
    this.carouselApp = page.getByTestId('app-carousel');
    this.divAppSlide = page.getByTestId('app-slide');
    this.divAppCard = page.getByTestId('app-card');
    this.divAppTitle = page.getByTestId('app-title');

    // Stacking
    this.buttonStartStacking = page.getByRole('button', { name: 'Start stacking' });
    this.headingStacking = page.getByRole('heading', { name: 'Stack STX, earn BTC' });
    this.containerStackingInfo = page.getByTestId('stacking-info');
    this.infoTextStacking = page.locator('h1').filter({ hasText: 'STX with other stackers' });
  }

  async checkVisualsStartpage() {
    // Deny data collection --> modal window is not always appearing so when it does we deny the data collection
    if (await this.buttonDenyDataCollection.isVisible()) {
      await this.buttonDenyDataCollection.click();
    }
    await expect(this.balance).toBeVisible();
    await expect(this.manageTokenButton).toBeVisible();
    // Check if all 4 buttons (send, receive, swap, buy) are visible
    await expect(this.allupperButtons).toHaveCount(4);
    await expect(this.labelAccountName).toBeVisible();
    await expect(this.buttonMenu).toBeVisible();
    await expect(this.labelTokenSubtitle).toHaveCount(2);

    await expect(this.navigationDashboard).toBeVisible();
    await expect(this.navigationNFT).toBeVisible();
    await expect(this.navigationStacking).toBeVisible();
    await expect(this.navigationExplore).toBeVisible();
    await expect(this.navigationSettings).toBeVisible();
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

  async getBalanceOfAllAccounts() {
    const count = await this.accountBalance.count();
    let totalBalance = 0;
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        const balanceText = await this.accountBalance.nth(i).innerText();
        const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
        totalBalance += numericValue;
      }
    } else {
      const balanceText = await this.accountBalance.innerText();
      totalBalance = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    }
    return totalBalance;
  }

  async getBalanceOfAllTokens() {
    const count = await this.labelCoinBalance.count();
    let totalBalance = 0;
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        const balanceText = await this.labelCoinBalance.nth(i).innerText();
        const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
        totalBalance += numericValue;
      }
    } else {
      const balanceText = await this.labelCoinBalance.innerText();
      totalBalance = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    }
    // Check if total balance of all tokens is the same as total wallet balance
    const totalBalanceText = await this.balance.innerText();
    const totalBalanceWallet = parseFloat(totalBalanceText.replace(/[^\d.-]/g, ''));
    await expect(totalBalanceWallet).toBe(totalBalance);
    return totalBalance;
  }

  async enableARandomToken(): Promise<string> {
    const numberOfUnselectedTokens = await this.checkboxTokenInactive.count();

    // Generate a random number within the range of available select elements
    const chosenNumber = Math.floor(Math.random() * numberOfUnselectedTokens) + 1;

    // Access the nth select element (note the adjustment for zero-based indexing)
    const adjustChosenNumber = chosenNumber - 1;
    const chosenUnselectedToken = this.divTokenRow
      .filter({ has: this.checkboxTokenInactive })
      .nth(adjustChosenNumber);
    const enabledTokenName =
      (await chosenUnselectedToken.getAttribute('data-testid')) || 'default-value';
    await chosenUnselectedToken.locator('div.react-switch-handle').click();
    return enabledTokenName;
  }

  async disableARandomToken(): Promise<string> {
    const numberOfUnselectedTokens = await this.checkboxTokenActive.count();

    // Generate a random number within the range of available select elements
    const chosenNumber = Math.floor(Math.random() * numberOfUnselectedTokens) + 1;

    // Access the nth select element (note the adjustment for zero-based indexing)
    const adjustChosenNumber = chosenNumber - 1;
    const chosenUnselectedToken = this.divTokenRow
      .filter({ has: this.checkboxTokenActive })
      .nth(adjustChosenNumber);
    const disabledTokenName =
      (await chosenUnselectedToken.getAttribute('data-testid')) || 'default-value';
    await chosenUnselectedToken.locator('div.react-switch-handle').click();
    return disabledTokenName;
  }

  async disableAllTokens() {
    const allActiveTokens = this.divTokenRow.filter({ has: this.checkboxTokenActive });
    const count = await allActiveTokens.count();
    for (let i = 0; i < count; i++) {
      await allActiveTokens.first().locator('div.react-switch-handle').click();
    }
  }

  async enableAllTokens() {
    const allInactiveTokens = this.divTokenRow.filter({ has: this.checkboxTokenInactive });
    const count = await allInactiveTokens.count();
    for (let i = 0; i < count; i++) {
      // We click the first inactive Token and when this inactive token becomes active we need to click the next one which becomes the first then
      await allInactiveTokens.first().locator('div.react-switch-handle').click();
    }
  }
}
