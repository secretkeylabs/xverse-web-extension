import { StacksProvider } from '@stacks/connect';
import { BitcoinProvider } from 'sats-connect';

import SatsMethodsProvider from './sats.inpage';
import StacksMethodsProvider from './stacks.inpage';

declare global {
  interface Window {
    XverseProviders: {
      StacksProvider: StacksProvider;
      BitcoinProvider: BitcoinProvider;
    };
  }
}

// we inject these in case implementors call the default providers
if (document.currentScript?.dataset.isPriority) {
  Object.defineProperties(window, {
    StacksProvider: { get: () => StacksMethodsProvider, set: () => {} },
    BitcoinProvider: { get: () => SatsMethodsProvider, set: () => {} },
  });
} else {
  window.StacksProvider = StacksMethodsProvider as StacksProvider;
  window.BitcoinProvider = SatsMethodsProvider;
}

// We also inject the providers in an Xverse object in order to have them exclusively available for Xverse wallet
// and not clash with providers from other wallets
window.XverseProviders = {
  StacksProvider: StacksMethodsProvider as StacksProvider,
  BitcoinProvider: SatsMethodsProvider as BitcoinProvider,
};
