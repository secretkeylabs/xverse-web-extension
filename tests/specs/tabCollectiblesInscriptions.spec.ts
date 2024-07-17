import { expect, test } from '../fixtures/base';
import Wallet from '../pages/wallet';

const TEST_ORDINALS_ADDRESS = 'tb1pprpcu07x8fd02keqx9wtfncz99fhg6hepvpw34w9l2lnazmmf7rspw96ql';

test.describe('Collectibles Tab - Inscriptions', () => {
  test('Cancel send Collection Inscriptions testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

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
    const orgNumberOrdinal = await wallet.numberOrdinal.innerText();

    // TODO: differentiate between BRC20 Inscriptions and Inscriptions

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await wallet.buttonNext.click();
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
    await expect(wallet.textValueReviewPage).toBeEnabled();

    // Check if the right ordinal number is shown
    const reviewNumberOrdinal = await wallet.textValueReviewPage.innerText();
    await expect(orgNumberOrdinal).toMatch(reviewNumberOrdinal);

    // Cancel the transaction
    await wallet.buttonCancel.click();

    // Back to dashboard
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
    const org2NumberOrdinal = await wallet.numberOrdinal.innerText();

    await expect(orgNumberOrdinal).toMatch(org2NumberOrdinal);
  });

  test('Send one Item from Collection Inscriptions testnet #localexecution', async ({
    page,
    extensionId,
  }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

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
    const orgNumberOrdinal = await wallet.numberOrdinal.innerText();

    // TODO: differentiate between BRC20 Inscriptions and Inscriptions

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    // TODO FIX - why is this line not working? (receiveAddress not detecting)
    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(await wallet.receiveAddress.first().innerText()).toContain(
      TEST_ORDINALS_ADDRESS.slice(-4),
    );
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();
    await expect(wallet.textValueReviewPage).toBeEnabled();

    // Check if the right ordinal number is shown
    const reviewNumberOrdinal = await wallet.textValueReviewPage.innerText();
    await expect(orgNumberOrdinal).toMatch(reviewNumberOrdinal);

    await wallet.confirmSendTransaction();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);
  });

  test('Cancel send single Inscriptions testnet', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

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
    const orgNumberOrdinal = await wallet.numberOrdinal.innerText();

    // TODO: differentiate between BRC20 Inscriptions and Inscriptions

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    // TODO - FIX THIS LINE
    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(await wallet.receiveAddress.first().innerText()).toContain(
      TEST_ORDINALS_ADDRESS.slice(-4),
    );
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();
    await expect(wallet.textValueReviewPage).toBeEnabled();

    // Check if the right ordinal number is shown
    const reviewNumberOrdinal = await wallet.textValueReviewPage.innerText();
    await expect(orgNumberOrdinal).toMatch(reviewNumberOrdinal);

    // Cancel the transaction
    await wallet.buttonCancel.click();
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);

    // Click on the same Inscriptions from before
    await wallet.clickOnSpecificInscription(nameInscriptions);

    // check ordinal number with the ordinal number from before
    await expect(wallet.numberOrdinal).toBeVisible();
    const org2NumberOrdinal = await wallet.numberOrdinal.innerText();

    await expect(orgNumberOrdinal).toMatch(org2NumberOrdinal);
  });

  test('Send single Inscriptions testnet #localexecution', async ({ page, extensionId }) => {
    const wallet = new Wallet(page);
    await wallet.setupTestnetTest(extensionId, 'SEED_WORDS1');

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
    const orgNumberOrdinal = await wallet.numberOrdinal.innerText();

    // TODO: differentiate between BRC20 Inscriptions and Inscriptions

    // check share button url
    await wallet.buttonShare.click();
    const addressShare = await page.evaluate('navigator.clipboard.readText()');
    await expect(addressShare).toContain('ord-testnet.xverse.app');

    // Click on send button
    await wallet.buttonSend.click();
    await expect(wallet.buttonNext).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();

    // Address invalid check
    const inputAddress = page.locator('input');
    await inputAddress.fill(`Test Address 123`);
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeDisabled();
    await inputAddress.fill(TEST_ORDINALS_ADDRESS);
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();

    // Transaction Review Page
    await expect(wallet.receiveAddress.first()).toBeVisible();
    await expect(await wallet.receiveAddress.first().innerText()).toContain(
      TEST_ORDINALS_ADDRESS.slice(-4),
    );
    await expect(wallet.buttonCancel).toBeEnabled();
    await expect(wallet.buttonConfirm).toBeEnabled();
    await expect(wallet.textValueReviewPage).toBeEnabled();

    // Check if the right ordinal number is shown
    const reviewNumberOrdinal = await wallet.textValueReviewPage.innerText();
    await expect(orgNumberOrdinal).toMatch(reviewNumberOrdinal);

    await wallet.confirmSendTransaction();

    // Check visuals on opening Collectibles page
    await expect(wallet.tabsCollectiblesItems.first()).toBeVisible();
    await expect(wallet.totalItem).toBeVisible();

    // at least one Inscriptions should be visible
    await expect(await wallet.containersCollectibleItem.count()).toBeGreaterThanOrEqual(1);
  });
});
