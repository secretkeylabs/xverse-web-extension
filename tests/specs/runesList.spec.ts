import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const price = (Math.random() + 1).toFixed(4);
const runeName = 'SKIBIDI•OHIO•RIZZ';

test.describe('List runes', () => {
  test('List one rune custom price mainnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own BTC  & Ordinals Address for address check on review page
    const selfBTC = await wallet.getAddress('Bitcoin');
    const selfOrdinals = await wallet.getAddress('Ordinals');

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    // Click List button to start the Runes listing flow
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText(runeName);
    await expect(wallet.coinBalance).toBeVisible();
    const originalBalanceText = await wallet.coinBalance.innerText();
    const numericOriginalValue = parseFloat(originalBalanceText.replace(/[^\d.-]/g, ''));
    await expect(wallet.buttonList).toBeVisible();
    await wallet.buttonList.click();

    // check and count how many runes are listed
    await wallet.tabListed.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    const countListedRunes = await wallet.listedRune.count();

    await wallet.tabNotListed.click();
    // Visual Check 'List Runes' page
    await wallet.checkVisualsListRunesPage();

    // Count displayed UTXO to check later that this number didn't change
    const originalUTXOCount = await wallet.runeItem.count();

    // click on the first UTXO
    await wallet.runeItemCheckbox.first().check();

    // Click on set price
    await page.getByRole('button', { name: 'Next' }).click();

    // Select Marketplace Page
    await expect(page.getByText('Magic Eden')).toBeVisible();
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: 'Next' }).click();

    // Check visuals 'List on Magic Eden'
    await wallet.checkVisualsListOnMEPage();

    // Check that that one rune is listed
    await expect(await wallet.runeContainer.count()).toBe(1);

    // check UTXO
    await expect(await wallet.runeTitle.innerText()).toContain('2,323,232.3');

    // Select custom
    await wallet.buttonCustomPrice.click();

    // Set price modal appears
    await expect(wallet.buttonApply).toBeVisible();
    await expect(wallet.buttonApply).toBeDisabled();
    await expect(wallet.inputListingPrice).toBeVisible();

    await wallet.inputListingPrice.fill(price);
    await expect(wallet.buttonApply).toBeEnabled();
    await wallet.buttonApply.click();

    // Check Price
    const displayPrice = await wallet.runePrice.innerText();
    const displayPriceNumerical = parseFloat(displayPrice.replace(/[^0-9.]/g, ''));
    await expect(parseFloat(price)).toEqual(displayPriceNumerical);

    // Save the send amounts
    const sendAmount = await wallet.sendAmount.innerText();
    const num1 = parseFloat(sendAmount.replace(/[^0-9.]/g, ''));

    const sendCurrencyAmount = await wallet.sendCurrencyAmount.innerText();
    const num1Currency = parseFloat(sendCurrencyAmount.replace(/[^0-9.]/g, ''));

    // click on continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check Visuals Review transaction
    await expect(wallet.confirmCurrencyAmount).toBeVisible();
    await expect(wallet.buttonExpand).toBeVisible();
    // Show input and output and check visuals
    await wallet.buttonExpand.click();

    // Address check sending and receiving
    await expect(await wallet.sendAddress.first().innerText()).toContain(selfOrdinals.slice(-4));
    await expect(await wallet.receiveAddress.first().innerText()).toContain(selfBTC.slice(-4));

    // Compare the amount from page before and review page
    const confirmTotalCurrencyAmount = await wallet.confirmCurrencyAmount.innerText();
    const confirmTotalAmount = await wallet.confirmTotalAmount.innerText();

    // Extract amounts for balance, sending amount and amount afterwards
    const num2Currency = parseFloat(confirmTotalCurrencyAmount.replace(/[^0-9.]/g, ''));

    // Expected: 0.02323232
    // Received: 0.02323
    const num2 = parseFloat(confirmTotalAmount.replace(/[^0-9.]/g, ''));
    const truncateNum2 = Number(num2.toFixed(5));
    await expect(num1).toBeCloseTo(truncateNum2);

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Check visuals for Rune Dashboard and check Balances and names
    await expect(page.getByText('Transactions broadcasted')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByText('SKIBIDI•OHIO•RIZZ')).toBeVisible();
    await page.getByText('SKIBIDI•OHIO•RIZZ').click();

    // click on list and check listings
    await wallet.buttonList.click();

    // Check visuals
    await wallet.checkVisualsListRunesPage();

    // check and count how many runes are listed
    await wallet.tabListed.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    const countListedRunesAfterCancel = await wallet.listedRune.count();
    await expect(countListedRunesAfterCancel).toBe(countListedRunes + 1);
  });
});
