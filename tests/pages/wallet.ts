import { expect, type Locator, type Page } from '@playwright/test';
import Onboarding from './onboarding';

const strongPW = Onboarding.generateSecurePasswordCrypto();

export default class Wallet {
  readonly balance: Locator;

  readonly allUpperButtons: Locator;

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

  readonly buttonDenyDataCollection: Locator;

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

  readonly buttonStacks: Locator;

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

  readonly inputSwapAmount: Locator;

  readonly buttonSelectCoin: Locator;

  readonly buttonContinue: Locator;

  readonly buttonDetails: Locator;

  readonly nameToken: Locator;

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

  readonly buttonShowSeedPhrase: Locator;

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

  readonly inputRecipientAddress: Locator;

  readonly inputSendAmount: Locator;

  readonly errorMessageAddressInvalid: Locator;

  readonly errorInsufficientBalance: Locator;

  readonly errorMessageAddressRequired: Locator;

  readonly containerFeeRate: Locator;

  readonly inputBTCAddress: Locator;

  readonly coinBalance: Locator;

  readonly transactionHistoryAmount: Locator;

  readonly containerTransactionHistory: Locator;

  readonly errorMessageSendSelf: Locator;

  readonly infoMessageSendSelf: Locator;

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

  readonly coinSecondaryButton: Locator;

  readonly coinSecondaryContainer: Locator;

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

  readonly labelBundle: Locator;

  readonly buttonSupportRarity: Locator;

  readonly itemCollection: Locator;

  readonly backToGallery: Locator;

  readonly buttonShare: Locator;

  readonly buttonOpenOrdinalViewer: Locator;

  readonly numberInscription: Locator;

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

  readonly buttonGetQuotes: Locator;

  readonly buttonSwap: Locator;

  readonly inputField: Locator;

  readonly buttonEditFee: Locator;

  readonly feeAmount: Locator;

  readonly transactionHistoryInfo: Locator;

  readonly buttonReceive: Locator;

  readonly sendRuneAmount: Locator;

  readonly buttonInsufficientFunds: Locator;

  readonly nameSwapPlace: Locator;

  readonly quoteAmount: Locator;

  readonly infoMessage: Locator;

  readonly buttonSwapPlace: Locator;

  readonly buttonSlippage: Locator;

  readonly buttonSwapToken: Locator;

  readonly minReceivedAmount: Locator;

  readonly nameRune: Locator;

  readonly buttonSelectFee: Locator;

  readonly labelTotalFee: Locator;

  readonly itemUTXO: Locator;

  readonly titleUTXO: Locator;

  readonly buttonQRAddress: Locator;

  readonly labelAddress: Locator;

  readonly containerQRCode: Locator;

  readonly labelFeePriority: Locator;

  readonly divAddress: Locator;

  readonly buttonPreferences: Locator;

  readonly buttonSecurity: Locator;

  readonly buttonAdvanced: Locator;

  readonly errorInsufficientBRC20Balance: Locator;

  readonly BRC20FeeAmount: Locator;

