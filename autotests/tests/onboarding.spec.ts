import { expect, test } from '../fixtures/base';
import { data } from '../fixtures/data';
import Onboarding from '../pages/onboarding';

test.describe('Onboarding', () => {
  let onboarding: Onboarding;
  test.beforeEach(async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });
  test.afterEach(async ({ context }) => {
    await context.close();
  });
  test('Create and backup wallet', async ({ context, landing }) => {
    await test.step('open create wallet page in a new tab', async () => {
      await landing.buttonCreateWallet.click();
      expect(context.pages()).toHaveLength(2);
      const [, newPage] = context.pages();
      await newPage.waitForURL('**/onboarding');
      onboarding = new Onboarding(newPage);
    });
    await test.step('navigate onboarding pages', async () => {
      await onboarding.buttonNext.click();
      await onboarding.buttonNext.click();
      await onboarding.buttonContinue.click();
      await onboarding.linkTOS.click();
      await context.waitForEvent('page');
      let newPage = context.pages()[2];
      await newPage.waitForURL('https://www.xverse.app/terms');
      await newPage.close();
      await onboarding.linkPrivacy.click();
      await context.waitForEvent('page');
      newPage = context.pages()[2];
      await newPage.waitForURL('https://www.xverse.app/privacy');
      await newPage.close();
      await onboarding.buttonAccept.click();
    });
    await test.step('backup wallet and verify seed phrase', async () => {
      await onboarding.buttonBackupNow.click();
      await onboarding.buttonShowSeed.click();
      const seedWords = await onboarding.textSeedWords.allTextContents();
      await onboarding.buttonContinue.click();
      await onboarding.selectSeedWord(seedWords);
      await onboarding.selectSeedWord(seedWords);
      await onboarding.selectSeedWord(seedWords);
    });
    await test.step('create password', async () => {
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
    });
    await test.step('verify wallet is created successfully', async () => {
      await onboarding.page.getByText(data.walletCreatedTitle, { exact: true }).waitFor();
      await onboarding.page.getByText(data.walletCreatedSubtitle, { exact: true }).waitFor();
      await expect(onboarding.instruction).toBeVisible();
      await onboarding.buttonCloseTab.click();
      expect(context.pages()).toHaveLength(1);
    });
  });

  test('Restore Wallet', async ({ context, landing }) => {
    await test.step('open restore wallet page in a new tab', async () => {
      await landing.buttonRestoreWallet.click();
      expect(context.pages()).toHaveLength(2);
      const [, newPage] = context.pages();
      await newPage.waitForURL('**/onboarding?restore=true');
      onboarding = new Onboarding(newPage);
    });
    await test.step('navigate onboarding pages', async () => {
      await onboarding.buttonNext.click();
      await onboarding.buttonNext.click();
      await onboarding.buttonContinue.click();
      await onboarding.linkTOS.click();
      await context.waitForEvent('page');
      let newPage = context.pages()[2];
      await newPage.waitForURL('https://www.xverse.app/terms');
      await newPage.close();
      await onboarding.linkPrivacy.click();
      await context.waitForEvent('page');
      newPage = context.pages()[2];
      await newPage.waitForURL('https://www.xverse.app/privacy');
      await newPage.close();
      await onboarding.buttonAccept.click();
    });
    await test.step('restore wallet with valid seed phrase', async () => {
      const seedWords = data.seedPhrase.split(' ');
      for (let i = 0; i < seedWords.length; i++) {
        await onboarding.inputWord(i).fill(seedWords[i]);
      }
      await onboarding.buttonContinue.click();
    });
    await test.step('create password', async () => {
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
      await onboarding.inputPassword.fill(data.walletPassword);
      await onboarding.buttonContinue.click();
    });
    await test.step('verify wallet is restored successfully', async () => {
      await onboarding.page.getByText(data.walletRestoredTitle, { exact: true }).waitFor();
      await onboarding.page.getByText(data.walletRestoredSubtitle, { exact: true }).waitFor();
      await expect(onboarding.instruction).toBeVisible();
      await onboarding.buttonCloseTab.click();
      expect(context.pages()).toHaveLength(1);
    });
  });
});
