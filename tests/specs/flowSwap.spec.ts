import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

// TODO: adjust the test suite to relay on featureEnabled flag to be executed as only than the swap button is visible
test.describe('Swapping Coins', () => {
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
    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSSwapPage();
    await wallet.buttonDownArrow.nth(0).click();

    // Had problemns with loading of all tokens so I check that a 'Coin' is loaded (could have also chosen bitcoint or something other than Stacks as that one always appeared)
    await expect(wallet.labelTokenSubtitle.getByText('BTC').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken).toBeVisible();
    await expect(wallet.buttonGetQuotes).toBeDisabled();
    await wallet.buttonSelectCoin.nth(1).click();
    await expect(wallet.labelTokenSubtitle.getByText('Coin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(1);
    await wallet.divTokenRow.nth(1).click();
    await expect(wallet.buttonDetails).toBeVisible();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(await wallet.imageToken).toHaveCount(2);
    await expect(wallet.buttonContinue).toBeDisabled();
    await wallet.inputSwapAmount.first().fill(Math.floor(100 + Math.random() * 900).toString());
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeDisabled();
    const coinAmount = await wallet.inputSwapAmount.nth(1).inputValue();
    const numericValue = parseFloat(coinAmount);
    await expect(numericValue).toBeGreaterThan(0);
    await expect(wallet.swapTokenBalance.first()).toContainText('0');
    await expect(wallet.swapTokenBalance.last()).toContainText('0');

    // Check that the first USD text is greater than 0
    const usdText = await wallet.textUSD.first().innerText();
    const usdValue = parseFloat(usdText.replace(/[^\d.-]/g, ''));
    await expect(usdValue).toBeGreaterThan(0);

    await wallet.inputSwapAmount.first().clear();
    await expect(wallet.buttonInsufficientBalance).toBeHidden();
    await expect(wallet.buttonContinue).toBeVisible();
    await expect(wallet.buttonContinue).toBeDisabled();
  });
  test('Use arrow button to switch token', async ({ page, extensionId }) => {
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