  readonly buttonTransactionSend: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.navigationDashboard = page.getByTestId('nav-dashboard');
    this.navigationNFT = page.getByTestId('nav-nft');
    this.navigationStacking = page.getByTestId('nav-stacking');
    this.navigationExplore = page.getByTestId('nav-explore');
    this.navigationSettings = page.getByTestId('nav-settings');
    // this.balance = page.getByTestId('total-balance-value');
    this.balance = page.getByLabel(/^Total balance/);
    this.textCurrency = page.getByTestId('currency-text');
    this.allUpperButtons = page.getByTestId('transaction-buttons-row').getByRole('button');
    this.buttonTransactionSend = this.allUpperButtons.nth(0);
    this.manageTokenButton = page.getByRole('button', { name: 'Manage token list' });
    this.buttonMenu = page.getByRole('button', { name: 'Open Header Options' });
    this.buttonLock = page.getByRole('button', { name: 'Lock' });
    this.buttonConfirm = page.getByRole('button', { name: 'Confirm' });
    this.buttonDenyDataCollection = page.getByRole('button', { name: 'Deny' });
    this.labelBalanceAmountSelector = page.getByTestId('balance-label');
    this.buttonClose = page.getByRole('button', { name: 'Close' });
    this.buttonEditFee = page.getByTestId('fee-button');
    this.feeAmount = page.getByTestId('fee-amount');
    this.BRC20FeeAmount = page.getByTestId('brc20-fee');
    this.buttonSelectFee = page.getByTestId('fee-select-button');
    this.labelTotalFee = page.getByTestId('total-fee');
    this.labelFeePriority = page.getByTestId('fee-priority');

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
      name: 'Add hardware wallet account',
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
    this.buttonPreferences = page.getByRole('button', { name: 'Preferences' });
    this.buttonSecurity = page.getByRole('button', { name: 'Security' });
    this.buttonAdvanced = page.getByRole('button', { name: 'Advanced' });
    this.buttonBack = page.getByTestId('back-button');
    this.buttonNext = page.getByRole('button', { name: 'Next' });
    this.inputStacksURL = page.getByTestId('Stacks URL');
    this.inputBTCURL = page.getByTestId('BTC URL');
    this.inputFallbackBTCURL = page.getByTestId('Fallback BTC URL');
    this.buttonUpdatePassword = page.getByRole('button', { name: 'Update Password' });
    this.errorMessage = page.getByText(/incorrect password/i);
    this.headerNewPassword = page.getByRole('heading', { name: 'Enter your new password' });
    this.infoUpdatePassword = page.getByText(/password successfully updated/i);
    this.buttonCurrency = page.getByRole('button', { name: 'Fiat Currency' });
    this.buttonShowSeedPhrase = page.getByRole('button', { name: 'Show Seed Phrase' });
    this.selectCurrency = page.getByTestId('currency-button');
    this.iconFlag = page.locator('img[alt="flag"]');

    // Token
    this.labelCoinTitle = page.getByLabel('Coin Title');
    this.checkboxToken = page.locator('label[role="checkbox"]');
    this.checkboxTokenActive = page.locator('label[role="checkbox"][aria-checked="true"]');
    this.checkboxTokenInactive = page.locator('label[role="checkbox"][aria-checked="false"]');
    this.buttonStacks = page.getByRole('button', { name: 'STACKS' });
    this.buttonBRC20 = page.getByRole('button', { name: 'BRC-20' });
    this.buttonRunes = page.getByRole('button', { name: 'RUNES' });
    this.headingTokens = page.getByRole('heading', { name: 'Manage tokens' });

    this.divTokenRow = page.getByLabel('Token Row');
    this.labelTokenSubtitle = page.getByLabel('Token SubTitle');
    this.labelCoinBalanceCurrency = page.getByLabel('Currency Balance Container').locator('span');
    this.labelCoinBalanceCrypto = page.getByLabel('CoinBalance Container').locator('p');

    // Coin details
    this.coinBalance = page.getByTestId('coin-balance');
    this.containerTransactionHistory = page.getByTestId('transaction-container');
    this.transactionHistoryAmount = page.getByTestId('transaction-amount');
    this.transactionHistoryInfo = page.getByTestId('transaction-info');
    this.coinSecondaryButton = page.getByTestId('coin-secondary-button');
    this.coinSecondaryContainer = page.getByTestId('coin-secondary-container');
    this.coinContractAddress = page.getByTestId('coin-contract-address');
    this.textCoinTitle = page.getByTestId('coin-title-text');

    // Collectibles
    this.totalItem = page.getByTestId('total-items');
    this.tabsCollectiblesItems = page.getByTestId('tab-list').locator('button');
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

    this.backToGallery = page.getByTestId('back-to-gallery');
    this.itemCollection = page.getByTestId('collection-item');
    this.buttonSend = page.locator('button').filter({ hasText: 'Send' });
    this.buttonShare = page.locator('button').filter({ hasText: 'Share' });
    this.buttonReceive = page.getByRole('button', { name: /^Receive/i });

