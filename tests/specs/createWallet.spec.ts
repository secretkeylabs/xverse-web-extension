import { expect, test } from '../fixtures/base';
import Landing from '../pages/landing';
import Onboarding from '../pages/onboarding';
import Wallet from '../pages/wallet';

const strongPW = Onboarding.generateSecurePasswordCrypto();
const fs = require('fs');
const path = require('path');

// Specify the file path for Addresses and seedPhrase
const filePathSeedWords = path.join(__dirname, 'seedWords.json');
const filePathAddresses = path.join(__dirname, 'addresses.json');

test.describe('Create and Restore Wallet Flow', () => {
  test('create and restore a wallet via Menu', async ({ page, extensionId, context }) => {
    const onboardingPage = new Onboarding(page);
    const wallet = new Wallet(page);
    await test.step('backup seedPhrase and successfully create a wallet', async () => {
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
      let seedWord = await onboardingPage.selectSeedWord(seedWords);

      // Save the seedWords into a file to read it out later to restore
      fs.writeFileSync(filePathSeedWords, JSON.stringify(seedWords), 'utf8');

      // get all displayed values and filter the value from the actual seedPhrase out to do an error message check
      const buttonValues = await onboardingPage.buttonSeedWords.evaluateAll((buttons) =>
        buttons.map((button) => {
          // Assert that the button is an HTMLButtonElement to access the `value` property
          if (button instanceof HTMLButtonElement) {
            return button.value;
          }
          return 'testValue';
        }),
      );

      const filteredValues = buttonValues.filter((value) => value !== seedWord);
      const randomValue = filteredValues[Math.floor(Math.random() * filteredValues.length)];
      await page.locator(`button[value="${randomValue}"]`).first().click();

      // Check if error message is displayed when clicking the wrong seedWord
      await expect(page.locator('p:has-text("This word is not")')).toBeVisible();

      await page.locator(`button[value="${seedWord}"]`).click();
      seedWord = await onboardingPage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedWord}"]`).click();
      seedWord = await onboardingPage.selectSeedWord(seedWords);
      await page.locator(`button[value="${seedWord}"]`).click();

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

      // Get the addresses and save it in variables
      const addressBitcoin = await newWallet.getAddress('Bitcoin');
      const addressOrdinals = await newWallet.getAddress('Ordinals');
      const addressStack = await newWallet.getAddress('Stacks');

      // Save the Address in a file so that other tests can access them
      const dataAddress = JSON.stringify({
        addressBitcoin,
        addressOrdinals,
        addressStack,
      });

      // Write the file
      fs.writeFileSync(filePathAddresses, dataAddress, 'utf8');
    });

    await test.step('Reset Wallet via Settings', async () => {
      // Go to Settings -> Security
      await wallet.navigationSettings.click();
      await wallet.buttonSecurity.click();

      // Confirm reset
      await page.getByRole('button', { name: 'Reset Wallet' }).first().click();
      await page.getByRole('dialog').getByRole('button', { name: 'Reset Wallet' }).click();

      // Enter password to confirm reset
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

      // Get the Addresses
      const addressBitcoinCheck = await newWallet.getAddress('Bitcoin');
      const addressOrdinalsCheck = await newWallet.getAddress('Ordinals');
      const addressStackCheck = await newWallet.getAddress('Stacks');

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
