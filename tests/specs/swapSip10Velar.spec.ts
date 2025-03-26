import { expect, test } from '../fixtures/base';
import { enableCrossChainSwaps } from '../fixtures/helpers';
import Wallet from '../pages/wallet';

// swap sip-10 to STX on Velar - mainnet

test.describe('Swap sip-10 token to STX', () => {
  test.beforeAll(async ({ page }) => {
    await enableCrossChainSwaps(page);
  });

  test('Swap sip-10 to STX #localexecution', async ({ page, extensionId }) => {
    // set up the testing wallet
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // click swap button on the homepage
    await page.getByRole('button', { name: 'Swap' }).click();

    // choose the tokens
    await page
      .getByRole('button', { name: /select asset/i })
      .first()
      .click();
    await page.getByText('VELAR', { exact: true }).first().click();
    await expect(page.getByText(/velar/i)).toBeVisible();
    await page
      .getByRole('button', { name: /select asset/i })
      .last()
      .click();
    await page.getByText('STX', { exact: true }).first().click();

    // assert chosen tokens populated the dropdown inputs velar -> stx
    await expect(page.getByText(/velar/i)).toBeVisible();
    await expect(page.getByText(/stx/i)).toBeVisible();

    // input the amount for swapping
    await page.getByRole('textbox', { name: '0' }).fill('0.1');
    await expect(page.getByText(/^~\$\d+\.\d{2}\sUSD$/)).toBeVisible();

    // assert presence balance and amount
    await expect(page.getByText(/balance:/i)).toBeVisible();
    await expect(page.getByText(/^\d+\.\d+$/i)).toBeVisible();

    // assert presence of max button
    await expect(page.getByRole('button', { name: 'MAX' })).toBeVisible();

    await page.getByRole('button', { name: /get quotes/i }).click();

    await expect(page.getByText('Rates', { exact: true })).toBeVisible();

    await page.getByText('Velar', { exact: true }).click();

    // Quotes page velar -> stacks
    await expect(page.getByText(/quote/i)).toBeVisible();
    await expect(page.getByText(/4%/i)).toBeVisible();
    await page.getByRole('button', { name: /4%/i }).click();

    // edit slippage tolerance
    await page.getByRole('textbox', { name: '4' }).fill('1.22');
    await page.getByRole('button', { name: /apply/i }).click();
    await expect(page.getByText('1.22')).toBeVisible();
    await expect(page.getByRole('img', { name: /velar logo/i })).toBeVisible();

    await page.getByRole('button', { name: /swap/i }).click();

    // Arrive to the final step - swap contract page
    await expect(page.getByText(/swap-exact-tokens-for-tokens/i)).toHaveCount(2);
    await expect(page.getByText(/network fee/i)).toBeVisible();
    await expect(page.getByText(/^\d+\.\d+\s+STX$/i).last()).toBeVisible();
    await expect(page.getByRole('button', { name: /edit nonce/i })).toBeVisible();

    // User clicks confirm
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/transaction broadcasted/i)).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();

    // After closing user should arrive to homepage
    await expect(page).toHaveURL(/popup\.html/);
  });
});
