import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const BTCMain = '3HEcJNAry4C8raqvM4cCPKbZpivTon7hMY';
const BTCTest = '2MySeYxLrpGg47oqZGJUGBu53cVSy7WKGWf';
const selfBTCTest = '2NBNBKm81AkZzufdBAmSPGECqjM5hR9AAH3';

// TODO add API_TIMEOUT_MILLI for timeout --> needs invetigation as playwright itself didn't accept the import of the module

const strongPW = Onboarding.generateSecurePasswordCrypto();
const amountBTCSend = 0.000001;

test.describe('Transaction BTC', () => {
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

  test('Send BTC Page Visual Check without funds Mainnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS2');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(wallet.allupperButtons).toHaveCount(4);

    // Save initial Balance for later Balance checks
    const initalBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    // Send BTC
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Address invalid check
    await wallet.inputBTCAdress.fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in correct Receiver Address
    await wallet.inputBTCAdress.fill(BTCMain);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    // Check visuals from 2 page (send BTC)
    await expect(wallet.inputBTCAmount).toBeVisible();
    await expect(wallet.inputBTCAmount).toBeDisabled();
    await expect(wallet.noFundsBTCMessage).toBeVisible();
    await expect(wallet.buttonNext).toBeHidden();

    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalBTCBalance).toEqual(displayBalanceNumerical);
  });

  test('Send BTC - Cancel transaction testnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();

    // Save initial Balance for later Balance checks
    const initalBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in correct Receiver Address
    await wallet.inputBTCAdress.fill(BTCTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.containerFeeRate).toBeVisible();
    await expect(wallet.inputBTCAmount).toBeVisible();
    await wallet.inputBTCAmount.fill(amountBTCSend.toString());
    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalBTCBalance).toEqual(displayBalanceNumerical);
    // Timeout increased as I had connectivity issues
    await expect(wallet.buttonNext).toBeVisible({ timeout: 30000 });
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    // Check Visuals Review transaction
    await expect(wallet.confirmTotalAmount).toBeVisible();
    await expect(wallet.confirmCurrencyAmount).toBeVisible();
    await expect(wallet.buttonExpand).toBeVisible();
    // Show input and output and check visuals
    await wallet.buttonExpand.click();
    await expect(wallet.sendAddress).toBeVisible();
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(wallet.confirmAmount.first()).toBeVisible();
    await expect(wallet.confirmTotalAmount.first()).toBeVisible();
    await expect(wallet.confirmBalance.first()).toBeVisible();

    // Check correct amounts
    await wallet.checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage('testnet');

    // Check BTC Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initalBTCBalance).toEqual(balanceAfterCancel);
  });

  test.skip('Send BTC - confirm transaction testnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();

    // Save initial Balance for later Balance checks
    const initalBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in correct Receiver Address
    await wallet.inputBTCAdress.fill(BTCTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.containerFeeRate).toBeVisible();
    await expect(wallet.inputBTCAmount).toBeVisible();
    await wallet.inputBTCAmount.fill(amountBTCSend.toString());
    // Timout increased as I had connectivity issues
    await expect(wallet.buttonNext).toBeVisible({ timeout: 30000 });
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    // Check Visuals Review transaction
    await expect(wallet.confirmTotalAmount).toBeVisible();
    await expect(wallet.confirmCurrencyAmount).toBeVisible();
    await expect(wallet.buttonExpand).toBeVisible();
    // Show input and output and check visuals
    await wallet.buttonExpand.click();
    await expect(wallet.sendAddress).toBeVisible();
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(wallet.confirmAmount.first()).toBeVisible();
    await expect(wallet.confirmTotalAmount.first()).toBeVisible();
    await expect(wallet.confirmBalance.first()).toBeVisible();

    // Check correct amounts
    await wallet.checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend);

    await wallet.confirmSendTransaction('testnet');

    // Check BTC Balance after the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initalBTCBalance).toEqual(balanceAfterCancel);
  });

  // TODO: add test where we change the fees for a BTC transaction

  test('Visual Check BTC Transaction history testnet #transaction', async ({
    page,
    extensionId,
  }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();
    // Check if switch to testnet was successfull and all visuals are correct
    await wallet.checkVisualsStartpage('testnet');
    await wallet.divTokenRow.first().click();
    await expect(page.url()).toContain('BTC');
    // Check token detail page for token image and coin title
    await expect(wallet.imageToken).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText('Bitcoin');
    const balanceText = await wallet.coinBalance.innerText();
    const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    // Balance should be greater than 0 in the testnet wallets
    await expect(numericValue).toBeGreaterThan(0);
    await expect(wallet.containerTransactionHistory.first()).toBeVisible();
    // There should be at least one transaction visible
    await expect(await wallet.containerTransactionHistory.count()).toBeGreaterThanOrEqual(1);
  });
});
