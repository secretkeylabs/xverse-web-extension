import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const STXMain = 'SPN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5M1Q812S';
const STXTest = `STN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5QEDCQAN`;

const amountSTXSend = 10;
test.describe('Transaction STX', () => {
  test('Send STX Page Visual Check without funds Mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own STX Address
    const selfSTXMain = await wallet.getAddress(2);

    await wallet.checkVisualsStartpage();

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    // Send STX
    await wallet.clickOnSpecificToken('Stacks');
    await wallet.checkVisualsSendSTXPage1();

    // Invalid Address check
    await wallet.inputField.first().fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeEnabled();

    // Recipient address send self check
    await wallet.inputField.first().fill(selfSTXMain);
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageSendSelf).toBeVisible();
    await expect(wallet.buttonNext).toBeEnabled();

    // Fill in correct Receiver Address
    await wallet.inputField.first().fill(STXMain);
    await wallet.buttonNext.click();
    // No funds on mainnet in this wallet -->Page opens and Next button is hidden and info message is shown
    await expect(wallet.buttonNext).toBeHidden();
    // Amount input is visible
    await expect(wallet.inputField.first()).toBeVisible();
    await expect(wallet.labelBalanceAmountSelector).toBeVisible();
    await expect(wallet.imageToken).toBeVisible();
    await expect(wallet.inputField.first()).toBeDisabled();
    await expect(wallet.noFundsBTCMessage).toBeVisible();
  });

  test('Send STX - Cancel transaction testnet', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // Save initial Balance for later Balance checks
    const initalSTXBalance = await wallet.getTokenBalance('Stacks');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Stacks');
    await wallet.checkVisualsSendSTXPage1();

    // Fill in Receiver Address
    await wallet.inputField.first().fill(STXTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Send Amound
    await wallet.checkVisualsSendSTXPage2();
    await wallet.inputField.first().fill(amountSTXSend.toString());
    await expect(wallet.buttonNext).toBeEnabled();

    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalSTXBalance).toEqual(displayBalanceNumerical);

    // Save Fees to check on next Page
    const fee = await wallet.feeAmount.innerText();
    const sendFee = parseFloat(fee.replace(/[^0-9.]/g, ''));

    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendSTXPage3();

    // Check correct amounts
    await wallet.checkAmountsSendingSTX(amountSTXSend, STXTest, sendFee);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check startpage
    await wallet.checkVisualsStartpage();

    // Check STX Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Stacks');
    await expect(initalSTXBalance).toEqual(balanceAfterCancel);
  });

  // TODO: need to add Stack funds to the wallet, testnet is currently not avaiable
  test('Send STX - confirm transaction testnet #localexecution', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // Save initial Balance for later Balance checks
    const initalSTXBalance = await wallet.getTokenBalance('Stacks');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    // Needed to add this to avoid loading issues with the token list to be displayed
    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Stacks');

    // Check visuals of sending page
    await wallet.checkVisualsSendSTXPage1();

    // Fill in Receiver Address
    await wallet.inputField.first().fill(STXTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Send Amound
    await wallet.checkVisualsSendSTXPage2();
    await wallet.inputField.first().fill(amountSTXSend.toString());
    await expect(wallet.buttonNext).toBeEnabled();

    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalSTXBalance).toEqual(displayBalanceNumerical);

    // Save Fees to check on next Page
    const fee = await wallet.feeAmount.innerText();
    const sendFee = parseFloat(fee.replace(/[^0-9.]/g, ''));

    await wallet.buttonNext.click();

    // Transaction Review Page

    await wallet.checkVisualsSendSTXPage3();

    // Check correct amounts
    await wallet.checkAmountsSendingSTX(amountSTXSend, STXTest, sendFee);

    // Confirm the transaction
    await wallet.confirmSendTransaction();
    await wallet.checkVisualsStartpage();

    // Can't check amounts or transaction as E2E test is faster than the UI or API to how that transaction --> has to be checked manually
  });

  // TODO: add test where we change the fees for a STX transaction
});
