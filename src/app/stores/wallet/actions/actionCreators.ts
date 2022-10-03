import * as actions from './types';

export function setWalletAction(
  wallet: actions.WalletData,
): actions.SetWallet {
  return {
    type: actions.SetWalletKey,
    wallet,
  };
}

export function ResetWalletAction(): actions.ResetWallet {
  return {
    type: actions.ResetWalletKey,
  };
}
