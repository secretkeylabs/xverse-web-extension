import { expect, test } from '../fixtures/base';
import { enableCrossChainSwaps } from '../fixtures/helpers';
import Wallet from '../pages/wallet';
//* swap STX for runes using Velar on mainnet(not supported on testnet)

test.describe('Velar sip-10 swap flow', () => {
  test.beforeAll(async ({ page }) => {
    await enableCrossChainSwaps(page);
  });
  test('Check the Velar sip-10 flow on mainnet #localexecution', async ({ page, extensionId }) => {
    // set up the testing wallet
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // click the swap button and choose STX->Velar route
    await page.getByRole('button', { name: 'Swap' }).click();

    await page
      .getByRole('button', { name: /select asset/i })
      .first()
      .click();
    await page.getByText(/stacks/i).click();
    await page
      .getByRole('button', { name: /select asset/i })
      .last()
      .click();

    await page.getByText(/velar/i).first().click();
    await page.getByRole('textbox', { name: '0' }).fill('0.1');
    await page.getByRole('button', { name: /get quotes/i }).click();
    await expect(page.getByText('Rates', { exact: true })).toBeVisible();
    await page.getByText(/^\d+\.\d+\s+Velar$/i).click();

    // Arrive to Quotes page
    await expect(page.getByText(/quote/i)).toBeVisible();
    await expect(page.getByText(/4%/i)).toBeVisible();

    await page.getByRole('img', { name: /velar logo/i }).isVisible();
    await page.getByRole('button', { name: /swap/i }).click();

    // Arrive to the final step - swap contract page
    await expect(page.getByText(/swap-exact-tokens-for-tokens/i)).toHaveCount(2);
    await expect(page.getByText(/network fee/i)).toBeVisible();
    await expect(page.getByText(/^\d+\.\d+\s+STX$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /edit nonce/i })).toBeVisible();

    // User clicks confirm
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/transaction broadcasted/i)).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();

    // After closing user should arrive to homepage
    await expect(page).toHaveURL(/popup\.html/);
  });
});
