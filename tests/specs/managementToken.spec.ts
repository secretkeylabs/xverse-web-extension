import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Token Management', () => {
  test.beforeEach(async ({ page, extensionId, context }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    // TODO: this fixes a temporary issue with two tabs at the start see technical debt https://linear.app/xverseapp/issue/ENG-3992/two-tabs-open-instead-of-one-since-version-0323-for-start-extension
    const pages = await context.pages();
    if (pages.length === 2) {
      await pages[1].close(); // pages[1] is the second (newest) page
    }
  });
  test.afterEach(async ({ context }) => {
    if (context.pages().length > 0) {
      // Close the context only if there are open pages
      await context.close();
    }
  });

  test('Check token page #smoketest', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await expect(wallet.balance).toHaveText('$0.00');
    await wallet.manageTokenButton.click();
    await expect(page.url()).toContain('manage-tokens');
    await expect(wallet.buttonBack).toBeVisible();
    await expect(wallet.buttonSip10).toBeVisible();
    await expect(wallet.buttonBRC20).toBeVisible();
    await expect(wallet.buttonRunes).toBeVisible();
    await expect(wallet.headingTokens).toBeVisible();

    // Check SIP10 token
    await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
    const amounttokenSIP = await wallet.labelCoinTitle.count();

    await await expect(amounttokenSIP).toBeGreaterThanOrEqual(15);
    await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenSIP - 1);
    await expect(wallet.checkboxTokenActive).toHaveCount(1);
    await expect(wallet.checkboxToken).toHaveCount(amounttokenSIP);

    // Check BRC20 token
    await wallet.buttonBRC20.click();
    await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
    const amounttokenBRC20 = await wallet.labelCoinTitle.count();
    await expect(amounttokenBRC20).toBeGreaterThanOrEqual(8);
    await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenBRC20);
    await expect(wallet.checkboxTokenActive).toHaveCount(0);
    await expect(wallet.checkboxToken).toHaveCount(amounttokenBRC20);

    // Check rune token
    await wallet.buttonRunes.click();
    await expect(wallet.labelCoinTitle).toHaveCount(0);
    await expect(wallet.checkboxTokenInactive).toHaveCount(0);
    await expect(wallet.checkboxTokenActive).toHaveCount(0);
    await expect(wallet.checkboxToken).toHaveCount(0);
  });

  test('Enable and disable some BRC-20 token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);

    await test.step('Enable a random token', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await await expect(wallet.balance).toHaveText('$0.00');
      let balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await wallet.buttonBRC20.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenBRC20 = await wallet.labelCoinTitle.count();
      // Enable random token
      const tokenName = await wallet.enableARandomToken();
      // Check that amount of checkboxes changed
      await expect(wallet.checkboxTokenActive).toHaveCount(1);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenBRC20 - 1);
      await wallet.buttonBack.click();
      // new enabled token should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeVisible();
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });

    await test.step('Enable some more token', async () => {
      await wallet.manageTokenButton.click();
      await wallet.buttonBRC20.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenBRC20 = await wallet.labelCoinTitle.count();
      const tokenName1 = await wallet.enableARandomToken();
      const tokenName2 = await wallet.enableARandomToken();
      const tokenName3 = await wallet.enableARandomToken();
      await expect(wallet.checkboxTokenActive).toHaveCount(4);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenBRC20 - 4);
      await wallet.buttonBack.click();
      // new enabled tokens should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName1, { exact: true })).toBeVisible();
      await expect(wallet.labelTokenSubtitle.getByText(tokenName2, { exact: true })).toBeVisible();
      await expect(wallet.labelTokenSubtitle.getByText(tokenName3, { exact: true })).toBeVisible();
    });

    await test.step('Disable a random token', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await wallet.buttonBRC20.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenBRC20 = await wallet.labelCoinTitle.count();
      const tokenName = await wallet.disableARandomToken();
      await expect(wallet.checkboxTokenActive).toHaveCount(3);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenBRC20 - 3);
      await wallet.buttonBack.click();
      // new enabled token should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeHidden();
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      const balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });
  });

  test('Enable and disable some SIP-10 token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);

    await test.step('Enable a random token', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      let balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenSIP = await wallet.labelCoinTitle.count();
      // Enable random token
      const tokenName = await wallet.enableARandomToken();
      // Check that amount of checkboxes changed
      await expect(wallet.checkboxTokenActive).toHaveCount(2);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenSIP - 2);
      await wallet.buttonBack.click();
      // new enabled token should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeVisible();
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });

    await test.step('Enable some more token', async () => {
      await wallet.manageTokenButton.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenSIP = await wallet.labelCoinTitle.count();
      const tokenName1 = await wallet.enableARandomToken();
      const tokenName2 = await wallet.enableARandomToken();
      const tokenName3 = await wallet.enableARandomToken();
      await expect(wallet.checkboxTokenActive).toHaveCount(5);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenSIP - 5);
      await wallet.buttonBack.click();
      // new enabled tokens should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName1, { exact: true })).toBeVisible();
      await expect(wallet.labelTokenSubtitle.getByText(tokenName2, { exact: true })).toBeVisible();
      await expect(wallet.labelTokenSubtitle.getByText(tokenName3, { exact: true })).toBeVisible();
    });

    await test.step('Disable a random token', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenSIP = await wallet.labelCoinTitle.count();
      const tokenName = await wallet.disableARandomToken();
      await expect(wallet.checkboxTokenActive).toHaveCount(4);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenSIP - 4);
      await wallet.buttonBack.click();
      // new enabled token should be visibal on dashboard
      await expect(wallet.labelTokenSubtitle.getByText(tokenName, { exact: true })).toBeHidden();
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      const balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });
  });

  test('Enable and disable all SIP-10 token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);

    await test.step('Enable a all tokens', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      let balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
      await expect(wallet.labelTokenSubtitle).toHaveCount(2);
      await wallet.manageTokenButton.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenSIP = await wallet.labelCoinTitle.count();
      await expect(page.url()).toContain('manage-tokens');
      await expect(wallet.checkboxToken).toHaveCount(amounttokenSIP);
      await wallet.enableAllTokens();
      await expect(wallet.checkboxTokenActive).toHaveCount(amounttokenSIP);
      await expect(wallet.checkboxTokenInactive).toHaveCount(0);
      await wallet.buttonBack.click();
      await expect(wallet.labelTokenSubtitle).toHaveCount(amounttokenSIP + 1);
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });

    await test.step('Disable all tokens', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await wallet.disableAllTokens();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenSIP = await wallet.labelCoinTitle.count();
      await expect(wallet.checkboxTokenActive).toHaveCount(0);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenSIP);
      await wallet.buttonBack.click();
      await expect(wallet.labelTokenSubtitle).toHaveCount(1);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      const balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });
  });
  test('Enable and disable all BRC-20 token', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await onboardingpage.createWalletSkipBackup(strongPW);

    await test.step('Enable a all tokens', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      let balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
      await expect(wallet.labelTokenSubtitle).toHaveCount(2);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await wallet.buttonBRC20.click();
      await expect(wallet.checkboxTokenInactive.first()).toBeVisible();
      const amounttokenBRC20 = await wallet.labelCoinTitle.count();
      await expect(wallet.checkboxToken).toHaveCount(amounttokenBRC20);
      await wallet.enableAllTokens();
      await expect(wallet.checkboxTokenActive).toHaveCount(amounttokenBRC20);
      await expect(wallet.checkboxTokenInactive).toHaveCount(0);
      await wallet.buttonBack.click();
      await expect(wallet.labelTokenSubtitle).toHaveCount(amounttokenBRC20 + 2);
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });

    await test.step('Disable all tokens', async () => {
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      await wallet.manageTokenButton.click();
      await expect(page.url()).toContain('manage-tokens');
      await wallet.buttonBRC20.click();
      await expect(wallet.checkboxTokenActive.first()).toBeVisible();
      const amounttokenBRC20 = await wallet.labelCoinTitle.count();
      await wallet.disableAllTokens();
      await expect(wallet.checkboxTokenActive).toHaveCount(0);
      await expect(wallet.checkboxTokenInactive).toHaveCount(amounttokenBRC20);
      await wallet.buttonBack.click();
      await expect(wallet.labelTokenSubtitle).toHaveCount(2);
      // Check balances
      await expect(wallet.balance).toBeVisible();
      await expect(wallet.balance).toHaveText('$0.00');
      const balanceText = await wallet.getBalanceOfAllTokens();
      await expect(balanceText).toBe(0);
    });
  });
});
