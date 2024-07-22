import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

test.describe('Transaction', () => {
  test('Visual Check SIP 10 Token Transaction history mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    const tokenName = await wallet.enableRandomSIP10Token();

    await wallet.clickOnSpecificToken(tokenName);

    await expect(page.url()).toContain('coinDashboard');
    // Check token detail page for token image and coin title
    await expect(wallet.imageToken).toBeVisible();
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(wallet.textCoinTitle).toContainText(tokenName);

    // Check contract details are displayed
    await wallet.buttonCoinContract.click();
    await expect(wallet.buttonCoinContract).toBeVisible();
    await expect(wallet.coinContractAddress).toBeVisible();
    await expect(wallet.coinContractAddress).not.toBeEmpty();
  });

  test('Visual Check BRC 20 Token Transaction history mainnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);
    const tokenName = await wallet.enableRandomBRC20Token();

    await wallet.clickOnSpecificToken(tokenName);
    await expect(page.url()).toContain('coinDashboard');
    // Check token detail page for coin title
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(wallet.textCoinTitle).toContainText(tokenName);
  });

  test('Visual Check STX Transaction history testnet', async ({ page, extensionId }) => {
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

  test('Visual Check Runes Transaction history', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune('SKIBIDI•OHIO•RIZZ');

    const originalBalanceAmount = await wallet.checkVisualsRunesDashboard('SKIBIDI•OHIO•RIZZ');
    await expect(originalBalanceAmount).toBeGreaterThan(0);
    await expect(wallet.containerTransactionHistory.first()).toBeVisible();
    // There should be at least one transaction visible
    await expect(await wallet.containerTransactionHistory.count()).toBeGreaterThanOrEqual(1);
  });

  // TODO: add test for sending NFT - https://linear.app/xverseapp/issue/ENG-4321/transaction-send-nft
});
