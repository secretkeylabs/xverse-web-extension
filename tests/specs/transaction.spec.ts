import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();

test.describe('Transaction', () => {
  test('Visual Check SIP 10 Token Transaction history mainnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();

    const tokenName = await wallet.enableRandomSIP10Token();

    await wallet.divTokenRow
      .filter({
        has: wallet.labelTokenSubtitle.getByText(tokenName, { exact: true }),
      })
      .click();
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
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    const tokenName = await wallet.enableRandomBRC20Token();

    await wallet.divTokenRow
      .filter({
        has: wallet.labelTokenSubtitle.getByText(tokenName, { exact: true }),
      })
      .click();
    await expect(page.url()).toContain('coinDashboard');
    // Check token detail page for coin title
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(wallet.textCoinTitle).toContainText(tokenName);
  });

  // TODO: add test for sending runes - https://linear.app/xverseapp/issue/ENG-4319/transaction-send-runes
  // TODO: add test for sending rare stats - https://linear.app/xverseapp/issue/ENG-4320/transaction-send-rare-sat
  // TODO: add test for sending NFT - https://linear.app/xverseapp/issue/ENG-4321/transaction-send-nft
});
