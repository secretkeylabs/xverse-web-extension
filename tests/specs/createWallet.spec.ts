import { expect, test } from '../fixtures/base';
import Landing from '../pages/landing';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

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

const strongPW = Onboarding.generateSecurePasswordCrypto();
const fs = require('fs');
const path = require('path');

// Specify the file path for Addresses and Seedphrase
const filePathSeedWords = path.join(__dirname, 'seedWords.json');
const filePathAddresses = path.join(__dirname, 'addresses.json');

test.describe('Create and Restore Wallet Flow', () => {
  test('create and restore a wallet via Menu', async ({ page, extensionId, context }) => {
    const onboardingpage = new Onboarding(page);
    const wallet = new Wallet(page);
    await test.step('backup seedphrase and successfully create a wallet', async () => {
      await onboardingpage.navigateToBackupPage();
      await onboardingpage.buttonBackupNow.click();
      await expect(page.url()).toContain('backupWalletSteps');
      await expect(onboardingpage.buttonContinue).toBeDisabled();
      await expect(onboardingpage.buttonShowSeed).toBeVisible();
      await expect(onboardingpage.firstParagraphBackupStep).toBeVisible();
      await onboardingpage.buttonShowSeed.click();
      await expect(onboardingpage.buttonContinue).toBeEnabled();
      const seedWords = await onboardingpage.textSeedWords.allTextContents();
      await onboardingpage.buttonContinue.click();

      // check if 12 words are displayed
      await expect(onboardingpage.buttonSeedWords).toHaveCount(12);
      await expect(onboardingpage.secondParagraphBackupStep).toBeVisible();
      let seedword = await onboardingpage.selectSeedWord(seedWords);

      // Save the seedwords into a file to read it out later to restore
      fs.writeFileSync(filePathSeedWords, JSON.stringify(seedWords), 'utf8');

      // get all displayed values and filter the value from the actual seedphrase out to do an error message check
      const buttonValues = await onboardingpage.buttonSeedWords.evaluateAll((buttons) =>
        buttons.map((button) => {
          // Assert that the button is an HTMLButtonElement to access the `value` property
          if (button instanceof HTMLButtonElement) {
            return button.value;
          }
          return 'testvalue';
        }),
      );

      const filteredValues = buttonValues.filter((value) => value !== seedword);
      const randomValue = filteredValues[Math.floor(Math.random() * filteredValues.length)];
      await page.locator(`button[value="${randomValue}"]`).click();

      // Check if error message is displayed when clicking the wrong seedword
      await expect(page.locator('p:has-text("This word is not")')).toBeVisible();

      await page.locator(`button[value="${seedword}"]`).click();
      seedword = await onboardingpage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedword}"]`).click();
      seedword = await onboardingpage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedword}"]`).click();

      await onboardingpage.inputPassword.fill(strongPW);
      await onboardingpage.buttonContinue.click();
      await onboardingpage.inputPassword.fill(strongPW);
      await onboardingpage.buttonContinue.click();

      await expect(onboardingpage.imageSuccess).toBeVisible();
      await expect(onboardingpage.instruction).toBeVisible();
      await expect(onboardingpage.buttonCloseTab).toBeVisible();

      // Open the wallet directly via URL
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      const newWallet = new Wallet(page);
      await newWallet.checkVisualsStartpage();

      const balanceText = await newWallet.balance.innerText();
      await expect(balanceText).toBe('$0.00');

      // TODO: find better selector for the receive button
      await newWallet.allupperButtons.nth(1).click();

      // Get the addresses and save it in variables
      const addressBitcoin = await newWallet.getAddress(newWallet.buttonCopyBitcoinAddress);
      const addressOrdinals = await newWallet.getAddress(newWallet.buttonCopyOrdinalsAddress);
      // Stack Address doesn't have the confirm message
      await expect(newWallet.buttonCopyStacksAddress).toBeVisible();
      await newWallet.buttonCopyStacksAddress.click();
      const addressStack = await page.evaluate('navigator.clipboard.readText()');

      // Reload the page to close the modal window for the addresses as the X button needs to have a better locator
      await page.reload();
      // click close for the modal window
      // TODO find better locator for close button --> issue https://linear.app/xverseapp/issue/ENG-4039/adjust-id-or-add-titles-for-copy-address-button-for-receive-menu
      // await expect(page.locator('button.sc-hceviv > svg')).toBeVisible();
      // await page.locator('button.sc-hceviv > svg').click();

      // Save the Address in a file so that other tests can access them
      const dataAddress = JSON.stringify({
        addressBitcoin,
        addressOrdinals,
        addressStack,
      });

      // Write the file
      fs.writeFileSync(filePathAddresses, dataAddress, 'utf8');
    });
    await test.step('reset Wallet via Menu', async () => {
      await expect(wallet.buttonMenu).toBeVisible();
      await wallet.buttonMenu.click();
      await expect(wallet.buttonResetWallet).toBeVisible();
      await wallet.buttonResetWallet.click();
      await wallet.buttonResetWallet.click();
      await expect(onboardingpage.inputPassword).toBeVisible();
      await onboardingpage.inputPassword.fill(strongPW);
      await onboardingpage.buttonContinue.click();
    });
    await test.step('Restore wallet with 12 word seed phrase', async () => {
      const landingpage = new Landing(page);
      await expect(landingpage.buttonRestoreWallet).toBeVisible();
      await landingpage.buttonRestoreWallet.click();

      // Clicking on restore opens in this setup a new page for legal
      const newPage = await context.pages()[context.pages().length - 1];
      await expect(newPage.url()).toContain('legal');
      // old page needs to be closed as the test is continuing in the new tab
      const pages = await context.pages();
      await pages[0].close(); // pages[0] is the first (oldest) page
      const onboardingpage2 = new Onboarding(newPage);

      await onboardingpage2.buttonAccept.click();
      await expect(newPage.url()).toContain('restore');
      await onboardingpage2.checkRestoreWalletSeedPhrasePage();

      const seedWords = JSON.parse(fs.readFileSync(filePathSeedWords, 'utf8'));

      for (let i = 0; i < seedWords.length; i++) {
        await onboardingpage2.inputWord(i).fill(seedWords[i]);
      }
      await expect(onboardingpage2.buttonContinue).toBeEnabled();
      await onboardingpage2.buttonContinue.click();
      await onboardingpage2.inputPassword.fill(strongPW);
      await onboardingpage2.buttonContinue.click();
      await onboardingpage2.inputPassword.fill(strongPW);
      await onboardingpage2.buttonContinue.click();
      await expect(onboardingpage2.imageSuccess).toBeVisible();
      await expect(onboardingpage2.headingWalletRestored).toBeVisible();
      await expect(onboardingpage2.buttonCloseTab).toBeVisible();
      // Open the wallet directly via URL
      await newPage.goto(`chrome-extension://${extensionId}/popup.html`);
      const newWallet = new Wallet(newPage);
      await newWallet.checkVisualsStartpage();

      const balanceText = await newWallet.balance.innerText();
      await expect(balanceText).toBe('$0.00');

      await newWallet.allupperButtons.nth(1).click();

      // Get the Addresses
      const addressBitcoinCheck = await newWallet.getAddress(newWallet.buttonCopyBitcoinAddress);
      const addressOrdinalsCheck = await newWallet.getAddress(newWallet.buttonCopyOrdinalsAddress);
      // Stack Address doesn't have the confirm message
      await expect(newWallet.buttonCopyStacksAddress).toBeVisible();
      await newWallet.buttonCopyStacksAddress.click();
      const addressStackCheck = await newPage.evaluate('navigator.clipboard.readText()');

      // Read and parse the file
      const rawData = fs.readFileSync(filePathAddresses, 'utf8');
      const { addressBitcoin, addressOrdinals, addressStack } = JSON.parse(rawData);

      // Check if the Addresses are the same as from the file
      await expect(addressBitcoin).toBe(addressBitcoinCheck);
      await expect(addressOrdinals).toBe(addressOrdinalsCheck);
      await expect(addressStack).toBe(addressStackCheck);
    });
  });
});
