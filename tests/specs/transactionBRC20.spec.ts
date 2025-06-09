import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const sendAmount = 1;
const tokenName = 'HUHU';

test.describe('Transaction BRC20', () => {
  test('Cancel BRC20 transaction Mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Save initial Balance for later Balance checks
    const initialBRC20Balance = await wallet.getTokenBalance(tokenName);
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.buttonTransactionSend.click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);

    await wallet.clickOnSpecificToken(tokenName);
    await wallet.checkVisualsSendPage1('send-brc20-one-step', true);

    // Invalid Address check
    await wallet.inputField.last().fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();

    // Fill in valid Address
    await wallet.inputField.fill(addressOrdinals);
    await wallet.buttonNext.click();

    // Insufficient BRC20 balance Check
    await wallet.inputField.fill(`1000`);
    await expect(wallet.errorInsufficientBRC20Balance).toBeVisible();

    await expect(page.getByRole('textbox', { name: '0' })).toHaveValue('1000');

    await wallet.inputField.fill(sendAmount.toString());
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.page.url()).toContain('send-brc20-one-step');

    await expect(wallet.receiveAddress).toBeVisible();
    await expect(wallet.page.url()).toContain('confirm-brc20-tx');
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();
    await expect(wallet.feeAmount).toBeVisible();

    // TODO: this function doesn't work for the BRC20 fee change on the review transaction page as the changed fee is too slow for the E2E
    // Can be enabled after this Issue is fixed: https://linear.app/xverseapp/issue/ENG-4898/change-fee-prio-on-transaction-review-ui-is-not-catching-up-for-brc20
    // await wallet.switchToHighFees();

    await expect(await wallet.receiveAddress.first().innerText()).toContain(
      addressOrdinals.slice(-4),
    );

    // Check Fee calculation as in this screens more Fees are shown than the other Review Transaction Pages
    const fee = await wallet.feeAmount.innerText();
    const numericValueFee = parseFloat(fee.replace(/[^0-9.]/g, ''));
    const inscriptionFee = await wallet.BRC20FeeAmount.first().innerText();
    const numericValueInscriptionFee = parseFloat(inscriptionFee.replace(/[^0-9.]/g, ''));
    const totalFee = await wallet.BRC20FeeAmount.last().innerText();
    const numericValueTotalFee = parseFloat(totalFee.replace(/[^0-9.]/g, ''));
    await expect(numericValueTotalFee).toEqual(numericValueFee + numericValueInscriptionFee);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Land on the BRC-20 token page
    await expect(wallet.imageToken).toBeVisible();
    await expect(wallet.buttonBack).toBeVisible();
    await wallet.buttonBack.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check Balance after cancel the transaction
    const balanceBRC20AfterCancel = await wallet.getTokenBalance(tokenName);
    const balanceBTCAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initialBRC20Balance).toEqual(balanceBRC20AfterCancel);
    await expect(initialBTCBalance).toEqual(balanceBTCAfterCancel);
  });

  test('Send BRC20 transaction Mainnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Save initial Balance for later Balance checks
    const initialBRC20Balance = await wallet.getTokenBalance(tokenName);
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    // Click on send button
    await wallet.buttonTransactionSend.click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);

    await wallet.clickOnSpecificToken(tokenName);
    await wallet.checkVisualsSendPage1('send-brc20-one-step', true);

    // Invalid Address check
    await wallet.inputField.last().fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeDisabled();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();

    // Fill in valid Address
    await wallet.inputField.last().fill(addressOrdinals);

    // Insufficient BRC20 balance Check
    await wallet.inputField.first().fill(`1000`);
    await expect(wallet.errorInsufficientBRC20Balance).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    await wallet.inputField.first().fill(sendAmount.toString());
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.waitFor({ state: 'attached' });
    await wallet.buttonNext.click();

    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(wallet.page.url()).toContain('confirm-brc20-tx');
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();
    await expect(wallet.feeAmount).toBeVisible();

    // TODO: this function doesn't work for the BRC20 fee change on the review transaction page as the changed fee is too slow for the E2E
    // Can be enabled after this Issue is fixed: https://linear.app/xverseapp/issue/ENG-4898/change-fee-prio-on-transaction-review-ui-is-not-catching-up-for-brc20
    // await wallet.switchToHighFees();

    await expect(await wallet.receiveAddress.first().innerText()).toContain(
      addressOrdinals.slice(-4),
    );

    // Check Fee calculation as in this screens more Fees are shown than the other Review Transaction Pages
    const fee = await wallet.feeAmount.innerText();
    const numericValueFee = parseFloat(fee.replace(/[^0-9.]/g, ''));
    const inscriptionFee = await wallet.BRC20FeeAmount.first().innerText();
    const numericValueInscriptionFee = parseFloat(inscriptionFee.replace(/[^0-9.]/g, ''));
    const totalFee = await wallet.BRC20FeeAmount.last().innerText();
    const numericValueTotalFee = parseFloat(totalFee.replace(/[^0-9.]/g, ''));
    await expect(numericValueTotalFee).toEqual(numericValueFee + numericValueInscriptionFee);

    await wallet.confirmSendTransaction(false);

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check Balance after cancel the transaction as the transaction most of the time wasn't executed yet --> check Balance manually afterwards
    const balanceBRC20AfterCancel = await wallet.getTokenBalance(tokenName);
    const balanceBTCAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initialBRC20Balance).toEqual(balanceBRC20AfterCancel);
    await expect(initialBTCBalance).toEqual(balanceBTCAfterCancel);
  });
});