    this.buttonOpenOrdinalViewer = page.getByRole('button', { name: 'Open in Ordinal Viewer' });
    this.labelBundle = page.locator('h1').filter({ hasText: 'Bundle' });
    this.labelSatsValue = page.locator('h1').filter({ hasText: 'Sats value' });
    this.labelOwnedBy = page.locator('h1').filter({ hasText: 'Owned by' });
    this.buttonSupportRarity = page.getByRole('button', { name: 'See supported rarity scale' });
    this.numberInscription = page.getByTestId('inscription-number');
    this.numberOrdinal = page.getByTestId('ordinal-number');

    // Explore
    this.carouselApp = page.getByTestId('app-carousel');
    this.divAppSlide = page.getByTestId('app-slide');
    this.divAppCard = page.getByTestId('app-card');
    this.divAppTitle = page.getByTestId('app-title');

    // Receive
    this.buttonQRAddress = page.getByTestId('qr-button');
    this.labelAddress = page.getByTestId('address-label');
    this.divAddress = page.getByTestId('address-div');
    this.containerQRCode = page.getByTestId('qr-container');

    // Swap
    this.imageToken = page.getByTestId('token-image');
    this.buttonSelectCoin = page.getByTestId('select-coin-button');
    this.inputSwapAmount = page.getByTestId('swap-amount');
    this.nameToken = page.getByTestId('token-name');
    this.buttonDownArrow = page.getByTestId('down-arrow-button');
    this.buttonContinue = page.getByRole('button', { name: 'Continue' });
    this.buttonGetQuotes = page.getByRole('button', { name: 'Get quotes' });
    this.buttonSwap = page.getByRole('button', { name: 'Swap', exact: true });
    this.nameSwapPlace = page.getByTestId('place-name');
    this.quoteAmount = page.getByTestId('quote-label');
    this.infoMessage = page.getByTestId('info-message');
    this.buttonSwapPlace = page.getByTestId('swap-place-button');
    this.buttonSwapToken = page.getByTestId('swap-token-button');
    this.buttonSlippage = page.getByTestId('slippage-button');
    this.minReceivedAmount = page.getByTestId('min-received-amount');
    this.nameRune = page.getByTestId('rune-name');
    this.itemUTXO = page.getByTestId('utxo-item');
    this.titleUTXO = page.getByTestId('utxo-title');

    this.buttonDetails = page.getByRole('button', { name: 'Details' });
    this.buttonInsufficientBalance = page.getByRole('button', { name: 'Insufficient balance' });
    this.buttonInsufficientFunds = page.getByRole('button', { name: 'Insufficient funds' });

    this.swapTokenBalance = page.getByTestId('swap-token-balance');
    this.textUSD = page.getByTestId('usd-text');
    this.noFundsBTCMessage = page.getByTestId('no-funds-message');

    // Send
    this.inputSendAmount = page.getByTestId('send-input');
    this.inputRecipientAddress = page.getByTestId('recipient-address');
    this.inputMemo = page.getByTestId('memo-input');
    this.errorMessageAddressInvalid = page
      .locator('p')
      .filter({ hasText: 'Recipient address invalid' });
    this.errorMessageAddressRequired = page
      .locator('p')
      .filter({ hasText: 'Recipient address is required' });
    this.infoMessageSendSelf = page
      .locator('p')
      .filter({ hasText: 'You are transferring to yourself' });
    this.errorMessageSendSelf = page.locator('p').filter({ hasText: 'Cannot send to self' });
    this.errorInsufficientBalance = page.locator('p').filter({ hasText: 'Insufficient balance' });
    this.errorInsufficientBRC20Balance = page.getByText('Insufficient BRC-20 balance');
    this.errorInsufficientFunds = page.locator('p').filter({ hasText: 'Insufficient funds' });
    this.containerFeeRate = page.getByTestId('feerate-container');
    this.inputBTCAddress = page.locator('input[type="text"]');
    this.inputBTCAmount = page.getByTestId('btc-amount');
    this.buttonExpand = page.getByRole('button', { name: 'Inputs & Outputs' });
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
    this.inputField = page.locator('input[type="text"]');
    this.sendRuneAmount = page.getByTestId('send-rune-amount');

    // List
    this.buttonList = page.getByRole('button', { name: 'List List' });
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

