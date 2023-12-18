import { applyFeeMultiplier } from '@hooks/queries/useFeeMultipliers';
import {
  AppInfo,
  createContractCallPromises,
  generateUnsignedStxTokenTransferTransaction,
  StacksNetwork,
  StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { TransactionPayload } from '@stacks/connect';

export async function getContractCallPromises(
  payload: TransactionPayload,
  stxAddress: string,
  network: StacksNetwork,
  stxPublicKey: string,
) {
  const [unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage] =
    await createContractCallPromises(payload, stxAddress, network, stxPublicKey);
  return {
    unSignedContractCall,
    contractInterface,
    coinsMetaData,
    showPostConditionMessage,
  };
}

export async function getTokenTransferRequest(
  recipient: string,
  amount: string,
  memo: string,
  stxPublicKey: string,
  feeMultipliers: AppInfo | null,
  network: StacksNetwork,
  stxPendingTransactions,
) {
  const unsignedSendStxTx: StacksTransaction = await generateUnsignedStxTokenTransferTransaction(
    recipient,
    amount,
    memo!,
    stxPendingTransactions?.pendingTransactions ?? [],
    stxPublicKey,
    network,
  );
  applyFeeMultiplier(unsignedSendStxTx, feeMultipliers);
  return unsignedSendStxTx;
}
