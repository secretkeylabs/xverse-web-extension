import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

// TODO: adjust the test suite to relay on featureEnabled flag to be executed as only than the swap button is visible
test.describe.skip('Swapping Coins', () => {
  test('Visual check swap page', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.allupperButtons.nth(2).click();
    await expect(page.url()).toContain('swap');
    await expect(wallet.buttonDownArrow).toBeVisible();
    await expect(await wallet.inputCoinAmount).toHaveCount(2);
    await expect(await wallet.buttonSelectCoin).toHaveCount(2);
    await expect(wallet.buttonDetails).toBeVisible();
    await expect(wallet.buttonContinue).toBeVisible();
    await expect(wallet.buttonContinue).toBeDisabled();
    await expect(wallet.swapTokenBalance.first()).toContainText('--');
    await expect(wallet.swapTokenBalance.last()).toContainText('--');
    await expect(wallet.textUSD.first()).toBeEmpty();
    await expect(wallet.textUSD.last()).toBeEmpty();
  });
  test('Check error message for insufficient fund', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.allupperButtons.nth(2).click();
    await expect(page.url()).toContain('swap');
    await expect(wallet.coinText.first()).toContainText('Select asset');
    await expect(wallet.imageToken).toBeHidden();
    await wallet.buttonSelectCoin.nth(0).click();
    // Had problemns with loading of all tokens so I check that a 'Coin' is loaded (could have also chosen bitcoint or something other than Stacks as that one always appeared)
    await expect(wallet.labelTokenSubtitle.getByText('Coin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(1);
    await wallet.divTokenRow.last().click();
    await expect(wallet.buttonDetails).toBeVisible();
    await expect(wallet.coinText.first()).not.toContainText('Select asset');
    await expect(wallet.imageToken).toBeVisible();
    await expect(wallet.buttonContinue).toBeDisabled();
    await wallet.buttonSelectCoin.nth(1).click();
    await expect(wallet.labelTokenSubtitle.getByText('Coin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(1);
    await wallet.divTokenRow.nth(1).click();
    await expect(wallet.buttonDetails).toBeVisible();
    await expect(wallet.coinText.last()).not.toContainText('Select asset');
    await expect(await wallet.imageToken).toHaveCount(2);
    await expect(wallet.buttonContinue).toBeDisabled();
    await wallet.inputCoinAmount.first().fill(Math.floor(100 + Math.random() * 900).toString());
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    await expect(wallet.buttonInsufficientBalance).toBeDisabled();
    const coinAmount = await wallet.inputCoinAmount.nth(1).inputValue();
    const numericValue = parseFloat(coinAmount);
    await expect(numericValue).toBeGreaterThan(0);
    await expect(wallet.swapTokenBalance.first()).toContainText('0');
    await expect(wallet.swapTokenBalance.last()).toContainText('0');

    // Check that the first USD text is greater than 0
    const usdText = await wallet.textUSD.first().innerText();
    const usdValue = parseFloat(usdText.replace(/[^\d.-]/g, ''));
    await expect(usdValue).toBeGreaterThan(0);

    await wallet.inputCoinAmount.first().clear();
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
    await wallet.inputCoinAmount.first().fill(Math.floor(100 + Math.random() * 900).toString());

    const tokenName1 = await wallet.coinText.first().innerText();
    const tokenName2 = await wallet.coinText.last().innerText();
    // Switch the tokens
    await wallet.buttonDownArrow.click();
    await expect(wallet.coinText.first()).toContainText(tokenName2);
    await expect(wallet.coinText.last()).toContainText(tokenName1);
    await expect(wallet.buttonInsufficientBalance).toBeVisible();
    const coinAmount1 = await wallet.inputCoinAmount.nth(0).inputValue();
    const numericValue1 = parseFloat(coinAmount1);
    await expect(numericValue1).toBeGreaterThan(0);
  });
});