  // Helper function to restore the wallet, switch to testnet if parameter is true and navigate to dashboard
  async setupTest(extensionId, wallet, testnet) {
    const onboardingPage = new Onboarding(this.page);
    await onboardingPage.restoreWallet(strongPW, wallet);
    await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
    await this.checkVisualsStartpage();
    if (testnet) {
      await this.navigationSettings.click();
      await this.switchToTestnetNetwork();
      await this.navigationDashboard.click();
      await this.checkVisualsStartpage();
    }
  }

  async checkVisualsStartpage() {
    // to-do fix the element itself, after the native-segwit update it resolves to 2 elements
    // data-testid="total-balance-value"
    await expect(this.balance.first()).toBeVisible();
    await expect(this.manageTokenButton).toBeVisible();

    // Deny data collection --> modal window is not always appearing so when it does we deny the data collection
    if (await this.buttonDenyDataCollection.isVisible()) {
      await this.buttonDenyDataCollection.click();
    }

    await expect(this.labelAccountName).toBeVisible();
    await expect(this.buttonMenu).toBeVisible();
    // expect(await this.labelTokenSubtitle.count()).toBeGreaterThanOrEqual(2);

    await expect(this.navigationDashboard).toBeVisible();
    await expect(this.navigationNFT).toBeVisible();
    await expect(this.navigationStacking).toBeVisible();
    await expect(this.navigationExplore).toBeVisible();
    await expect(this.navigationSettings).toBeVisible();
    expect(await this.divTokenRow.count()).toBeGreaterThan(1);
  }

  async checkVisualsSendSTXPage3() {
    expect(this.page.url()).toContain('confirm-stx-tx');
    await expect(this.buttonConfirm).toBeVisible();
    await expect(this.buttonCancel).toBeVisible();
    await expect(this.receiveAddress).toBeVisible();
    await expect(this.confirmAmount).toBeVisible();
    await expect(this.buttonEditFee).toBeVisible();
    await expect(this.feeAmount).toBeVisible();
    await expect(this.buttonBack).toBeVisible();
  }

  /**
   * Checks the visibility and state of UI elements state on first page in Send Flow
   *
   * @param {string} url - The expected URL to validate the correct page navigation.
   * @param {boolean} moreInputFields - (default: false).
   */
  async checkVisualsSendPage1(url: string, moreInputFields: boolean = false) {
    expect(this.page.url()).toContain(url);
    await expect(this.buttonNext).toBeVisible();
    await expect(this.buttonNext).toBeDisabled();

    if (moreInputFields) {
      // Recipient Address for STX or amount for BRC20
      await expect(this.inputField.first()).toBeVisible();
      // Memo for STX or recipient for BRC20
      await expect(this.inputField.last()).toBeVisible();
    } else {
      await expect(this.receiveAddress).toBeVisible();
    }

    await expect(this.imageToken).toBeVisible();
    // await expect(this.buttonBack).toBeVisible();
  }

  /**
   * Validates UI element visibility and state on second page in Send Flow
   *
   * @param {string} url - URL to verify page navigation; ensures the test is on the correct page.
   * @param {boolean} isSTX - Indicates if the page is STX-specific; adjusts element checks accordingly (default: false).
   */
  async checkVisualsSendPage2(url: string, isSTX: boolean = false) {
    expect(this.page.url()).toContain(url);
    await expect(this.buttonNext).toBeVisible();
    await expect(this.buttonNext).toBeDisabled();

    // Conditional check based on the type of token
    if (isSTX) {
      // STX-specific fields
      await expect(this.inputField.first()).toBeVisible();
    } else {
      // General send amount field
      await expect(this.inputSendAmount).toBeVisible();
    }

    await expect(this.labelBalanceAmountSelector).toBeVisible();
    await expect(this.buttonEditFee).toBeVisible();
    await expect(this.feeAmount).toBeVisible();
    await expect(this.imageToken).toBeVisible();
    // await expect(this.buttonBack).toBeVisible();
  }

