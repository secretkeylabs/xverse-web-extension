import { expect, type Locator, type Page } from '@playwright/test';
import Onboarding from './onboarding';

const strongPW = Onboarding.generateSecurePasswordCrypto();

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

  readonly labelCoinBalanceCurrency: Locator;

  readonly navigationDashboard: Locator;

  readonly navigationNFT: Locator;

  readonly navigationStacking: Locator;

  readonly navigationExplore: Locator;

  readonly navigationSettings: Locator;

  readonly divAppSlide: Locator;

  readonly divAppCard: Locator;

  readonly divAppTitle: Locator;

  readonly carouselApp: Locator;

  readonly buttonDownArrow: Locator;

  readonly inputCoinAmount: Locator;

  readonly buttonSelectCoin: Locator;

  readonly buttonContinue: Locator;

  readonly buttonDetails: Locator;

  readonly coinText: Locator;

  readonly buttonInsufficientBalance: Locator;

  readonly imageToken: Locator;

  readonly swapTokenBalance: Locator;

  readonly textUSD: Locator;

  readonly buttonStartStacking: Locator;

  readonly headingStacking: Locator;

  readonly containerStackingInfo: Locator;

  readonly infoTextStacking: Locator;

  readonly buttonUpdatePassword: Locator;

  readonly errorMessage: Locator;

  readonly headerNewPassword: Locator;

  readonly infoUpdatePassword: Locator;

  readonly buttonCurrency: Locator;

  readonly buttonBackupWallet: Locator;

  readonly textCurrency: Locator;

  readonly iconFlag: Locator;

  readonly selectCurrency: Locator;

  readonly totalItem: Locator;

  readonly tabsCollectiblesItems: Locator;

  readonly containersCollectibleItem: Locator;

  readonly containerRareSats: Locator;

  readonly containerInscription: Locator;

  readonly nameInscription: Locator;

  readonly amountInscription: Locator;

  readonly buttonNext: Locator;

  readonly inputMemo: Locator;

  readonly inputRecipientAdress: Locator;

  readonly inputSendAmount: Locator;

  readonly errorMessageAddressInvalid: Locator;

  readonly errorInsufficientBalance: Locator;

  readonly errorMessageAddressRequired: Locator;

  readonly containerFeeRate: Locator;

  readonly inputBTCAdress: Locator;

  readonly coinBalance: Locator;

  readonly transactionHistoryAmount: Locator;

  readonly containerTransactionHistory: Locator;

  readonly errorMessageSendSelf: Locator;

  readonly inputBTCAmount: Locator;

  readonly buttonExpand: Locator;

  readonly confirmCurrencyAmount: Locator;

  readonly confirmTotalAmount: Locator;

  readonly confirmAmount: Locator;

  readonly sendAddress: Locator;

  readonly receiveAddress: Locator;

  readonly confirmBalance: Locator;

  readonly buttonCancel: Locator;

  readonly labelCoinBalanceCrypto: Locator;

  readonly labelBalanceAmountSelector: Locator;

  readonly buttonClose: Locator;

  readonly sendTransactionID: Locator;

  readonly errorInsufficientFunds: Locator;

  readonly noFundsBTCMessage: Locator;

  readonly buttonCoinContract: Locator;

  readonly coinContractContainer: Locator;

  readonly coinContractAddress: Locator;

  readonly textCoinTitle: Locator;

  readonly sendSTXValue: Locator;

  readonly buttonList: Locator;

  readonly tabAvailable: Locator;

  readonly tabListed: Locator;

  readonly tabNotListed: Locator;

  readonly buttonSetPrice: Locator;

  readonly runeSKIBIDI: Locator;

  readonly runeItem: Locator;

  readonly runeItemCheckbox: Locator;

  readonly buttonFloorPrice: Locator;

  readonly button5Price: Locator;

  readonly button10Price: Locator;

  readonly button20Price: Locator;

  readonly buttonCustomPrice: Locator;

  readonly buttonApply: Locator;

  readonly inputListingPrice: Locator;

  readonly runeContainer: Locator;

  readonly runeTitle: Locator;

  readonly runePrice: Locator;

  readonly buttonEnable: Locator;

  readonly buttonSend: Locator;

  readonly labelSatsValue: Locator;

  readonly labelOwnedBy: Locator;

  readonly labelRareSats: Locator;

  readonly buttonSupportRarity: Locator;

  readonly itemCollenction: Locator;

  readonly buttonShare: Locator;

  readonly buttonOpenOrdinalViewer: Locator;

  readonly textValueReviewPage: Locator;

  readonly numberOrdinal: Locator;

  readonly containersCollectibleItemCollection: Locator;

  readonly containersCollectibleItemSingle: Locator;

  readonly nameInscriptionCollection: Locator;

  readonly nameInscriptionSingle: Locator;

  readonly sendAmount: Locator;

  readonly sendCurrencyAmount: Locator;

  readonly listedRune: Locator;

  readonly signingAddress: Locator;

  readonly buttonSign: Locator;

  readonly buttonReload: Locator;

  readonly listedRunePrice: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.navigationDashboard = page.getByTestId('nav-dashboard');
    this.navigationNFT = page.getByTestId('nav-nft');
    this.navigationStacking = page.getByTestId('nav-stacking');
    this.navigationExplore = page.getByTestId('nav-explore');
    this.navigationSettings = page.getByTestId('nav-settings');
    this.balance = page.getByTestId('total-balance-value');
    this.textCurrency = page.getByTestId('currency-text');
    this.allupperButtons = page.getByTestId('transaction-buttons-row').getByRole('button');
    this.manageTokenButton = page.getByRole('button', { name: 'Manage token list' });
    this.buttonMenu = page.getByRole('button', { name: 'Open Header Options' });
    this.buttonLock = page.getByRole('button', { name: 'Lock' });
    this.buttonConfirm = page.getByRole('button', { name: 'Confirm' });
    this.buttonResetWallet = page.getByRole('button', { name: 'Reset Wallet' });
    this.buttonDenyDataCollection = page.getByRole('button', { name: 'Deny' });
    this.labelBalanceAmountSelector = page.getByTestId('balance-label');
    this.buttonClose = page.getByRole('button', { name: 'Close' });

    // Account
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

    // Settings network
    this.buttonNetwork = page.getByRole('button', { name: 'Network' });
    this.buttonSave = page.getByRole('button', { name: 'Save' });
    this.buttonMainnet = page.getByRole('button', { name: 'Mainnet' });
    this.buttonTestnet = page.getByRole('button', { name: 'Testnet' });
    this.buttonBack = page.getByTestId('back-button');
    this.buttonNext = page.getByRole('button', { name: 'Next' });
    this.inputStacksURL = page.getByTestId('Stacks URL');
    this.inputBTCURL = page.getByTestId('BTC URL');
    this.inputFallbackBTCURL = page.getByTestId('Fallback BTC URL');
    this.buttonUpdatePassword = page.getByRole('button', { name: 'Update Password' });
    this.errorMessage = page.getByRole('heading', { name: 'Incorrect password' });
    this.headerNewPassword = page.getByRole('heading', { name: 'Enter your new password' });
    this.infoUpdatePassword = page.getByRole('heading', { name: 'Password successfully updated' });
    this.buttonCurrency = page.getByRole('button', { name: 'Fiat Currency' });
    this.buttonBackupWallet = page.getByRole('button', { name: 'Backup Wallet' });
    this.selectCurrency = page.getByTestId('currency-button');
    this.iconFlag = page.locator('img[alt="flag"]');

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
    this.labelCoinBalanceCurrency = page.getByLabel('CoinBalance Container').locator('span');
    this.labelCoinBalanceCrypto = page.getByLabel('CoinBalance Container').locator('p');

    // Coin details
    this.coinBalance = page.getByTestId('coin-balance');
    this.containerTransactionHistory = page.getByTestId('transaction-container');
    this.transactionHistoryAmount = page.getByTestId('transaction-amount');
    this.buttonCoinContract = page.getByTestId('coin-contract-button');
    this.coinContractContainer = page.getByTestId('coin-contract-container');
    this.coinContractAddress = page.getByTestId('coin-contract-address');
    this.textCoinTitle = page.getByTestId('coin-title-text');

    // Collectibles
    this.totalItem = page.getByTestId('total-items');
    this.tabsCollectiblesItems = page.getByTestId('tab-list').locator('li');
    this.containerRareSats = page.getByTestId('rareSats-container');
    this.nameInscription = page.getByTestId('inscription-name');
    this.containersCollectibleItem = page.getByTestId('collection-container');
    this.amountInscription = page.getByTestId('inscription-amount');
    this.containersCollectibleItemCollection = this.containersCollectibleItem.filter({
      has: this.amountInscription.filter({
        hasText: /\d+\s+item(s)?/i,
      }),
    });
    this.containersCollectibleItemSingle = this.containersCollectibleItem.filter({
      has: this.amountInscription.filter({
        hasText: /^$/,
      }),
    });
    this.nameInscriptionCollection =
      this.containersCollectibleItemCollection.getByTestId('inscription-name');
    this.nameInscriptionSingle =
      this.containersCollectibleItemSingle.getByTestId('inscription-name');
    this.buttonEnable = page.getByRole('button', { name: 'Enable' });
    this.containerInscription = page.getByTestId('inscription-container');

    this.itemCollenction = page.getByTestId('collection-item');
    this.buttonSend = page.getByRole('button', { name: 'Send' });
    this.buttonShare = page.getByRole('button', { name: 'Share' });
    this.buttonOpenOrdinalViewer = page.getByRole('button', { name: 'Open in Ordinal Viewer' });
    this.labelSatsValue = page.locator('h1').filter({ hasText: 'Sats value' });
    this.labelOwnedBy = page.locator('h1').filter({ hasText: 'Owned by' });
    this.labelRareSats = page.locator('p').filter({ hasText: 'Rare Sats' });
    this.buttonSupportRarity = page.getByRole('button', { name: 'See supported rarity scale' });
    this.textValueReviewPage = page.getByTestId('value-text');
    this.numberOrdinal = page.getByTestId('ordinal-number');

    // Explore
    this.carouselApp = page.getByTestId('app-carousel');
    this.divAppSlide = page.getByTestId('app-slide');
    this.divAppCard = page.getByTestId('app-card');
    this.divAppTitle = page.getByTestId('app-title');

    // Receive
    this.buttonCopyBitcoinAddress = page.locator('#copy-address-Bitcoin');
    this.buttonCopyOrdinalsAddress = page.locator(
      '#copy-address-Ordinals\\,\\ BRC-20\\ \\&\\ Runes',
    );
    this.buttonCopyStacksAddress = page.locator(
      '#copy-address-Stacks\\ NFTs\\ \\&\\ SIP-10\\ tokens',
    );
    this.buttonConfirmCopyAddress = page.getByRole('button', { name: 'I understand' });

    // Swap
    this.buttonSelectCoin = page.getByTestId('select-coin-button');
    this.inputCoinAmount = page.getByTestId('coin-input');
    this.coinText = page.getByTestId('coin-text');
    this.buttonDownArrow = page.getByTestId('down-arrow-button');
    this.buttonContinue = page.getByRole('button', { name: 'Continue' });
    this.buttonDetails = page.getByRole('button', { name: 'Details' });
    this.buttonInsufficientBalance = page.getByRole('button', { name: 'Insufficient balance' });
    this.imageToken = page.getByTestId('token-image');
    this.swapTokenBalance = page.getByTestId('swap-token-balance');
    this.textUSD = page.getByTestId('usd-text');
    this.noFundsBTCMessage = page.getByTestId('no-funds-message');

    // Send
    this.inputSendAmount = page.getByTestId('send-input');
    this.inputRecipientAdress = page.getByTestId('recipient-adress');
    this.inputMemo = page.getByTestId('memo-input');
    this.errorMessageAddressInvalid = page
      .locator('p')
      .filter({ hasText: 'Recipient address invalid' });
    this.errorMessageAddressRequired = page
      .locator('p')
      .filter({ hasText: 'Recipient address is required' });
    this.errorMessageSendSelf = page.locator('p').filter({ hasText: 'Cannot send to self' });
    this.errorInsufficientBalance = page.locator('p').filter({ hasText: 'Insufficient balance' });
    this.errorInsufficientFunds = page.locator('p').filter({ hasText: 'Insufficient funds' });
    this.containerFeeRate = page.getByTestId('feerate-container');
    this.inputBTCAdress = page.locator('input[type="text"]');
    this.inputBTCAmount = page.getByTestId('btc-amount');
    this.buttonExpand = page.getByRole('button', { name: 'Inputs & Outputs Dropdown' });
    this.confirmTotalAmount = page.getByTestId('confirm-total-amount');
    this.confirmCurrencyAmount = page.getByTestId('confirm-currency-amount');
    this.confirmAmount = page.getByTestId('confirm-amount');
    this.sendAddress = page.getByTestId('address-send');
    this.receiveAddress = page.getByTestId('address-receive');
    this.confirmBalance = page.getByTestId('confirm-balance');
    this.buttonCancel = page.getByRole('button', { name: 'Cancel' });
    this.buttonSign = page.getByRole('button', { name: 'Sign' });
    this.sendTransactionID = page.getByTestId('transaction-id');
    this.sendSTXValue = page.getByTestId('send-value');

    // List
    this.buttonList = page.getByTestId('action-button').filter({ hasText: 'List' });
    this.tabAvailable = page.getByTestId('available-tab');
    this.tabListed = page.getByRole('button', { name: 'LISTED', exact: true });
    this.tabNotListed = page.getByRole('button', { name: 'NOT LISTED' });
    this.listedRune = page.getByTestId('listed-rune-container');

    this.buttonSetPrice = page.getByRole('button', { name: 'Set price' });
    // this is the test rune to be used for listing
    this.runeSKIBIDI = page.getByTestId('SKIBIDI•OHIO•RIZZ');
    this.runeItem = page.getByTestId('rune-item');
    this.runeItemCheckbox = page.locator('#list-rune');
    this.buttonFloorPrice = page.getByRole('button', { name: 'Floor', exact: true });
    this.button5Price = page.getByRole('button', { name: '+5%', exact: true });
    this.button10Price = page.getByRole('button', { name: '+10%', exact: true });
    this.button20Price = page.getByRole('button', { name: '+20%', exact: true });
    this.buttonCustomPrice = page.getByRole('button', { name: 'Custom', exact: true });
    this.buttonApply = page.getByRole('button', { name: 'Apply', exact: true });
    this.inputListingPrice = page.locator('input[type="number"]');
    this.runeContainer = page.getByTestId('rune-container');
    this.runeTitle = page.getByTestId('rune-title');
    this.runePrice = page.getByTestId('rune-price').locator('p').filter({ hasText: 'sats' });
    this.sendAmount = page.getByTestId('send-amount');
    this.sendCurrencyAmount = page.getByTestId('send-currency-amount');
    this.signingAddress = page.getByTestId('signing-address');
    this.buttonReload = page.getByTestId('reload-button');
    this.listedRunePrice = page.getByTestId('listed-price');

    // Stacking
    this.buttonStartStacking = page.getByRole('button', { name: 'Start stacking' });
    this.headingStacking = page.getByRole('heading', { name: 'Stack STX, earn BTC' });
    this.containerStackingInfo = page.getByTestId('stacking-info');
    this.infoTextStacking = page.locator('h1').filter({ hasText: 'STX with other stackers' });
  }

  // Helper function to restore the wallet and switch it to testnet
  async setupTestnetTest(extensionId, wallet) {
    const onboardingpage = new Onboarding(this.page);
    await onboardingpage.restoreWallet(strongPW, wallet);
    await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
    await this.checkVisualsStartpage();
    await this.navigationSettings.click();
    await this.switchtoTestnetNetwork();
  }

  async checkVisualsStartpage(network?: string) {
    await expect(this.balance).toBeVisible();
    await expect(this.manageTokenButton).toBeVisible();

    // Deny data collection --> modal window is not always appearing so when it does we deny the data collection
    if (await this.buttonDenyDataCollection.isVisible()) {
      await this.buttonDenyDataCollection.click();
    }

    /*
TODO: needs to be changed to be debending on network and feature enabled
const { getXverseApiClient } = require('@secretkeylabs/xverse-core');

    const featureFlags = await getXverseApiClient('Mainnet').getAppFeatures();
    const featureEnabled = featureFlags?.SWAPS?.enabled;
    switch (true) {
      case network === 'testnet':
        // Check if all 3 buttons (send, receive, buy) are visible
        await expect(this.allupperButtons).toHaveCount(3);
        break;
      default:
        // Check if all 4 buttons (send, receive, swap, buy) are visible
        await expect(this.allupperButtons).toHaveCount(4);
    }
*/
    // await expect(this.allupperButtons).toHaveCount(3);
    await expect(this.labelAccountName).toBeVisible();
    await expect(this.buttonMenu).toBeVisible();
    await expect(await this.labelTokenSubtitle.count()).toBeGreaterThanOrEqual(2);

    await expect(this.navigationDashboard).toBeVisible();
    await expect(this.navigationNFT).toBeVisible();
    await expect(this.navigationStacking).toBeVisible();
    await expect(this.navigationExplore).toBeVisible();
    await expect(this.navigationSettings).toBeVisible();
    await expect(await this.divTokenRow.count()).toBeGreaterThan(1);
  }

  async checkVisualsSendSTXPage() {
    await expect(this.page.url()).toContain('send-stx');
    await expect(this.buttonNext).toBeVisible();
    await expect(this.buttonNext).toBeDisabled();
    // await expect(this.inputSendAmount).toBeVisible();
    await expect(this.inputRecipientAdress).toBeVisible();
    await expect(this.inputMemo).toBeVisible();
    await expect(this.imageToken).toBeVisible();
    await expect(this.buttonBack).toBeVisible();
  }

  async checkVisualsListRunesPage() {
    await expect(this.tabNotListed).toBeVisible();
    await expect(this.tabListed).toBeVisible();
    await expect(this.buttonSetPrice).toBeVisible();
    await expect(this.buttonSetPrice).toBeDisabled();
    await expect(this.runeItem.first()).toBeVisible();
    await expect(await this.runeItem.count()).toBeGreaterThanOrEqual(1);
  }

  async checkVisualsListOnMEPage() {
    await expect(this.buttonFloorPrice).toBeVisible();
    await expect(this.button5Price).toBeVisible();
    await expect(this.button10Price).toBeVisible();
    await expect(this.button20Price).toBeVisible();
    await expect(this.buttonCustomPrice).toBeVisible();
    await expect(this.buttonContinue).toBeVisible();
    await expect(this.buttonContinue).toBeDisabled();
    await expect(this.runeContainer.first()).toBeVisible();
  }

  async navigateToCollectibles() {
    await this.navigationNFT.click();
    await expect(this.page.url()).toContain('nft-dashboard');
    // If 'enable' rare sats pop up is appearing
    if (await this.buttonEnable.isVisible()) {
      await this.buttonEnable.click();
    }
    // Check visuals on opening Collectibles page
    await expect(this.tabsCollectiblesItems.first()).toBeVisible();
    await expect(this.totalItem).toBeVisible();
  }

  // had to disable this rule as my first assertion was always changed to a wrong assertion
  /* eslint-disable playwright/prefer-web-first-assertions */
  async checkAmountsSendingSTX(amountSTXSend, STXTest) {
    await expect(await this.receiveAddress.first().innerText()).toContain(STXTest.slice(-4));

    // Sending amount without Fee
    const sendAmount = await this.confirmAmount.first().innerText();
    const numericValueSendAmount = parseFloat(sendAmount.replace(/[^0-9.]/g, ''));

    await await expect(numericValueSendAmount).toEqual(amountSTXSend);

    // Fees
    const fee = await this.sendSTXValue.first().innerText();
    const numericValueFee = parseFloat(fee.replace(/[^0-9.]/g, ''));

    // total amount (amount + fees)
    const totalAmount = await this.sendSTXValue.last().innerText();
    const numericValuetotalAmount = parseFloat(totalAmount.replace(/[^0-9.]/g, ''));

    const roundedResult = Number((numericValueSendAmount + numericValueFee).toFixed(9));
    await expect(numericValuetotalAmount).toEqual(roundedResult);
  }

  /* eslint-disable playwright/prefer-web-first-assertions */
  async checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend) {
    // Sending amount without Fee
    const amountText = await this.confirmAmount.first().innerText();
    const numericValueamountText = parseFloat(amountText.replace(/[^0-9.]/g, ''));
    await expect(numericValueamountText).toEqual(amountBTCSend);

    // Address check sending and receiving
    await expect(await this.sendAddress.innerText()).toContain(selfBTCTest.slice(-4));
    await expect(await this.receiveAddress.first().innerText()).toContain(BTCTest.slice(-4));

    const confirmAmountAfter = await this.confirmAmount.last().innerText();
    const confirmTotalAmount = await this.confirmTotalAmount.innerText();
    const confirmBalance = await this.confirmBalance.innerText();
    // Extract amounts for balance, sending amount and amount afterwards
    const num1 = parseFloat(confirmAmountAfter.replace(/[^0-9.]/g, ''));
    const num2 = parseFloat(confirmTotalAmount.replace(/[^0-9.]/g, ''));
    const num3 = parseFloat(confirmBalance.replace(/[^0-9.]/g, ''));

    const roundedResult = Number((num3 - num2).toFixed(9));
    await expect(num1).toEqual(roundedResult);
  }

  async confirmSendTransaction() {
    await expect(this.buttonConfirm).toBeEnabled();
    await this.buttonConfirm.click();
    await expect(this.buttonClose).toBeVisible();
    await expect(this.sendTransactionID).toBeVisible();
    await this.buttonClose.click();
  }

  async getAddress(button: Locator, ClickConfirm = true): Promise<string> {
    await expect(button).toBeVisible();
    await button.click();

    if (ClickConfirm) {
      await expect(this.buttonConfirmCopyAddress).toBeVisible();
      await this.buttonConfirmCopyAddress.click();
    }

    const address = await this.page.evaluate<string>('navigator.clipboard.readText()');
    return address;
  }

  async getTokenBalance(tokenname) {
    const locator = this.page
      .getByRole('button')
      .filter({ has: this.labelTokenSubtitle.getByText(tokenname, { exact: true }) })
      .getByLabel('CoinBalance Container')
      .locator('p');
    const balanceText = await locator.innerText();
    const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    return numericValue;
  }

  async clickOnSpecificToken(tokenname) {
    const specificToken = this.page
      .getByRole('button')
      .filter({ has: this.labelTokenSubtitle.getByText(tokenname, { exact: true }) });
    await specificToken.last().click();
  }

  async clickOnSpecificInscription(inscriptionname) {
    const specificToken = this.containersCollectibleItem
      .filter({
        has: this.nameInscription.getByText(inscriptionname, { exact: true }),
      })
      .getByTestId('inscription-container');
    await specificToken.last().click();
  }

  // This function tries to click on a specific rune, if the rune is not enabled it will enable the test rune and then click on it
  async checkAndClickOnSpecificRune(tokenname) {
    // Check if test rune is enabled and if not enabled the test rune
    try {
      // click on the test rune
      await this.clickOnSpecificToken(tokenname);
    } catch (error) {
      // if the rune was not clickable we need to enable the test rune
      // Execute alternative commands if an error occurs
      console.log('Test Rune is not active and need to be enabled');
      // Insert your fallback logic here
      // check if the test rune is enbaled
      await this.manageTokenButton.click();
      await this.buttonRunes.click();
      await expect(this.divTokenRow.first()).toBeVisible();
      await expect(this.runeSKIBIDI).toBeVisible({ timeout: 30000 });

      // if clause for enabled check
      const count = await this.checkboxTokenActive.count();
      // If no runes are enabled enable the Test rune
      if (count !== 1) {
        console.log(
          'No active token checkbox found or there are multiple, taking alternative action.',
        );
        // Activate Test rune
        await this.runeSKIBIDI.locator('div.react-switch-handle').click();
      } else {
        console.log('One active token checkbox is present.');
      }
      // Switch back to dashboard and click on the rune
      await this.buttonBack.click();
      await this.clickOnSpecificToken(tokenname);
    }
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

    await this.inputStacksURL.fill('https://api.nakamoto.testnet.hiro.so');
    // To speed up some checks we use our own servers
    // await this.inputBTCURL.fill('https://btc-testnet.xverse.app');

    await this.checkTestnetUrls(true);

    await this.buttonSave.click();
    await expect(this.buttonNetwork).toBeVisible({ timeout: 30000 });
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
    await expect(this.buttonNetwork).toBeVisible({ timeout: 30000 });
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
    const count = await this.labelCoinBalanceCurrency.count();
    let totalBalance = 0;
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        const balanceText = await this.labelCoinBalanceCurrency.nth(i).innerText();
        const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
        totalBalance += numericValue;
      }
    } else {
      const balanceText = await this.labelCoinBalanceCurrency.innerText();
      totalBalance = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    }
    // Check if total balance of all tokens is the same as total wallet balance
    const totalBalanceText = await this.balance.innerText();
    const totalBalanceWallet = parseFloat(totalBalanceText.replace(/[^\d.-]/g, ''));
    await expect(totalBalanceWallet).toBe(totalBalance);
    return totalBalance;
  }

  async enableRandomBRC20Token(): Promise<string> {
    await this.manageTokenButton.click();
    await expect(this.page.url()).toContain('manage-tokens');
    await this.buttonBRC20.click();
    const tokenName = await this.enableARandomToken();
    await this.buttonBack.click();
    await expect(this.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeVisible();
    return tokenName;
  }

  async enableRandomSIP10Token(): Promise<string> {
    await this.manageTokenButton.click();
    await expect(this.page.url()).toContain('manage-tokens');
    const tokenName = await this.enableARandomToken();
    await this.buttonBack.click();
    await expect(this.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeVisible();
    return tokenName;
  }

  async enableARandomToken(): Promise<string> {
    await expect(this.checkboxTokenInactive.first()).toBeVisible();
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
    await expect(this.checkboxTokenActive.first()).toBeVisible();
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
