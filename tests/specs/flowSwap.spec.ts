import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Swapping Coins', () => {
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

  test('Visual check swap page', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSSwapPage();
  });
  test('Check error message for insufficient fund', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSSwapPage();

    // Select the first Coin
    await wallet.buttonDownArrow.nth(0).click();

    // Had problemns with loading of all tokens so I check that 'Bitcoin' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('Bitcoin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken.first()).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeDisabled();

    // Select the second Coin
    await wallet.buttonDownArrow.nth(1).click();
    // Had problemns with loading of all tokens so I check that a 'DOG' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('DOG').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(wallet.imageToken.last()).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeDisabled();

    await wallet.inputSwapAmount.first().fill(Math.floor(100 + Math.random() * 900).toString());

    const coinAmount = await wallet.inputSwapAmount.inputValue();
    const numericValue = parseFloat(coinAmount);
    await expect(numericValue).toBeGreaterThan(0);
    const usdAmount = await wallet.textUSD.innerText();
    const numericUSDValue = parseFloat(usdAmount.replace(/[^0-9.]/g, ''));
    await expect(numericUSDValue).toBeGreaterThan(0);

    await expect(wallet.swapTokenBalance).toContainText('0');

    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeDisabled();
  });

  test('Cancel exchange token via DotSwap', async ({ page, extensionId }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // Save initial Balance for later Balance checks
    const initalBTCBalance = await wallet.getTokenBalance('Bitcoin');

    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSSwapPage();

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

    const swapBalance = await wallet.swapTokenBalance.innerText();
    const numericswapBalance = parseFloat(swapBalance.replace(/[^0-9.]/g, ''));
    const swapAmount = numericswapBalance * 0.8;
    // .Fill() did not work with the field so we need to use this method
    await wallet.inputSwapAmount.pressSequentially('0.00000546'); // swapAmount.toString());
    await expect(wallet.buttonGetQuotes).toBeEnabled();

    const usdAmount = await wallet.textUSD.innerText();
    const numericUSDValue = parseFloat(usdAmount.replace(/[^0-9.]/g, ''));
    await expect(numericUSDValue).toBeGreaterThan(0);

    await wallet.buttonGetQuotes.click();
    await expect(wallet.nameSwapPlace.first()).toBeVisible();
    await expect(wallet.quoteAmount.first()).toBeVisible();
    await expect(wallet.infoMessage.first()).toBeVisible();
    await expect(wallet.buttonSwapPlace.first()).toBeVisible();

    const quoteAmount = await wallet.quoteAmount.first().innerText();
    const numericQuoteValue = parseFloat(quoteAmount.replace(/[^0-9.]/g, ''));
    await expect(numericQuoteValue).toBeGreaterThan(0);

    await wallet.buttonExchangeDotSwap.last().click();
    await expect(wallet.buttonSwap).toBeVisible();
    await expect(wallet.buttonSlippage).toBeVisible();
    // Onlyy 2 token should be visible
    await expect(await wallet.buttonSwapPlace.count()).toBe(2);
    await expect(await wallet.imageToken.count()).toBe(2);

    await wallet.buttonSwap.click();
    await wallet.buttonSwap.click();
    await wallet.buttonSwap.click();
    await wallet.checkVisualsSendTransactionReview('swap');
    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // Check Startpage
    await wallet.checkVisualsStartpage();

    // Check BTC Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Bitcoin');
    await expect(initalBTCBalance).toEqual(balanceAfterCancel);
  });

  test.skip('Use arrow button to switch token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.allupperButtons.nth(2).click();
    await expect(page.url()).toContain('swap');
    await expect(wallet.buttonDownArrow).toBeVisible();
    await wallet.buttonSelectCoin.nth(0).click();
    // Had problemns with loading of all tokens so I check that a 'Coin' is loaded (could have also chosen bitcoint or something other than Stacks as that one always appeared)
    await expect(wallet.labelTokenSubtitle.getByText('Coin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(1);
    await wallet.divTokenRow.nth(2).click();
    await expect(wallet.buttonDetails).toBeVisible();
    await wallet.buttonSelectCoin.nth(1).click();
    await expect(wallet.labelTokenSubtitle.getByText('Coin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(1);
    await wallet.divTokenRow.nth(4).click();
    await expect(wallet.buttonDetails).toBeVisible();
    await wallet.inputSwapAmount.first().fill(Math.floor(100 + Math.random() * 900).toString());

    const tokenName1 = await wallet.nameToken.first().innerText();
    const tokenName2 = await wallet.nameToken.last().innerText();
    // Switch the tokens
    await wallet.buttonDownArrow.click();
    await expect(wallet.nameToken.first()).toContainText(tokenName2);
    await expect(wallet.nameToken.last()).toContainText(tokenName1);
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    const coinAmount1 = await wallet.inputSwapAmount.nth(0).inputValue();
    const numericValue1 = parseFloat(coinAmount1);
    await expect(numericValue1).toBeGreaterThan(0);
  });
});
