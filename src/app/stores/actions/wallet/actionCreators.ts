import { Account } from 'app/core/types/accounts';
import { Network } from 'app/core/types/networks';
import * as actions from './types';

export function getGenerateWalletAction(): actions.GenerateWalletAction {
  return {
    type: actions.GenerateWalletKey,
  };
}

export function getGenerateWalletSuccessAction(
  stxAddress: string,
  btcAddress: string,
  masterPubKey: string,
  stxPublicKey: string,
  btcPublicKey: string,
  network: Network,
  accountsList: Account[],
  bnsName?: string,
): actions.GenerateWalletSuccess {
  return {
    type: actions.GenerateWalletSuccessKey,
    stxAddress,
    btcAddress,
    masterPubKey,
    stxPublicKey,
    btcPublicKey,
    network,
    accountsList,
    bnsName,
  };
}
