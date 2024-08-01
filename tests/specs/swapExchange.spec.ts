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

  const marketplace = 'DotSwap';

  test('Exchange token via DotSwap with standard fee testnet', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own BTC  & Ordinals Address for address check on review page
    await wallet.allUpperButtons.nth(1).click();
    const selfBTC = await wallet.getAddress(wallet.buttonCopyBitcoinAddress);

    // Reload the page to close the modal window for the addresses as the X button needs to have a better locator
    await page.reload();

    await wallet.checkVisualsStartpage();

    await wallet.allUpperButtons.nth(2).click();
    await wallet.checkVisualsSwapPage();

    // Select the first Coin
    await wallet.buttonDownArrow.nth(0).click();

    // Had problems with loading of all tokens so I check that 'Bitcoin' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('Bitcoin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken.first()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    // Select the second Coin
    await wallet.buttonDownArrow.nth(1).click();
    // Had problems with loading of all tokens so I check that a 'DOG' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('DOG').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.filter({ hasText: 'COOK•RUNES•ON•TESTNET' }).click();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(wallet.imageToken.last()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    // tried a calculated value but had multiple problems with that, for now we stick to a specific value
    const swapAmount = 0.00002646;

    const numericUSDValue = await wallet.fillSwapAmount(swapAmount);

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

    // Click on DotSwap
    await wallet.buttonSwapPlace.filter({ hasText: marketplace }).click();

    await wallet.checkVisualsQuotePage(tokenName1, true, numericQuoteValue, numericUSDValue);

    // We can only continue if the FeeRate is above 0
    await wallet.waitForTextAboveZero(wallet.feeAmount, 30000);

    // Save the current fee amount for comparison
    const originalFee = await wallet.feeAmount.innerText();
    const numericOriginalFee = parseFloat(originalFee.replace(/[^0-9.]/g, ''));
    await expect(numericOriginalFee).toBeGreaterThan(0);

    await wallet.buttonSwap.click();
    await wallet.checkVisualsSendTransactionReview('swap', false, selfBTC);

    // Confirm Amount is the same as swapAmount
    const swapSendAmount = await wallet.confirmAmount
      .filter({ hasText: swapAmount.toString() })
      .innerText();
    const numericValueSwap = parseFloat(swapSendAmount.replace(/[^0-9.]/g, ''));
    await expect(numericValueSwap).toEqual(swapAmount);

    // Check Rune token name
    await expect(wallet.nameRune).toContainText(tokenName1);

    await wallet.confirmSendTransaction();
    await wallet.checkVisualsStartpage('testnet');
  });
});
