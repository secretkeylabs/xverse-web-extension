import { expect, test } from '../fixtures/base';
import Landing from '../pages/landing';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();
const fs = require('fs');
const path = require('path');

// Specify the file path for Addresses and Seedphrase
const filePathSeedWords = path.join(__dirname, 'seedWords.json');
const filePathAddresses = path.join(__dirname, 'addresses.json');

test.describe('Create and Restore Wallet Flow', () => {
  test('create and restore a wallet via Menu', async ({ page, extensionId, context }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await test.step('backup seedphrase and successfully create a wallet', async () => {
      await onboardingPage.navigateToBackupPage();
      await onboardingPage.buttonBackupNow.click();
      await expect(page.url()).toContain('backupWalletSteps');
      await expect(onboardingPage.buttonContinue).toBeDisabled();
      await expect(onboardingPage.buttonRevealSeed).toBeVisible();
      await expect(onboardingPage.firstParagraphBackupStep).toBeVisible();
      await onboardingPage.buttonRevealSeed.click();
      await expect(onboardingPage.buttonContinue).toBeEnabled();
      const seedWords = await onboardingPage.textSeedWords.allTextContents();
      await onboardingPage.buttonContinue.click();

      // check if 12 words are displayed
      await expect(onboardingPage.buttonSeedWords).toHaveCount(12);
      await expect(onboardingPage.secondParagraphBackupStep).toBeVisible();
      let seedword = await onboardingPage.selectSeedWord(seedWords);

      // Save the seedwords into a file to read it out later to restore
      fs.writeFileSync(filePathSeedWords, JSON.stringify(seedWords), 'utf8');

      // get all displayed values and filter the value from the actual seedphrase out to do an error message check
      const buttonValues = await onboardingPage.buttonSeedWords.evaluateAll((buttons) =>
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
      await page.locator(`button[value="${randomValue}"]`).first().click();

      // Check if error message is displayed when clicking the wrong seedword
      await expect(page.locator('p:has-text("This word is not")')).toBeVisible();

      await page.locator(`button[value="${seedword}"]`).click();
      seedword = await onboardingPage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedword}"]`).click();
      seedword = await onboardingPage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedword}"]`).click();

      await onboardingPage.inputPassword.fill(strongPW);
      await onboardingPage.buttonContinue.click();
      await onboardingPage.inputPassword.fill(strongPW);
      await onboardingPage.buttonContinue.click();

      await expect(onboardingPage.imageSuccess).toBeVisible();
      await expect(onboardingPage.instruction).toBeVisible();
      await expect(onboardingPage.buttonCloseTab).toBeVisible();

      // Open the wallet directly via URL
      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      const newWallet = new Wallet(page);
      await newWallet.checkVisualsStartpage();

      await expect(newWallet.balance).toHaveText('$0.00');

      // TODO: find better selector for the receive button
      await newWallet.allUpperButtons.nth(1).click();

      // Get the addresses and save it in variables
      const addressBitcoin = await newWallet.getAddress(newWallet.buttonCopyBitcoinAddress);
      const addressOrdinals = await newWallet.getAddress(newWallet.buttonCopyOrdinalsAddress);
      const addressStack = await newWallet.getAddress(newWallet.buttonCopyStacksAddress, false);

      // Reload the page to close the modal window for the addresses as the X button needs to have a better locator
      await page.reload();
      // click close for the modal window
      // TODO: find better locator for close button --> issue https://linear.app/xverseapp/issue/ENG-4039/adjust-id-or-add-titles-for-copy-address-button-for-receive-menu
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
      await expect(onboardingPage.inputPassword).toBeVisible();
      await onboardingPage.inputPassword.fill(strongPW);
      await onboardingPage.buttonContinue.click();
    });
    await test.step('Restore wallet with 12 word seed phrase', async () => {
      const landingPage = new Landing(page);
      await expect(landingPage.buttonRestoreWallet).toBeVisible();
      await landingPage.buttonRestoreWallet.click();

      await context.waitForEvent('page');

      // Clicking on restore opens in this setup a new page for legal
      const newPage = await context.pages()[context.pages().length - 1];
      await expect(newPage.url()).toContain('legal');

      const onboardingPage2 = new Onboarding(newPage);

      await onboardingPage2.buttonAccept.click();
      await expect(newPage.url()).toContain('restore');
      await onboardingPage2.checkRestoreWalletSeedPhrasePage();

      const seedWords = JSON.parse(fs.readFileSync(filePathSeedWords, 'utf8'));

      for (let i = 0; i < seedWords.length; i++) {
        await onboardingPage2.inputWord(i).fill(seedWords[i]);
      }
      await expect(onboardingPage2.buttonContinue).toBeEnabled();
      await onboardingPage2.buttonContinue.click();
      await onboardingPage2.inputPassword.fill(strongPW);
      await onboardingPage2.buttonContinue.click();
      await onboardingPage2.inputPassword.fill(strongPW);
      await onboardingPage2.buttonContinue.click();
      await expect(onboardingPage2.imageSuccess).toBeVisible();
      await expect(onboardingPage2.headingWalletRestored).toBeVisible();
      await expect(onboardingPage2.buttonCloseTab).toBeVisible();
      // Open the wallet directly via URL
      await newPage.goto(`chrome-extension://${extensionId}/popup.html`);
      const newWallet = new Wallet(newPage);
      await newWallet.checkVisualsStartpage();

      const balanceText = newWallet.balance;
      await await expect(balanceText).toHaveText('$0.00');

      await newWallet.allUpperButtons.nth(1).click();

      // Get the Addresses
      const addressBitcoinCheck = await newWallet.getAddress(newWallet.buttonCopyBitcoinAddress);
      const addressOrdinalsCheck = await newWallet.getAddress(newWallet.buttonCopyOrdinalsAddress);
      const addressStackCheck = await newWallet.getAddress(
        newWallet.buttonCopyStacksAddress,
        false,
      );

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
