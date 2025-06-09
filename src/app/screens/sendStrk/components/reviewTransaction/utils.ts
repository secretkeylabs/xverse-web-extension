import useVault from '@hooks/useVault';
import {
  dispatchTransfer,
  getAccountPrivateKey,
  STRK_TOKEN_ADDRESS,
  type Account,
} from '@secretkeylabs/xverse-core';
import { constants } from 'starknet';

export type Args = {
  recipient: string;

  /**
   * Amount expressed in STRK.
   */
  amount: bigint;
  currentAccount: Extract<Account, { accountType: 'software' }>;
};

export type TransactionHash = string;

export async function submitTransfer({
  recipient,
  amount,
  currentAccount,
}: Args): Promise<TransactionHash> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const vault = useVault(); // `useVault` is just a getter function named like a hook.
  const getWalletRootNodeResponse = await vault.SeedVault.getWalletRootNode(
    currentAccount.walletId,
  );
  const accountPrivateKey = await getAccountPrivateKey({
    type: 'root-node',
    rootNode: getWalletRootNodeResponse.rootNode,
    network: constants.NetworkName.SN_MAIN,
    accountIndex: BigInt(currentAccount.id),
  });

  const transactionId = await dispatchTransfer(
    STRK_TOKEN_ADDRESS,
    accountPrivateKey,
    amount,
    recipient,
  );

  return transactionId;
}
