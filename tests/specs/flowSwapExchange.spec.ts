import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

test.describe('Swap Flow Exchange', () => {
  // Enables the feature flag for Swap
  test.beforeEach(async ({ page }) => {
    await page.route('https://api-3.xverse.app/v1/app-features', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          CROSS_CHAIN_SWAPS: { enabled: true },
        }),
      });
    });
  });

  test('Cancel exchange token via DotSwap', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own BTC  & Ordinals Address for address check on review page
    await wallet.allupperButtons.nth(1).click();
    const selfBTC = await wallet.getAddress(wallet.buttonCopyBitcoinAddress);

    // Reload the page to close the modal window for the addresses as the X button needs to have a better locator
    await page.reload();

    await wallet.checkVisualsStartpage();

    // Save initial Balance for later Balance checks
    const initalBTCBalance = await wallet.getTokenBalance('Bitcoin');

    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSwapPage();

    // Select the first Coin
    await wallet.buttonDownArrow.nth(0).click();

    // Had problemns with loading of all tokens so I check that 'Bitcoin' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('Bitcoin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken.first()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    // Select the second Coin
    await wallet.buttonDownArrow.nth(1).click();
    // Had problemns with loading of all tokens so I check that a 'DOG' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('DOG').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(wallet.imageToken.last()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    const swapAmount = 0.00000546;
    // .Fill() did not work with the field so we need to use this method
    await wallet.inputSwapAmount.pressSequentially(swapAmount.toString());
    await expect(wallet.buttonGetQuotes).toBeEnabled();

    const usdAmount = await wallet.textUSD.innerText();
    const numericUSDValue = parseFloat(usdAmount.replace(/[^0-9.]/g, ''));
    await expect(numericUSDValue).toBeGreaterThan(0);

    // Save rune token name
    const tokenName1 = await wallet.nameToken.last().innerText();

    await wallet.buttonGetQuotes.click();
    await expect(wallet.nameSwapPlace.first()).toBeVisible();
    await expect(wallet.quoteAmount.first()).toBeVisible();
    await expect(wallet.infoMessage.first()).toBeVisible();
    await expect(wallet.buttonSwapPlace.first()).toBeVisible();

    const quoteAmount = await wallet.quoteAmount.first().innerText();
    const numericQuoteValue = parseFloat(quoteAmount.replace(/[^0-9.]/g, ''));
    await expect(numericQuoteValue).toBeGreaterThan(0);

    await wallet.buttonExchangeDotSwap.last().click();

    await wallet.checkVisualsQuotePage(tokenName1, true, numericQuoteValue, numericUSDValue);

    // TODO: change work around as button should be disabled until the feerate is calculted
    await wallet.buttonSwap.click();
    await wallet.buttonSwap.click();
    await wallet.buttonSwap.click();
    await wallet.checkVisualsSendTransactionReview('swap', false, selfBTC);

    // second confirm-balance is the same as swapAmount
    const swapSendAmount = await wallet.confirmBalance.last().innerText();
    const numericValueSwap = parseFloat(swapSendAmount.replace(/[^0-9.]/g, ''));
    await expect(numericValueSwap).toEqual(swapAmount);

    // Check Rune token name
    await expect(wallet.nameRune).toContainText(tokenName1);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check BTC Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initalBTCBalance).toEqual(balanceAfterCancel);
  });
});
