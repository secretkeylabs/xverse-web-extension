import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const TEST_ORDINALS_ADDRESS = 'tb1pprpcu07x8fd02keqx9wtfncz99fhg6hepvpw34w9l2lnazmmf7rspw96ql';

test.describe('Collectibles Tab - Rare sats', () => {
  test('Check rare sats testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

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
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

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
    await wallet.invalidAddressCheck(inputAddress);
    await inputAddress.fill(addressOrdinals);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      false,
      addressOrdinals,
      addressOrdinals,
      false,
      false,
    );

    await wallet.switchToHighFees();

    // Cancel the transaction
    await wallet.buttonCancel.click();

    await expect(wallet.buttonBack).toBeVisible();
    await wallet.buttonBack.click();
    await expect(wallet.containerRareSats).toBeVisible();
    const childCRareStats2 = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats2).toBeGreaterThan(2);
  });

  test('Send rare stats testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

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

    // Address input
    const inputAddress = page.locator('input');
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      false,
      addressOrdinals,
      addressOrdinals,
      false,
      false,
    );

    await wallet.confirmSendTransaction();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least two Rare Sats should be visible
    const childCRareStats2 = await wallet.containerRareSats.getByRole('button').count();
    await expect(childCRareStats2).toBeGreaterThanOrEqual(2);
  });
});
