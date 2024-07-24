import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Swap Flow Visuals', () => {
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
    await wallet.checkVisualsSwapPage();
  });
  test('Check error message for insufficient fund', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
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

  test('Use arrow button to switch token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.allupperButtons.nth(2).click();
    await wallet.checkVisualsSwapPage();

    // Select the first Coin
    await wallet.buttonDownArrow.nth(0).click();

    // Had problemns with loading of all tokens so I check that 'Bitcoin' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('Bitcoin').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();

    // Select the second Coin
    await wallet.buttonDownArrow.nth(1).click();
    // Had problemns with loading of all tokens so I check that a 'DOG' is loaded
    await expect(wallet.labelTokenSubtitle.getByText('DOG').first()).toBeVisible();
    await expect(await wallet.divTokenRow.count()).toBeGreaterThan(0);
    await wallet.divTokenRow.first().click();
    await expect(wallet.nameToken.last()).not.toContainText('Select asset');
    await expect(wallet.imageToken.last()).toBeVisible();

    // Save tokennames
    const tokenName1 = await wallet.nameToken.first().innerText();
    const tokenName2 = await wallet.nameToken.last().innerText();

    // Switch Token
    await wallet.buttonSwapToken.click();
    await expect(wallet.nameToken.first()).toContainText(tokenName2);
    await expect(wallet.nameToken.last()).toContainText(tokenName1);

    // Switch Token again
    await wallet.buttonSwapToken.click();
    await expect(wallet.nameToken.first()).toContainText(tokenName1);
    await expect(wallet.nameToken.last()).toContainText(tokenName2);
  });
});
