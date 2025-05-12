import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

test.describe('Transaction', () => {
  // TODO: added fixme as it's failing in for a good reason for some reason
  // the last token is not being selected
  test.fixme(
    'Visual Check SIP 10 Token Transaction history mainnet',
    async ({ page, extensionId }) => {
      const wallet = new Wallet(page);
      await wallet.setupTest(extensionId, 'SEED_WORDS1', false);
      const tokenName = await wallet.selectLastToken('STACKS');

      await wallet.clickOnSpecificToken(tokenName);

      expect(page.url()).toContain('coinDashboard');
      // Check token detail page for token image and coin title
      await expect(wallet.imageToken).toBeVisible();
      await expect(wallet.textCoinTitle).toBeVisible();
      await expect(wallet.textCoinTitle).toContainText(tokenName);

      // Check contract details are displayed
      await wallet.coinSecondaryButton.click();
      await expect(wallet.coinSecondaryButton).toBeVisible();
      await expect(wallet.coinContractAddress).toBeVisible();
      await expect(wallet.coinContractAddress).not.toBeEmpty();
    },
  );

  test('Visual Check BRC 20 Token Transaction history mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);
    const tokenName = await wallet.selectLastToken('BRC20');

    await wallet.clickOnSpecificToken(tokenName);
    expect(page.url()).toContain('coinDashboard');
    // Check token detail page for coin title
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(wallet.textCoinTitle).toContainText(tokenName);
  });
  // added the #localexecution cause the test is flaky due to rate limiting
  test('Visual Check STX Transaction history testnet #localexecution', async ({
    page,
    extensionId,
  }) => {
    // Restore wallet and setup Testnet network
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    await wallet.clickOnSpecificToken('Stacks');
    await expect(page.url()).toContain('STX');
    // Check token detail page for token image and coin title
    await expect(wallet.imageToken).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText('Stacks');
    const balanceText = await wallet.coinBalance.innerText();
    const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    // Balance should be greater than 0 in the testnet wallets
    await expect(numericValue).toBeGreaterThan(0);
    await expect(wallet.containerTransactionHistory.first()).toBeVisible();
    // There should be at least one transaction visible
    await expect(await wallet.containerTransactionHistory.count()).toBeGreaterThanOrEqual(1);
  });

  test('Visual Check BTC Transaction history', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // Click BTC token
    await wallet.divTokenRow.first().click();
    await expect(page.url()).toContain('BTC');
    // Check token detail page for token image and coin title
    await expect(wallet.imageToken).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText('Bitcoin');
    const balanceText = await wallet.coinBalance.innerText();
    const numericValue = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
    // Balance should be greater than 0 in the testnet wallets
    await expect(numericValue).toBeGreaterThan(0);
    await expect(wallet.containerTransactionHistory.first()).toBeVisible();
    // There should be at least one transaction visible
    await expect(await wallet.containerTransactionHistory.count()).toBeGreaterThanOrEqual(1);
  });

  test.fixme('Visual Check Runes Transaction history', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);
    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune('SKIBIDI•OHIO•RIZZ');
    const originalBalanceAmount = await wallet.checkVisualsRunesDashboard('SKIBIDI•OHIO•RIZZ');
    await expect(originalBalanceAmount).toBeGreaterThan(0);

    // There should be at least one transaction visible
    await expect(page.getByRole('button', { name: 'sent Sent -2,323,232.3 🌀' })).toBeVisible();
    // check able to see rune bundles
    await wallet.coinSecondaryButton.click();
    await expect(wallet.coinSecondaryButton).toBeVisible();
    // can navigate to rare-sats-bundle page
    await wallet.runeItem.last().click();
    await expect(page.url()).toContain('rare-sats-bundle');
  });

  // TODO: add test for sending NFT - https://linear.app/xverseapp/issue/ENG-4321/transaction-send-nft
});
