import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const runeName = 'SKIBIDI•OHIO•RIZZ';

test.describe('Cancel runes listing', () => {
  // TODO solve the problem of always having 1 rune listed
  test('Cancel one runes listing mainnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own BTC  & Ordinals Address for address check on review page
    const selfOrdinals = await wallet.getAddress('Ordinals');

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    // Click List button to start the Runes listing flow
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText(runeName);
    await expect(wallet.coinBalance).toBeVisible();
    await expect(wallet.buttonList).toBeVisible();
    await wallet.buttonList.click();

    // check and count how many runes are not listed
    await wallet.checkVisualsListRunesPage();
    const countNotListedRunes = await wallet.runeItem.count();

    // check and count how many runes are listed
    await wallet.tabListed.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    const countListedRunes = await wallet.listedRune.count();

    // Cancel the first listing
    await expect(wallet.buttonCancel.first()).toBeVisible();
    await wallet.buttonCancel.first().click();

    await expect(wallet.signingAddress).toBeVisible();
    await expect(wallet.buttonSign).toBeVisible();
    await expect(page.url()).toContain('sign-message-request');

    await expect(await wallet.signingAddress.first().innerText()).toContain(selfOrdinals.slice(-4));

    // Sign the Message
    await wallet.buttonSign.click();

    // Redirect to listed runes page
    await expect(wallet.listedRune.first()).toBeVisible();
    await expect(wallet.buttonReload).toBeVisible();

    // Reload the view to ensure all changed listings are loaded
    await wallet.buttonReload.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    await wallet.buttonReload.click();
    await expect(wallet.buttonReload).toBeVisible();

    const countListedRunesAfterSign = await wallet.listedRune.count();
    await expect(countListedRunes - 1).toBe(countListedRunesAfterSign);

    // Check unlisted runes
    await wallet.tabNotListed.click();
    await wallet.checkVisualsListRunesPage();
    const countNotListedRunesAfterSign = await wallet.runeItem.count();
    await expect(countNotListedRunes + 1).toBe(countNotListedRunesAfterSign);
  });

  test('Not Sign the Cancel one runes listing mainnet #localexecution', async ({
    page,
    extensionId,
  }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', false);

    // get own BTC  & Ordinals Address for address check on review page
    const selfOrdinals = await wallet.getAddress('Ordinals');

    // Check if Rune is enabled and if not enable the rune and click on it
    await wallet.checkAndClickOnSpecificRune(runeName);

    // Click List button to start the Runes listing flow
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText(runeName);
    await expect(wallet.coinBalance).toBeVisible();
    await expect(wallet.buttonList).toBeVisible();
    await wallet.buttonList.click();

    // check and count how many runes are not listed
    await wallet.checkVisualsListRunesPage();
    const countNotListedRunes = await wallet.runeItem.count();

    // check and count how many runes are listed
    await wallet.tabListed.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    const countListedRunes = await wallet.listedRune.count();

    // Cancel the first listing
    await expect(wallet.buttonCancel.first()).toBeVisible();
    await wallet.buttonCancel.first().click();

    await expect(wallet.signingAddress).toBeVisible();
    await expect(wallet.buttonSign).toBeVisible();
    await expect(wallet.buttonCancel).toBeVisible();

    await expect(page.url()).toContain('sign-message-request');

    await expect(await wallet.signingAddress.first().innerText()).toContain(selfOrdinals.slice(-4));

    // Cancel the sign the Message
    await wallet.buttonCancel.click();

    // Redirect to runes dashboard
    await expect(wallet.textCoinTitle).toBeVisible();
    await expect(await wallet.textCoinTitle).toContainText(runeName);
    await expect(wallet.buttonList).toBeVisible();
    await expect(wallet.coinBalance).toBeVisible();

    // click on list and check listings
    await wallet.buttonList.click();

    // Check unlisted runes
    await wallet.checkVisualsListRunesPage();
    const countNotListedRunesAfterSign = await wallet.runeItem.count();
    await expect(countNotListedRunes).toBe(countNotListedRunesAfterSign);

    // Check listed runes
    await wallet.tabListed.click();
    await expect(wallet.listedRune.first()).toBeVisible();
    const countListedRunesAfterSign = await wallet.listedRune.count();
    await expect(countListedRunes).toBe(countListedRunesAfterSign);
  });
});
