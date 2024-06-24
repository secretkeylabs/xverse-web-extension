import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const TEST_ORDINALS_ADDRESS = 'tb1pprpcu07x8fd02keqx9wtfncz99fhg6hepvpw34w9l2lnazmmf7rspw96ql';

test.describe('Collectibles Tab - Rare sats', () => {
  test('Check rare sats testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();
    // Click on Rare Sats in Tab list
    await wallet.tabsCollectiblesItems.nth(2).click();
    await expect(wallet.containerRareSats).toBeVisible();
    // at least two Rare Sats should be visible
    const childCRareStats = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats).toBeGreaterThan(2);

    // Check visuals for Rare Sats detail page
    await wallet.containerRareSats.getByRole('button').last().click();
    await expect(wallet.buttonSend).toBeVisible();
    await expect(wallet.labelSatsValue).toBeVisible();
    await expect(wallet.labelOwnedBy).toBeVisible();
    await expect(wallet.labelRareSats).toBeVisible();
    await expect(wallet.buttonSupportRarity).toBeVisible();
  });

  test('Cancel send rare sats testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();
    // Click on Rare Sats in Tab list
    await wallet.tabsCollectiblesItems.nth(2).click();
    await expect(wallet.containerRareSats).toBeVisible();
    // at least two Rare Sats should be visible
    const childCRareStats = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats).toBeGreaterThan(2);

    // Check visuals for Rare Sats detail page
    await wallet.containerRareSats.getByRole('button').last().click();

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(await wallet.receiveAddress.innerText()).toContain(
      TEST_ORDINALS_ADDRESS.slice(-4),
    );
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();

    // Cancel the transaction
    // TODO: Enable the following code when this is fixed: https://linear.app/xverseapp/issue/ENG-4305/cancel-transaction-functionality-is-inconsistent-between-stx-and-btc
    /*
    await wallet.buttonCancel.click();

    // TODO: Check where the cancel button leads the user
    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();
    // Click on Rare Sats in Tab list
    await wallet.tabsCollectiblesItems.nth(2).click();
    await expect(wallet.containerRareSats).toBeVisible();
    // at least two Rare Sats should be visible
    const childCRareStats = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats).toBeGreaterThan(2);
     */
  });

  test.skip('Send rare stats testnet #broadtransaction', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();
    // Click on Rare Sats in Tab list
    await wallet.tabsCollectiblesItems.nth(2).click();
    await expect(wallet.containerRareSats).toBeVisible();
    // at least two Rare Sats should be visible
    const childCRareStats = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats).toBeGreaterThan(2);

    // Check visuals for Rare Sats detail page
    await wallet.containerRareSats.getByRole('button').last().click();

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(await wallet.receiveAddress.innerText()).toContain(
      TEST_ORDINALS_ADDRESS.slice(-4),
    );
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();

    await wallet.confirmSendTransaction();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least two Rare Sats should be visible
    const childCRareStats2 = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats2).toBeGreaterThanOrEqual(2);
  });
});
