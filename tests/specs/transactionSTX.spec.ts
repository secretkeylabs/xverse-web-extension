import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const STXMain = 'SPN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5M1Q812S';
const STXTest = `STN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5QEDCQAN`;

const amountSTXSend = 10;
test.describe('Transaction STX', () => {
  test('Send STX Page Visual Check with insufficient funds Mainnet', async ({
    page,
    extensionId,
  }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own STX Address
    const selfSTXMain = await wallet.getAddress('Stacks');

    await wallet.checkVisualsStartpage();

    // Click on send button
    await wallet.buttonTransactionSend.click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    // Send STX
    await wallet.clickOnSpecificToken('Stacks');
    await wallet.checkVisualsSendPage1('send-stx', true);

    // Invalid Address check
    await wallet.inputField.first().fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Recipient address send self check
    await wallet.inputField.first().fill(selfSTXMain);
    await expect(wallet.errorMessageSendSelf).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Clear input field
    await wallet.buttonRemoveRecipient.click();

    // Fill in correct Receiver Address
    await wallet.inputField.first().fill(STXMain);
    await wallet.buttonNext.click();
    // No funds on mainnet in this wallet -->Page opens and Next button is hidden and info message is shown

    // Amount input is visible
    await expect(page.getByRole('textbox', { name: '0' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '0' })).toBeEnabled();
    await expect(wallet.labelBalanceAmountSelector).toBeVisible();
    await expect(wallet.imageToken).toBeVisible();
    await page.getByRole('textbox', { name: '0' }).fill('200000000');
    await expect(page.getByRole('button', { name: /insufficient funds/i })).toBeVisible();
  });

  // TODO: fix this test, added fixme as it's failing in
  test.fixme('Send STX - Cancel transaction mainnet', async ({ page, extensionId }) => {
    // Restore wallet and setup Mainnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    await page.getByText('STX').click();
    await page.getByRole('button', { name: /send/i }).click();
    await page.getByRole('textbox', { name: /STX Address or .btc domain/i }).fill('zhfr.btc');
    await expect(page.getByText(/associated address/i)).toBeVisible();
    await expect(page.getByText(/SP2VCZJDTT5TJ7A3QPPJPTEF7A9CD8FRG2BEEJF3D/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).toBeEnabled();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('textbox', { name: /0/i }).last().fill('1');

    // edit fee component set to custom
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /custom/i }).click();
    await page.getByRole('textbox', { name: /0/i }).last().fill('0.0974');
    await page.getByRole('button', { name: /apply/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // review transaction screen and clicking cancel btn
    await expect(page.getByText(/review transaction/i)).toBeVisible();
    await expect(page.getByText(/you will send/i)).toBeVisible();
    await expect(page.getByText(/SP2VCZ...EEJF3D/i)).toBeVisible();
    await expect(page.getByText(/Mainnet/i)).toBeVisible();
    await expect(page.getByText(/0.0974 STX/i)).toBeVisible();
    await expect(page.getByText(/1 STX/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();

    // arriving to homepage
    await page.url().includes('/options.html');
  });

  test('Send STX - confirm transaction testnet #localexecution', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // Save initial Balance for later Balance checks
    const initialSTXBalance = await wallet.getTokenBalance('Stacks');

    // Click on send button
    await wallet.buttonTransactionSend.click();

    // Needed to add this to avoid loading issues with the token list to be displayed
    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Stacks');

    // Check visuals of sending page
    await wallet.checkVisualsSendPage1('send-stx', true);

    // Fill in Receiver Address
    await wallet.inputField.first().fill(STXTest);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Send Amount
    await wallet.checkVisualsSendPage2('', true);
    await wallet.inputField.first().fill(amountSTXSend.toString());
    await expect(wallet.buttonNext).toBeEnabled();

    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initialSTXBalance).toEqual(displayBalanceNumerical);

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
});
