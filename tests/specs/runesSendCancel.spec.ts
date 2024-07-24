import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const price1 = Math.floor(Math.random() * (50 - 1 + 1)) + 1;
const runeName = 'MINT•CAT•FOR•MAINNET•AIRDROP';

const TEST_ORDINALS_ADDRESS = 'tb1p9c9qw2grtpufq6603rua4tejjnynrhpq4fjjl9mxekz77jllqslqee9t9r';

test.describe('Send runes', () => {
  test('Cancel - send one rune testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC  & Ordinals Address for address check on review page
    await wallet.allupperButtons.nth(1).click();
    const selfBTC = await wallet.getAddress(wallet.buttonCopyBitcoinAddress);
    const addressOrdinals = await wallet.getAddress(wallet.buttonCopyOrdinalsAddress);

    // Reload the page to close the modal window for the addresses as the X button needs to have a better locator
    await page.reload();

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    const originalBalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);

    await wallet.buttonSend.click();

    await wallet.checkVisualsSendPage1('send-rune');

    // Address invalid check
    await wallet.invalidAdressCheck(wallet.receiveAddress);

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    await wallet.checkVisualsSendPage2('send-rune');
    await wallet.inputSendAmount.fill(price1.toString());
    await expect(wallet.buttonNext).toBeEnabled();

    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(originalBalanceAmount).toEqual(displayBalanceNumerical);
    await wallet.buttonNext.click();

    await wallet.checkVisualsSendTransactionReview(
      'send-rune',
      true,
      addressOrdinals,
      TEST_ORDINALS_ADDRESS,
    );

    await expect(await wallet.sendAddress.last().innerText()).toContain(selfBTC.slice(-4));

    const sendRuneAmount = await wallet.sendRuneAmount.innerText();
    const sendAmountNumerical = parseFloat(sendRuneAmount.replace(/[^0-9.]/g, ''));
    await expect(price1).toEqual(sendAmountNumerical);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage('testnet');

    await wallet.checkAndClickOnSpecificRune(runeName);
    const BalanceAmount = await wallet.checkVisualsRunesDashboard(runeName);
    await expect(originalBalanceAmount).toEqual(BalanceAmount);
  });
});