  /**
   * Checks the visuals and elements on the send transaction review page.
   *
   * @param {string} url - The expected partial URL of the review page.
   * @param {boolean} editableFees - Optional. Indicates whether the fees can be edited on the Review page
   * @param {string} sendAddress - Optional. The expected last 4 characters of the sender's address
   * @param {string} recipientAddress - Optional. The expected last 4 characters of the receiver's address
   * @param {boolean} totalAmountShown - Optional. Indicates whether the total amount is shown. Default is true.
   * @param {boolean} tokenImageShown - Optional. Indicates whether the token image is shown. Default is true.
   * @param {string} ordinalNumber - Optional. The expected ordinal number to be displayed for single Inscriptions
   */
  async checkVisualsSendTransactionReview(
    url: string,
    editableFees?: boolean,
    sendAddress?: string,
    recipientAddress?: string,
    totalAmountShown: boolean = true,
    tokenImageShown: boolean = true,
    ordinalNumber?: string,
  ) {
    expect(this.page.url()).toContain(url);
    await expect(this.buttonExpand).toBeVisible();
    await expect(this.buttonCancel).toBeEnabled();
    await expect(this.buttonConfirm).toBeEnabled();
    await expect(this.feeAmount).toBeVisible();

    // Not all TX Screens show a total amount
    if (totalAmountShown) {
      await expect(this.confirmTotalAmount.first()).toBeVisible();
      await expect(this.confirmCurrencyAmount.first()).toBeVisible();
    }

    if (tokenImageShown) {
      await expect(this.imageToken.first()).toBeVisible();
    }

    if (editableFees) {
      await expect(this.buttonEditFee).toBeVisible();
    }

    await this.buttonExpand.click();
    await expect(this.confirmAmount.first()).toBeVisible();
    await expect(this.confirmBalance.first()).toBeVisible();

    // Execute these checks only if sendAddress is provided
    if (sendAddress) {
      await expect(this.sendAddress.first()).toBeVisible();
      expect(await this.sendAddress.first().innerText()).toContain(sendAddress.slice(-4));
    }

    // Execute these checks only if recipientAddress is provided
    if (recipientAddress) {
      await expect(this.receiveAddress.first()).toBeVisible();
      expect(await this.receiveAddress.first().innerText()).toContain(recipientAddress.slice(-4));
    }
    // Collection Inscriptions don't have the ordinal number displayed in the Review
    // Check if the right ordinal number is shown
    if (ordinalNumber) {
      const reviewNumberOrdinal = await this.numberInscription.first().innerText();
      expect(ordinalNumber).toMatch(reviewNumberOrdinal);
    }
  }

  // Check Visuals of Rune Dashboard (without List button), return balance amount
  async checkVisualsRunesDashboard(runeName: string) {
    await expect(this.imageToken.first()).toBeVisible();
    await expect(this.textCoinTitle).toBeVisible();
    await expect(this.textCoinTitle).toContainText(runeName);
    await expect(this.coinBalance).toBeVisible();
    await expect(this.buttonReceive).toBeVisible();
    await expect(this.buttonSend).toBeVisible();
    const originalBalanceText = await this.coinBalance.innerText();
    const numericOriginalValue = parseFloat(originalBalanceText.replace(/[^\d.-]/g, ''));
    return numericOriginalValue;
  }

  async checkVisualsListRunesPage() {
    await expect(this.tabNotListed).toBeVisible();
    await expect(this.tabListed).toBeVisible();
    await expect(this.runeItem.first()).toBeVisible();
    expect(await this.runeItem.count()).toBeGreaterThanOrEqual(1);
  }

  async checkVisualsSwapPage() {
    expect(this.page.url()).toContain('swap');
    await expect(this.buttonDownArrow.first()).toBeVisible();
    await expect(this.buttonGetQuotes.first()).toBeVisible();
    await expect(this.buttonGetQuotes.first()).toBeDisabled();
    await expect(this.inputSwapAmount.first()).toBeVisible();
    await expect(this.swapTokenBalance).toContainText('--');
    await expect(this.buttonBack).toBeVisible();
    await expect(this.nameToken.first()).toContainText('Select asset');
    await expect(this.nameToken).toHaveCount(2);
    await expect(this.buttonDownArrow).toHaveCount(2);
    await expect(this.buttonGetQuotes).toBeVisible();
    await expect(this.textUSD).toBeVisible();
    await expect(this.buttonSwapToken).toBeVisible();
  }

