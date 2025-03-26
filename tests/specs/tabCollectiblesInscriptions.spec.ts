import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const TEST_ORDINALS_ADDRESS = 'tb1pprpcu07x8fd02keqx9wtfncz99fhg6hepvpw34w9l2lnazmmf7rspw96ql';

test.describe('Collectibles Tab - Inscriptions', () => {
  test('Cancel send Collection Inscriptions testnet #localexecution', async ({
    page,
    extensionId,
  }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Save name of Inscription for later check
    const nameInscriptions = await wallet.nameInscriptionCollection.first().innerText();

    // Click on the first collection
    await wallet.clickOnSpecificInscription(nameInscriptions);

    await expect(wallet.itemCollection.first()).toBeVisible();
    await expect(await wallet.itemCollection.count()).toBeGreaterThanOrEqual(1);
    await wallet.itemCollection.first().click();

    // Check visuals
    await expect(wallet.buttonSend).toBeVisible();
    await expect(wallet.buttonShare).toBeVisible();
    await expect(wallet.labelOwnedBy).toBeVisible();
    await expect(wallet.buttonOpenOrdinalViewer).toBeVisible();

    // Save ordinal number for a later check
    await expect(wallet.numberOrdinal).toBeVisible();
    const numberOrdinal = await wallet.numberOrdinal.innerText();

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    await wallet.invalidAddressCheck(wallet.receiveAddress);

    // Check Info message
    await wallet.receiveAddress.fill(addressOrdinals);
    await expect(wallet.infoMessageSendSelf).toBeVisible();

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      true,
      '',
      TEST_ORDINALS_ADDRESS,
      false,
    );

    await wallet.switchToHighFees();

    // Cancel the transaction
    await wallet.buttonCancel.click();

    // Back to collection overview
    await wallet.buttonBack.click();
    // back to gallery
    await wallet.backToGallery.click();

    // Check if Inscription is still there
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Click on the same Inscriptions from before
    await wallet.clickOnSpecificInscription(nameInscriptions);
    await expect(wallet.itemCollection.first()).toBeVisible();
    await expect(await wallet.itemCollection.count()).toBeGreaterThanOrEqual(1);
    await wallet.itemCollection.first().click();

    // check ordinal number with the ordinal number from before
    await expect(wallet.numberOrdinal).toBeVisible();
  });

  test('Send one Item from Collection Inscriptions testnet #localexecution', async ({
    page,
    extensionId,
  }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Save name of Inscription for later check
    const nameInscriptions = await wallet.nameInscriptionCollection.first().innerText();

    // Click on the firt collection
    await wallet.clickOnSpecificInscription(nameInscriptions);

    await expect(wallet.itemCollection.first()).toBeVisible();
    await expect(await wallet.itemCollection.count()).toBeGreaterThanOrEqual(1);
    await wallet.itemCollection.first().click();

    // Check visuals
    await expect(wallet.buttonSend).toBeVisible();
    await expect(wallet.buttonShare).toBeVisible();
    await expect(wallet.labelOwnedBy).toBeVisible();
    await expect(wallet.buttonOpenOrdinalViewer).toBeVisible();

    // Save ordinal number for a later check
    await expect(wallet.numberOrdinal).toBeVisible();

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.receiveAddress).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    await wallet.invalidAddressCheck(wallet.receiveAddress);

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      true,
      '',
      TEST_ORDINALS_ADDRESS,
      false,
    );

    await wallet.confirmSendTransaction();

    // Back on startpage go to Collectibles tab
    await wallet.navigateToCollectibles();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);
  });

  test('Cancel send single Inscriptions testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // get own Ordinals Address for address check on review page
    const addressOrdinals = await wallet.getAddress('Ordinals');

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Save name of Inscription for later check
    const nameInscriptions = await wallet.nameInscriptionSingle.first().innerText();

    // Click on the firt collection
    await wallet.clickOnSpecificInscription(nameInscriptions);

    // Check visuals
    await expect(wallet.buttonSend).toBeVisible();
    await expect(wallet.buttonShare).toBeVisible();
    await expect(wallet.labelOwnedBy).toBeVisible();
    await expect(wallet.buttonOpenOrdinalViewer).toBeVisible();

    // Save ordinal number for a later check
    await expect(wallet.numberOrdinal).toBeVisible();

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    await wallet.invalidAddressCheck(wallet.receiveAddress);

    // Check Info message
    await wallet.receiveAddress.fill(addressOrdinals);
    await expect(wallet.infoMessageSendSelf).toBeVisible();

    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      true,
      '',
      TEST_ORDINALS_ADDRESS,
      false,
      true,
    );

    await wallet.switchToHighFees();

    // Cancel the transaction
    await wallet.buttonCancel.click();

    // Back from detail to overview
    await wallet.buttonBack.click();

    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Click on the same Inscriptions from before
    await wallet.clickOnSpecificInscription(nameInscriptions);

    // check ordinal number with the ordinal number from before
    await expect(wallet.numberOrdinal).toBeVisible();
  });

  test('Send single Inscriptions testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTest(extensionId, 'SEED_WORDS1', true);

    // Navigate to Collectibles tab
    await wallet.navigateToCollectibles();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Save name of Inscription for later check
    const nameInscriptions = await wallet.nameInscriptionSingle.first().innerText();

    // Click on the firt collection
    await wallet.clickOnSpecificInscription(nameInscriptions);

    // Check visuals
    await expect(wallet.buttonSend).toBeVisible();
    await expect(wallet.buttonShare).toBeVisible();
    await expect(wallet.labelOwnedBy).toBeVisible();
    await expect(wallet.buttonOpenOrdinalViewer).toBeVisible();

    // Save ordinal number for a later check
    await expect(wallet.numberOrdinal).toBeVisible();

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Input Address
    await wallet.receiveAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await wallet.checkVisualsSendTransactionReview(
      'send-ordinal',
      true,
      '',
      TEST_ORDINALS_ADDRESS,
      false,
      true,
    );

    await wallet.confirmSendTransaction();

    // Back on startpage go to Collectibles tab
    await wallet.navigateToCollectibles();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);
  });
});
