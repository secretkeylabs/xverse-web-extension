import {
  createContractCallPromises,
  SettingsNetwork,
  FeesMultipliers,
  StacksTransaction,
  generateUnsignedStxTokenTransferTransaction,
} from '@secretkeylabs/xverse-core';
import { TransactionPayload } from '@stacks/connect';

export async function getContractCallPromises(
  payload: TransactionPayload,
  stxAddress: string,
  network: SettingsNetwork,
  stxPublicKey: string,
) {
  const [unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage] = await createContractCallPromises(payload, stxAddress, network, stxPublicKey);
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
  feeMultipliers: FeesMultipliers,
  network: SettingsNetwork,
  stxPendingTransactions,
) {
  const unsignedSendStxTx: StacksTransaction = await generateUnsignedStxTokenTransferTransaction(
    recipient,
    amount,
    memo!,
    stxPendingTransactions?.pendingTransactions ?? [],
    stxPublicKey,
    network.type,
  );
  // increasing the fees with multiplication factor
  const fee: bigint = BigInt(unsignedSendStxTx.auth.spendingCondition.fee.toString()) ?? BigInt(0);
  if (feeMultipliers?.stxSendTxMultiplier) {
    unsignedSendStxTx.setFee(fee * BigInt(feeMultipliers.stxSendTxMultiplier));
  }
  return unsignedSendStxTx;
}