  // Helper function to fill in swap amount and returns usd value as number
  async fillSwapAmount(amount) {
    // .Fill() did not work with the field so we need to use this method
    await this.inputSwapAmount.pressSequentially(amount.toString());
    await expect(this.buttonGetQuotes).toBeVisible();

    const usdAmount = await this.textUSD.innerText();
    const numericUSDValue = parseFloat(usdAmount.replace(/[^0-9.]/g, ''));
    expect(numericUSDValue).toBeGreaterThan(0);

    return numericUSDValue;
  }

  // had to disable this rule as my first assertion was always changed to a wrong assertion
  /* eslint-disable playwright/prefer-web-first-assertions */
  async checkVisualsQuotePage(
    tokenName: string,
    slippage: boolean,
    numericQuoteValue: number,
    numericUSDValue: number,
  ) {
    await expect(this.buttonSwap).toBeVisible();
    await expect(this.buttonEditFee).toBeVisible();
    if (slippage) {
      await expect(this.buttonSlippage).toBeVisible();
    }
    // Only 2 token should be visible
    expect(await this.buttonSwapPlace.count()).toBe(2);
    // await expect(await this.imageToken.count()).toBe(2);

    // Check Rune token name
    await expect(this.infoMessage.last()).toContainText(tokenName);

    // Check if USD amount from quote page is the same as from th swap start flow page
    const usdAmountQuote = await this.textUSD.first().innerText();
    const numericUSDQuote = parseFloat(usdAmountQuote.replace(/[^0-9.]/g, ''));
    expect(numericUSDQuote).toEqual(numericUSDValue);
  }
  // check visuals of List on ME page

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

  async invalidAddressCheck(addressField) {
    await addressField.fill(`Test Address 123`);
    await this.buttonNext.click();
    await expect(this.errorMessageAddressInvalid).toBeVisible();
    await expect(this.buttonNext).toBeDisabled();
  }

  // had to disable this rule as my first assertion was always changed to a wrong assertion
  /* eslint-disable playwright/prefer-web-first-assertions */
  async switchToHighFees(feePriorityShown: boolean = true) {
    // Save the current fee amount for comparison
    const originalFee = await this.feeAmount.innerText();
    const numericOriginalFee = parseFloat(originalFee.replace(/[^0-9.]/g, ''));
    expect(numericOriginalFee).toBeGreaterThan(0);
    let feePriority = 'Medium';
    if (feePriorityShown) {
      feePriority = await this.labelFeePriority.innerText();
    }

    // Click on edit Fee button
    await this.buttonEditFee.click();
    await expect(this.buttonSelectFee.first()).toBeVisible();
    await expect(this.labelTotalFee.first()).toBeVisible();

    // Compare fee to previous saved fee
    const fee = await this.buttonSelectFee
      .filter({ hasText: feePriority })
      .locator(this.labelTotalFee)
      .innerText();
    const numericFee = parseFloat(fee.replace(/[^0-9.]/g, ''));
    expect(numericFee).toBe(numericOriginalFee);

    // Save high fee rate for comparison
    const highFee = await this.labelTotalFee.first().innerText();
    const numericHighFee = parseFloat(highFee.replace(/[^0-9.]/g, ''));

    // Switch to high fee
    await this.buttonSelectFee.first().click();

    const newFee = await this.feeAmount.innerText();
    const numericNewFee = parseFloat(newFee.replace(/[^0-9.]/g, ''));
    expect(numericNewFee).toBe(numericHighFee);
  }

  async navigateToCollectibles() {
    await this.navigationNFT.click();
    expect(this.page.url()).toContain('nft-dashboard');
    // If 'enable' rare sats pop up is appearing
    if (await this.buttonEnable.isVisible()) {
      await this.buttonEnable.click();
    }
    // Check visuals on opening Collectibles page
    await expect(this.tabsCollectiblesItems.first()).toBeVisible();
    await expect(this.totalItem).toBeVisible();
  }

