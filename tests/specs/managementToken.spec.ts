import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Token Management', () => {
  test('Check token page #smoketest', async ({ page, extensionId }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingPage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await expect(wallet.balance).toHaveText('$0.00');
    await wallet.manageTokenButton.click();
    expect(page.url()).toContain('manage-tokens');
    await expect(wallet.buttonBack).toBeVisible();
    await expect(wallet.buttonStacks).toBeVisible();
    await expect(wallet.buttonBRC20).toBeVisible();
    await expect(wallet.buttonRunes).toBeVisible();
    await expect(wallet.headingTokens).toBeVisible();

    // Check STACKS tokens tab - only STX should be showing when user has no sip10 balances
    await test.step('Check STACKS tokens tab', async () => {
      await wallet.buttonStacks.click();
      await expect(wallet.labelCoinTitle).toHaveCount(1);
      await expect(wallet.checkboxTokenActive).toHaveCount(1);
    });

    // Check BRC20 token tab - nothing shows when user has no brc20 balances
    await wallet.buttonBRC20.click();
    await expect(wallet.labelCoinTitle).toHaveCount(0);
    await expect(wallet.checkboxTokenActive).toHaveCount(0);

    // Check rune token tab - nothing shows when user has no runes balances
    await wallet.buttonRunes.click();
    await expect(wallet.labelCoinTitle).toHaveCount(0);
    await expect(wallet.checkboxTokenActive).toHaveCount(0);
  });

  test('Toggle a BRC-20 token', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    await test.step('Toggle a random token', async () => {
      await wallet.manageTokenButton.click();
      await wallet.buttonBRC20.click();

      // NOTE: requires an account with at least 1 brc20 token with balance
      await expect(wallet.checkboxTokenActive.first()).toBeVisible();

      // disable a random token
      const tokenName = await wallet.toggleRandomToken(false);

      // expect token to be hidden on dashboard
      const fetchTokens = page.waitForResponse((response) =>
        response.url().includes('/brc20/tokens'),
      );
      await wallet.buttonBack.click();
      await fetchTokens;
      await expect(page.getByText(tokenName).first()).toBeHidden();

      // enable the token again
      await wallet.manageTokenButton.click();
      await wallet.buttonBRC20.click();
      await page.getByTestId(tokenName).locator('label').click();

      // expect to be visible again on dashboard
      const fetchTokensAgain = page.waitForResponse((response) =>
        response.url().includes('/brc20/tokens'),
      );
      await wallet.buttonBack.click();
      await fetchTokensAgain;
      await expect(page.getByText(tokenName).first()).toBeVisible();
    });
  });

  test('Toggle a SIP-10 token', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    await test.step('Toggle a random token', async () => {
      await wallet.manageTokenButton.click();
      await wallet.buttonStacks.click();

      // NOTE: requires an account with at least 1 sip10 token with balance
      await expect(wallet.checkboxTokenActive.first()).toBeVisible();

      // disable a random token
      const tokenName = await wallet.toggleRandomToken(false);

      // expect token to be hidden on dashboard
      const fetchTokens = page.waitForResponse((response) =>
        response.url().includes('/sip10/tokens'),
      );
      await wallet.buttonBack.click();
      await fetchTokens;
      await expect(page.getByText(tokenName).first()).toBeHidden();

      // enable the token again
      await wallet.manageTokenButton.click();
      await wallet.buttonStacks.click();
      await page.getByTestId(tokenName).locator('label').click();

      // expect to be visible again on dashboard
      const fetchTokensAgain = page.waitForResponse((response) =>
        response.url().includes('/sip10/tokens'),
      );
      await wallet.buttonBack.click();
      await fetchTokensAgain;
      await expect(page.getByText(tokenName).first()).toBeVisible();
    });
  });

  test('Toggle a Runes token', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    await test.step('Toggle a random token', async () => {
      await wallet.manageTokenButton.click();
      await wallet.buttonRunes.click();

      // NOTE: requires an account with at least 1 runes token with balance
      await expect(wallet.checkboxTokenActive.first()).toBeVisible();

      // disable a random token
      const tokenName = await wallet.toggleRandomToken(false);

      // expect token to be hidden on dashboard
      const fetchTokens = page.waitForResponse((response) =>
        response.url().includes('/runes/fiat-rates'),
      );
      await wallet.buttonBack.click();
      await fetchTokens;
      await expect(page.getByText(tokenName).first()).toBeHidden();

      // enable the token again
      await wallet.manageTokenButton.click();
      await wallet.buttonRunes.click();
      await page.getByTestId(tokenName).locator('label').click();

      // expect to be visible again on dashboard
      const fetchTokensAgain = page.waitForResponse((response) =>
        response.url().includes('/runes/fiat-rates'),
      );
      await wallet.buttonBack.click();
      await fetchTokensAgain;
      await expect(page.getByText(tokenName).first()).toBeVisible();
    });
  });
});
