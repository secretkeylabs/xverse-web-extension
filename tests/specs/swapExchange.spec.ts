import { expect, test } from '../fixtures/base';
import { enableCrossChainSwaps } from '../fixtures/helpers';
import Wallet from '../pages/wallet';

test.describe('Swap Flow Exchange', () => {
  // Enables the feature flag for Swap
  test.beforeEach(async ({ page }) => {
    await enableCrossChainSwaps(page);
  });

  const marketplace = 'DotSwap';
  test('Cancel exchange token via DotSwap', async ({ page, extensionId }) => {
    // Restore wallet
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own BTC Address
    const selfBTC = await wallet.getAddress('Bitcoin');

    await wallet.checkVisualsStartpage();

    // Save initial Balance for later Balance checks
    const initialBTCBalance = await wallet.getTokenBalance('Bitcoin');

    await wallet.allUpperButtons.nth(2).click();
    await wallet.checkVisualsSwapPage();

    // Select the first Coin
    await wallet.buttonDownArrow.nth(0).click();

    // Had problems with loading of all tokens so I check that 'Bitcoin' is loaded
    await expect(page.getByText('Bitcoin').first()).toBeVisible();
    expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken.first()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    // Select the second Coin
    await wallet.buttonDownArrow.nth(1).click();
    // Had problems with loading of all tokens so I check that a 'DOG' is loaded
    await expect(page.getByText('DOG').first()).toBeVisible();
    expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(wallet.imageToken.last()).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();

    // tried a calculated value but had multiple problems with that, for now we stick to a specific value
    const swapAmount = 0.00000546;

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
    expect(numericQuoteValue).toBeGreaterThan(0);

    // Click on DotSwap
    await wallet.buttonSwapPlace.filter({ hasText: marketplace }).click();

    await wallet.checkVisualsQuotePage(tokenName1, true, numericQuoteValue, numericUSDValue);

    // We can only continue if the FeeRate is above 0
    await wallet.waitForTextAboveZero(wallet.feeAmount, 30000);

    await wallet.switchToHighFees(false);

    await wallet.buttonSwap.click();
    await wallet.checkVisualsSendTransactionReview('swap', false, selfBTC);

    expect(await wallet.confirmAmount.count()).toBeGreaterThan(3);

    // Check Rune token name
    await expect(wallet.nameRune).toContainText(tokenName1);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check BTC Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    expect(initialBTCBalance).toEqual(balanceAfterCancel);
  });

  // TODO: Update this test to use testnet4 if applicable
  test.fixme(
    'Exchange token via DotSwap with standard fee testnet #localexecution',
    async ({ page, extensionId }) => {
      // Restore wallet
      const wallet = new Wallet(page);
      await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

      // get own BTC Address
      const selfBTC = await wallet.getAddress('Bitcoin');

      await wallet.checkVisualsStartpage();

      await wallet.allUpperButtons.nth(2).click();
      await wallet.checkVisualsSwapPage();

      // Select the first Coin
      await wallet.buttonDownArrow.nth(0).click();

      // Had problems with loading of all tokens so I check that 'Bitcoin' is loaded
      await expect(wallet.labelTokenSubtitle.getByText('Bitcoin').first()).toBeVisible();
      expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
      await wallet.divTokenRow.first().click();
      await expect(wallet.nameToken.first()).not.toContainText('Select asset');
      await expect(wallet.imageToken.first()).toBeVisible();
      await expect(wallet.buttonGetQuotes).toBeDisabled();

      // Select the second Coin
      await wallet.buttonDownArrow.nth(1).click();
      // Had problems with loading of all tokens so I check that a 'DOG' is loaded
      await expect(wallet.labelTokenSubtitle.getByText('DOG').first()).toBeVisible();
      expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
      await wallet.divTokenRow.filter({ hasText: 'COOK•RUNES•ON•TESTNET' }).click();
      await expect(wallet.nameToken.last()).not.toContainText('Select asset');
      await expect(wallet.imageToken.last()).toBeVisible();
      await expect(wallet.buttonGetQuotes).toBeDisabled();

      // tried a calculated value but had multiple problems with that, for now we stick to a specific value
      const swapAmount = 0.00010646;

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
      expect(numericQuoteValue).toBeGreaterThan(0);

      // Click on DotSwap
      await wallet.buttonSwapPlace.filter({ hasText: marketplace }).click();

      await wallet.checkVisualsQuotePage(tokenName1, true, numericQuoteValue, numericUSDValue);

      // We can only continue if the FeeRate is above 0
      await wallet.waitForTextAboveZero(wallet.feeAmount, 30000);

      // Save the current fee amount for comparison
      const originalFee = await wallet.feeAmount.innerText();
      const numericOriginalFee = parseFloat(originalFee.replace(/[^0-9.]/g, ''));
      expect(numericOriginalFee).toBeGreaterThan(0);

      await wallet.buttonSwap.click();
      await wallet.checkVisualsSendTransactionReview('swap', false, selfBTC);

      // Confirm Amount is the same as swapAmount
      const swapSendAmount = await wallet.confirmAmount
        .filter({ hasText: swapAmount.toString() })
        .innerText();
      const numericValueSwap = parseFloat(swapSendAmount.replace(/[^0-9.]/g, ''));
      expect(numericValueSwap).toEqual(swapAmount);

      // Check Rune token name
      await expect(wallet.nameRune).toContainText(tokenName1);

      await wallet.confirmSendTransaction();
      await wallet.checkVisualsStartpage();
    },
  );
});