  // had to disable this rule as my first assertion was always changed to a wrong assertion
  async checkAmountsSendingSTX(amountSTXSend, STXTest, sendFee) {
    expect(await this.receiveAddress.first().innerText()).toContain(STXTest.slice(-4));

    // Sending amount without Fee
    const sendAmount = await this.confirmAmount.first().innerText();
    const numericValueSendAmount = parseFloat(sendAmount.replace(/[^0-9.]/g, ''));

    expect(numericValueSendAmount).toEqual(amountSTXSend);

    // Fees
    const fee = await this.feeAmount.innerText();
    const numericValueFee = parseFloat(fee.replace(/[^0-9.]/g, ''));
    expect(numericValueFee).toEqual(sendFee);
  }

  async checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend) {
    // Sending amount without Fee
    const amountText = await this.confirmAmount.first().innerText();
    const numericValueAmountText = parseFloat(amountText.replace(/[^0-9.]/g, ''));
    expect(numericValueAmountText).toEqual(amountBTCSend);

    // Address check sending and receiving
    expect(await this.sendAddress.innerText()).toContain(selfBTCTest.slice(-4));
    expect(await this.receiveAddress.first().innerText()).toContain(BTCTest.slice(-4));

    const confirmAmountAfter = await this.confirmAmount.last().innerText();
    const originalFee = await this.feeAmount.innerText();
    const confirmBalance = await this.confirmBalance.innerText();
    // Extract amounts for balance, sending amount and amount afterwards
    const num1 = parseFloat(confirmAmountAfter.replace(/[^0-9.]/g, ''));
    // We need to convert the sats value to BTC for this calculation
    const feeSatsAmount = parseFloat(originalFee.replace(/[^0-9.]/g, ''));
    const num2 = feeSatsAmount / 100000000;
    const num3 = parseFloat(confirmBalance.replace(/[^0-9.]/g, ''));

    // Balance - fees - sending amount
    const roundedResult = Number((num3 - num2 - amountBTCSend).toFixed(9));
    // Check if Balance value after the transaction is the same as the calculated value
    expect(num1).toEqual(roundedResult);
  }

  async confirmSendTransaction(transactionIDShown: boolean = true) {
    await expect(this.buttonConfirm).toBeEnabled();
    await this.buttonConfirm.click();
    await expect(this.buttonClose).toBeVisible({ timeout: 30000 });
    if (transactionIDShown) {
      await expect(this.sendTransactionID).toBeVisible();
    }
    await this.buttonClose.click();
  }

  async getAddress(whichAddress: string): Promise<string> {
    // click on 'Receive' button
    await this.allUpperButtons.nth(1).click();

    // Locate the QR button to the address
    const button = this.divAddress.filter({ hasText: whichAddress }).locator(this.buttonQRAddress);

    // Need to click on the QR Code button to get the full Address
    await button.click();
    await expect(this.containerQRCode).toBeVisible();

    const address = await this.labelAddress.innerText();

    await this.buttonBack.click();

    return address;
  }

  async getTokenBalance(tokenname: string) {
    try {
      const locator = this.page
        .locator('button')
        .filter({ hasText: new RegExp(`^${tokenname}.*\\d`) });

      console.log(`Looking for balance for ${tokenname}`);
      const balanceText = await locator.innerText();
      console.log('Found balance text:', balanceText);

      // Extract just the numeric portion (matches any number with decimal points)
      const matches = balanceText.match(/\d+\.?\d*/);
      if (!matches) {
        throw new Error(`Could not extract balance from text: ${balanceText}`);
      }

      const numericValue = parseFloat(matches[0]);
      console.log('Parsed numeric value:', numericValue);
      return numericValue;
    } catch (error) {
      console.error(`Error getting balance for ${tokenname}:`, error);
      throw error;
    }
  }

  async clickOnSpecificToken(tokenname: string) {
    const specificToken = this.page.getByRole('button').getByLabel(`Token Title: ${tokenname}`);
    // filter({
    //   has: this.labelTokenSubtitle.getByText(tokenname, { exact: true }),

    await specificToken.last().click();
  }

  async clickOnSpecificInscription(inscriptionName: string) {
    const specificToken = this.containersCollectibleItem
      .filter({
        has: this.nameInscription.getByText(inscriptionName, { exact: true }),
      })
      .getByTestId('inscription-container');
    await specificToken.last().click();
  }

  // This function tries to click on a specific rune, if the rune is not enabled it will enable the test rune and then click on it
  async checkAndClickOnSpecificRune(tokenname: string) {
    // Check if test rune is enabled and if not enabled the test rune
    try {
      // click on the test rune
      await this.clickOnSpecificToken(tokenname);
    } catch (error) {
      // if the rune was not clickable we need to enable the test rune
      // Execute alternative commands if an error occurs
      console.log('Test Rune is not active and need to be enabled');
      // Insert your fallback logic here
      // check if the test rune is enabled
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
        await this.runeSKIBIDI.locator('label[role="checkbox"]').click();
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

  async checkTestnetUrls(shouldContainTestnet: boolean) {
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

  async switchToTestnetNetwork() {
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

    // TODO think of a better way to do this
    // Wait for the network to be switched so that API doesn't fail because of the rate limiting

    await expect(this.buttonSave).toBeEnabled({ timeout: 15000 });
    await this.buttonSave.click();
    await expect(this.buttonNetwork).toBeVisible({ timeout: 30000 });
    await expect(this.buttonNetwork).toHaveText('NetworkTestnet');
  }

  async switchToMainnetNetwork() {
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

    // TODO think of a better way to do this
    // Wait for the network to be switched so that API doesn't fail because of the rate limiting
    await this.page.waitForTimeout(15000);

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
    return totalBalance;
  }

  async selectLastToken(tokenType: 'BRC20' | 'STACKS'): Promise<string> {
    await this.manageTokenButton.click();
    await expect(this.page.url()).toContain('manage-tokens');

    if (tokenType === 'BRC20') {
      await this.buttonBRC20.click();
    } else if (tokenType === 'STACKS') {
      await this.buttonStacks.click();
    }

    const chosenToken = this.divTokenRow.last();
    const tokenName = (await chosenToken.getAttribute('data-testid')) || 'default-value';
    await this.buttonBack.click();
    return tokenName;
  }

  // The function toggleRandomToken takes a boolean parameter enable to determine the action:
  //	true indicates enabling a token (using inactive tokens).
  //	false indicates disabling a token (using active tokens).
  async toggleRandomToken(enable: boolean): Promise<string> {
    const tokenStateLocator = enable ? this.checkboxTokenInactive : this.checkboxTokenActive;
    await expect(tokenStateLocator.first()).toBeVisible();
    const numberOfTokens = await tokenStateLocator.count();

    // Generate a random index within the range of available tokens
    const chosenIndex = Math.floor(Math.random() * numberOfTokens);

    // Access the nth token (adjusting for zero-based indexing)
    const chosenToken = this.divTokenRow.filter({ has: tokenStateLocator }).nth(chosenIndex);
    const tokenName = (await chosenToken.getAttribute('data-testid')) || 'default-value';

    // Click the switch handle to toggle the token's state
    await chosenToken.locator('label[role="checkbox"]').click();

    return tokenName;
  }

  // The function toggleAllTokens takes a boolean parameter enable.
  //	true indicates enabling token (using inactive tokens).
  //	false indicates disabling token (using active tokens).
  async toggleAllTokens(enable: boolean) {
    // Determine which tokens to interact with based on the 'enable' parameter
    const tokenSelector = enable ? this.checkboxTokenInactive : this.checkboxTokenActive;
    const actionTokens = this.divTokenRow.filter({ has: tokenSelector });
    const count = await actionTokens.count();

    for (let i = 0; i < count; i++) {
      // Since clicking the switch will change its state, always interact with the first one
      await actionTokens.first().locator('label[role="checkbox"]').click();
    }
  }

  // Helper function to wait for a field to get greater than 0. Some fields are slowly to load for the E2E so we need to ensure that their is a value loaded before continue
  async waitForTextAboveZero(selector, timeout = 30000) {
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for text to be above 0');
      }
      const text = await selector.innerText();
      const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (numericValue > 0) {
        return; // Exit the function when the condition is met
      }
      await this.page.waitForTimeout(1000); // Check every second
    }
  }
}
