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

// we keep this in case implementors call the default providers
window.StacksProvider = StacksMethodsProvider;
window.BitcoinProvider = SatsMethodsProvider;

// and add this
window.XverseProviders = {
  StacksProvider: StacksMethodsProvider,
  BitcoinProvider: SatsMethodsProvider,
};
