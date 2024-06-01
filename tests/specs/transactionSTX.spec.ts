import { expect, test } from '../fixtures/base';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const STXMain = 'SPN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5M1Q812S';
const STXTest = `STN2AMZQ54Y0NN4H5Z4S0DGMWP27CTXY5QEDCQAN`;
const selfSTXMain = 'SP7QMYRVFTW4Z9A48FVCCM0A10RVTYTM8ZQPTWNR';
const strongPW = Onboarding.generateSecurePasswordCrypto();

const amountSTXSend = 10;
test.describe('Transaction STX', () => {
  test.beforeEach(async ({ page, extensionId, context }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html#/landing`);
    // TODO: this fixes a temporary issue with two tabs at the start see technical debt https://linear.app/xverseapp/issue/ENG-3992/two-tabs-open-instead-of-one-since-version-0323-for-start-extension
    const pages = await context.pages();
    if (pages.length === 2) {
      await pages[1].close(); // pages[1] is the second (newest) page
    }
  });
  test.afterEach(async ({ context }) => {
    if (context.pages().length > 0) {
      // Close the context only if there are open pages
      await context.close();
    }
  });

  test('Send STX Page Visual Check without funds Mainnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(wallet.allupperButtons).toHaveCount(4);

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    // Send STX

    await wallet.clickOnSpecificToken('Stacks');
    await wallet.checkVisualsSendSTXPage();

    // Recipient address invalid check
    await wallet.inputRecipientAdress.fill(`Test Address 123`);
    await expect(wallet.buttonNext).toBeDisabled();
    await wallet.inputSendAmount.fill(`1`);
    // Button should be enabled as all fields are filled
    await expect(wallet.buttonNext).toBeEnabled();
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageAddressInvalid).toBeVisible();
    await expect(wallet.buttonNext).toBeEnabled();
    // Recipient address send self check
    await wallet.inputRecipientAdress.fill(selfSTXMain);
    await wallet.buttonNext.click();
    await expect(wallet.errorMessageSendSelf).toBeVisible();
    await expect(wallet.buttonNext).toBeEnabled();
    // Fill in correct Receiver Address
    await wallet.inputRecipientAdress.fill(STXMain);
    await wallet.buttonNext.click();
    // No funds on mainnet in this wallet --> Insufficient Balance error should be visible
    await expect(wallet.errorInsufficientBalance).toBeVisible();
  });

  // TODO: need to add STX funds to the wallet, testnet is currently not avaiable
  test.skip('Send STX - Cancel transaction testnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();

    // Save initial Balance for later Balance checks
    const initalSTXBalance = await wallet.getTokenBalance('Stacks');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Stacks');
    await wallet.checkVisualsSendSTXPage();

    // Fill in Receiver Address
    await wallet.inputRecipientAdress.fill(STXTest);
    await expect(wallet.buttonNext).toBeDisabled();
    await wallet.inputSendAmount.fill(amountSTXSend.toString());
    // Button should be enabled as all fields are filled
    await expect(wallet.buttonNext).toBeEnabled();
    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalSTXBalance).toEqual(displayBalanceNumerical);

    await wallet.buttonNext.click();
    // Check receiver Address
    await expect(await wallet.receiveAddress.innerText()).toContain(STXTest.slice(-4));

    // Check correct amounts
    await wallet.checkAmountsSendingSTX(amountSTXSend, STXTest);

    // Cancel the transaction
    await expect(wallet.buttonCancel).toBeEnabled();
    await wallet.buttonCancel.click();

    // TODO: delete when this is fixed https://linear.app/xverseapp/issue/ENG-4305/cancel-transaction-functionality-is-inconsistent-between-stx-and-btc
    await expect(wallet.inputSendAmount).toBeVisible();
    await expect(wallet.inputRecipientAdress).toBeVisible();
    await expect(wallet.inputMemo).toBeVisible();
    await expect(wallet.imageToken).toBeVisible();

    // TODO: activate this code block when this is fixed for https://linear.app/xverseapp/issue/ENG-4305/cancel-transaction-functionality-is-inconsistent-between-stx-and-btc
    /* // Check if switch to testnet was successfull and all visuals are correct
    await wallet.checkVisualsStartpage('testnet');

    // Check STX Balance after cancel the transaction
    const balanceAfterCancel = await wallet.getTokenBalance('Stacks');
    await expect(initalSTXBalance).toEqual(balanceAfterCancel); */
  });

  // TODO: need to add Stack funds to the wallet, testnet is currently not avaiable
  test.skip('Send STX - confirm transaction testnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();

    // Save initial Balance for later Balance checks
    const initalSTXBalance = await wallet.getTokenBalance('Stacks');

    // Click on send button
    await wallet.allupperButtons.nth(0).click();

    // Needed to add this to avoid loading issues with the token list to be displayed
    await expect(await wallet.divTokenRow.count()).toBeGreaterThanOrEqual(2);
    await wallet.clickOnSpecificToken('Stacks');

    // Check visuals of sending page
    await wallet.checkVisualsSendSTXPage();

    // Fill in Receiver Address
    await wallet.inputRecipientAdress.fill(STXTest);
    await expect(wallet.buttonNext).toBeDisabled();
    // Fill in amount
    await wallet.inputSendAmount.fill(`1`);
    // Button should be enabled as all fields are filled
    await expect(wallet.buttonNext).toBeEnabled();

    // Balance check
    const displayBalance = await wallet.labelBalanceAmountSelector.innerText();
    const displayBalanceNumerical = parseFloat(displayBalance.replace(/[^0-9.]/g, ''));
    await expect(initalSTXBalance).toEqual(displayBalanceNumerical);

    await wallet.buttonNext.click();
    await expect(await wallet.receiveAddress.innerText()).toContain(STXTest.slice(-4));

    // Check correct amounts
    await wallet.checkAmountsSendingSTX(amountSTXSend, STXTest);

    // Confirm the transaction
    await wallet.confirmSendTransaction('testnet');

    // Check STX Balance after cancel the transaction with the initial STX Balance
    const balanceAfterCancel = await wallet.getTokenBalance('Stacks');
    await expect(initalSTXBalance).toEqual(balanceAfterCancel);
  });

  // TODO: add test where we change the fees for a STX transaction

  // TODO: need to add Stack funds to the wallet, testnet is currently not avaiable
  test.skip('Visual Check STX Transaction history testnet', async ({ page, extensionId }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);

    await onboardingpage.restoreWallet(strongPW, 'SEED_WORDS1');
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await wallet.checkVisualsStartpage();
    await wallet.navigationSettings.click();
    await wallet.switchtoTestnetNetwork();
    await wallet.navigationDashboard.click();
    // Check if switch to testnet was successfull and all visuals are correct
    await wallet.checkVisualsStartpage('testnet');
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
});
