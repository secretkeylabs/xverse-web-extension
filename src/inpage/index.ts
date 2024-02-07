import { StacksProvider } from '@stacks/connect';
import { BitcoinProvider } from 'sats-connect';

import SatsMethodsProvider from './sats.inpage';
import StacksMethodsProvider from './stacks.inpage';

declare global {
  interface XverseProviders {
    StacksProvider: StacksProvider;
  }
}

// We inject the providers in an Xverse object in order to have them exclusively available for Xverse wallet
// and not clash with providers from other wallets
window.XverseProviders = {
  // @ts-ignore
  StacksProvider: StacksMethodsProvider as StacksProvider,
  BitcoinProvider: SatsMethodsProvider as BitcoinProvider,
};

// we inject these in case implementors call the default providers
try {
  if (document.currentScript?.dataset.isPriority) {
    Object.defineProperties(window, {
      StacksProvider: { get: () => StacksMethodsProvider, set: () => {} },
      BitcoinProvider: { get: () => SatsMethodsProvider, set: () => {} },
    });
  } else {
    window.StacksProvider = StacksMethodsProvider as StacksProvider;
    window.BitcoinProvider = SatsMethodsProvider;
  }
} catch (e) {
  console.log(
    'Failed setting Xverse default providers. Another wallet may have already set them in an immutable way.',
  );
  console.error(e);
}
