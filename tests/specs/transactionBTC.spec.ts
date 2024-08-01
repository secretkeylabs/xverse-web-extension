import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const BTCMain = '3HEcJNAry4C8raqvM4cCPKbZpivTon7hMY';
const BTCTest = '2MySeYxLrpGg47oqZGJUGBu53cVSy7WKGWf';

// TODO: add API_TIMEOUT_MILLI for timeout --> needs invetigation as playwright itself didn't accept the import of the module
const amountBTCSend = 0.000001;

test.describe('Transaction BTC', () => {
  test('Send BTC Page Visual Check without funds Mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS2', false);

    // get own BTC  & Ordinals Address for address check on review page
    const selfBTC = await wallet.getAddress(0);

    // Save initial Balance for later Balance checks
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allUpperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    // Send BTC
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Address invalid check
    await wallet.inputBTCAddress.fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in own Address to check info message
    await wallet.inputBTCAddress.fill(selfBTC);
    await expect(wallet.buttonNext).toBeEnabled();
    await expect(wallet.infoMessageSendSelf).toBeVisible();
    // Fill in correct Receiver Address
    await wallet.inputBTCAddress.fill(BTCMain);
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
    await expect(initialBTCBalance).toEqual(displayBalanceNumerical);
  });

  test('Send BTC - Cancel transaction testnet', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC Address
    const selfBTCTest = await wallet.getAddress(0);

    // Save initial Balance for later Balance checks
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allUpperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in correct Receiver Address
    await wallet.inputBTCAddress.fill(BTCTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.containerFeeRate).toBeVisible();
    await expect(wallet.inputBTCAmount).toBeVisible();
    await wallet.inputBTCAmount.fill(amountBTCSend.toString());
    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initialBTCBalance).toEqual(displayBalanceNumerical);
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
    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(wallet.confirmAmount.first()).toBeVisible();
    await expect(wallet.confirmTotalAmount.first()).toBeVisible();
    await expect(wallet.confirmBalance.first()).toBeVisible();

    // Check correct amounts
    await wallet.checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check BTC Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initialBTCBalance).toEqual(balanceAfterCancel);
  });

  test('Send BTC - confirm transaction testnet #localexecution', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC Address
    const selfBTCTest = await wallet.getAddress(0);

    // Save initial Balance for later Balance checks
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.allUpperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Bitcoin');
    await expect(page.url()).toContain('send-btc');
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in correct Receiver Address
    await wallet.inputBTCAddress.fill(BTCTest);
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
    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(wallet.confirmAmount.first()).toBeVisible();
    await expect(wallet.confirmTotalAmount.first()).toBeVisible();
    await expect(wallet.confirmBalance.first()).toBeVisible();

    // Check correct amounts
    await wallet.checkAmountsSendingBTC(selfBTCTest, BTCTest, amountBTCSend);

    await wallet.confirmSendTransaction();
    await wallet.checkVisualsStartpage();

    // Check BTC Balance after the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initialBTCBalance).toEqual(balanceAfterCancel);
  });

  // TODO: add test where we change the fees for a BTC transaction
});
