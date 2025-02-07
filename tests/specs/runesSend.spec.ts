import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const price = Math.floor(Math.random() * (50 - 1 + 1)) + 1;
const runeName = 'MINT•CAT•FOR•MAINNET•AIRDROP';

const TEST_ORDINALS_ADDRESS = 'tb1p9c9qw2grtpufq6603rua4tejjnynrhpq4fjjl9mxekz77jllqslqee9t9r';

test.describe('Send runes', () => {
  // TODO: fix this test, added fixme as it's failing in CI
  test.fixme(
    'Send Runes Page Visual Check without funds Mainnet',
    async ({ page, extensionId }) => {
      const wallet = new Wallet(page);
      await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

      // get own Ordinals Address for address check on review page
      const addressOrdinals = await wallet.getAddress('Ordinals');

      // Check if Rune is enabled and if not enable the rune and click on it
      await wallet.checkAndClickOnSpecificRune('SKIBIDI•OHIO•RIZZ');

      const originalBalanceAmount = await wallet.checkVisualsRunesDashboard('SKIBIDI•OHIO•RIZZ');

      await wallet.buttonSend.click();

      await wallet.checkVisualsSendPage1('send-rune');

      await wallet.receiveAddress.fill(addressOrdinals);
      // Check Info message
      await expect(wallet.infoMessageSendSelf).toBeVisible();
      await expect(wallet.buttonNext).toBeEnabled();
      await wallet.buttonNext.click();

      await wallet.checkVisualsSendPage2('send-rune');
      const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
      const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
      await expect(originalBalanceAmount).toEqual(displayBalanceNumerical);

      const maxAmount = displayBalanceNumerical + 100;

      await wallet.inputSendAmount.fill(maxAmount.toString());
      await expect(wallet.buttonInsufficientFunds).toBeVisible();
      await expect(wallet.buttonInsufficientFunds).toBeDisabled();
    },
  );

  test('Cancel - send one rune testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC  & Ordinals Address for address check on review page
    const selfBTC = await wallet.getAddress('Bitcoin');
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    const originalBalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);

    await wallet.buttonSend.click();

    await wallet.checkVisualsSendPage1('send-rune');

    // Address invalid check
    await wallet.invalidAddressCheck(wallet.receiveAddress);

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    await wallet.checkVisualsSendPage2('send-rune');
    await page.getByRole('textbox', { name: '0' }).fill(price.toString());
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: /custom/i }).click();
    await page.getByRole('dialog').getByPlaceholder('0').fill('3');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(originalBalanceAmount).toEqual(displayBalanceNumerical);

    await page.getByRole('button', { name: 'Next' }).click();

    await wallet.checkVisualsSendTransactionReview(
      'send-rune',
      true,
      addressOrdinals,
      TEST_ORDINALS_ADDRESS,
    );

    await expect(await wallet.sendAddress.last().innerText()).toContain(selfBTC.slice(-4));

    const sendRuneAmount = await wallet.sendRuneAmount.innerText();
    const sendAmountNumerical = parseFloat(sendRuneAmount.replace(/[^0-9.]/g, ''));
    await expect(price).toEqual(sendAmountNumerical);

    // TODO: this function doesn't work for the rune fee change on the review transaction page as the changed fee is too slow for the E2E
    // Can be enabled after this Issue is fixed: https://linear.app/xverseapp/issue/ENG-4898/change-fee-prio-on-transaction-review-ui-is-not-catching-up-for-brc20
    // await wallet.switchToHighFees();

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    await wallet.checkAndClickOnSpecificRune(runeName);
    const BalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);
    await expect(originalBalanceAmount).toEqual(BalanceAmount);
  });

  test('Send one rune testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC  & Ordinals Address for address check on review page
    const selfBTC = await wallet.getAddress('Bitcoin');
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    const originalBalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);

    await wallet.buttonSend.click();

    await wallet.checkVisualsSendPage1('send-rune');

    // Address invalid check
    await wallet.invalidAddressCheck(wallet.receiveAddress);

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await page.getByRole('button', { name: 'Next' }).click();

    await wallet.checkVisualsSendPage2('send-rune');
    await page.getByRole('textbox', { name: '0' }).fill('3');

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: /custom/i }).click();
    await page.getByRole('dialog').getByPlaceholder('0').fill('3');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();

    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(originalBalanceAmount).toEqual(displayBalanceNumerical);
    await page.getByRole('button', { name: 'Next' }).click();

    await wallet.checkVisualsSendTransactionReview(
      'send-rune',
      true,
      addressOrdinals,
      TEST_ORDINALS_ADDRESS,
    );

    await expect(await wallet.sendAddress.last().innerText()).toContain(selfBTC.slice(-4));

    const sendRuneAmount = await wallet.sendRuneAmount.innerText();
    const sendAmountNumerical = parseFloat(sendRuneAmount.replace(/[^0-9.]/g, ''));
    await expect(price).toEqual(sendAmountNumerical);

    // Confirm the transaction
    await wallet.confirmSendTransaction();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    await wallet.checkAndClickOnSpecificRune(runeName);
    const BalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);
    await expect(originalBalanceAmount).toEqual(BalanceAmount);
  });
});
