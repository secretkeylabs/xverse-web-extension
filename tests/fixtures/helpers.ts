import { type Page } from '@playwright/test';

/**
 * Enables cross-chain swaps for the test environment.
 */
export async function enableCrossChainSwaps(page: Page): Promise<void> {
  await page.route('https://api-3.xverse.app/v1/app-features', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        CROSS_CHAIN_SWAPS: { enabled: true },
      }),
    });
  });
}
