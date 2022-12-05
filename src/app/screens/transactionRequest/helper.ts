import {
  SettingsNetwork,
  fetchStxPendingTxData,
  getCoinsInfo,
  generateUnsignedContractCall,
  getNonce,
  getNewNonce,
  setNonce,
  FeesMultipliers,
  generateContractDeployTransaction,
  StacksTransaction,
  generateUnsignedStxTokenTransferTransaction,
} from '@secretkeylabs/xverse-core';
import { TransactionPayload } from '@stacks/connect';
import { ContractInterfaceResponse } from '@stacks/stacks-blockchain-api-types';
import {
  deserializeCV,
  BufferReader,
  deserializeStacksMessage,
  StacksMessageType,
  PostCondition,
  addressToString,
  PostConditionType,
  FungiblePostCondition,
} from '@stacks/transactions';
import axios from 'axios';
import { createContext } from 'react';

function removeHexPrefix(hexString: string): string {
  if (hexString !== 'string') return hexString;
  return hexString.startsWith('0x') ? hexString.replace('0x', '') : hexString;
}

export function hexStringToBuffer(hex: string): Buffer {
  return Buffer.from(removeHexPrefix(hex), 'hex');
}

// These helper functions are not only specific to contract function calls
// They should be moved to the core lib

export const extractFromPayload = (payload: any) => {
  const { functionArgs, postConditions } = payload;
  const funcArgs = functionArgs?.map((arg: string) => deserializeCV(hexStringToBuffer(arg)));

  const postConds = Array.isArray(postConditions)
    ? (postConditions?.map(
      (arg: string) => deserializeStacksMessage(
        new BufferReader(hexStringToBuffer(arg)),
        StacksMessageType.PostCondition,
      ) as PostCondition,
    ) as PostCondition[])
    : [];

  return { funcArgs, postConds };
};

export const getFTInfoFromPostConditions = (postConds: PostCondition[]) => (
  postConds?.filter(
    (postCond) => postCond.conditionType === PostConditionType.Fungible,
  ) as FungiblePostCondition[]
)?.map(
  (postCond: FungiblePostCondition) => `${addressToString(postCond.assetInfo.address)}.${postCond.assetInfo.contractName.content}`,
);

export const ShowMoreContext = createContext({ showMore: false });

export async function getContractInterface(
  contractAddress: string,
  contractName: string,
  network: SettingsNetwork,
): Promise<ContractInterfaceResponse | null> {
  const apiUrl = `${network.address}/v2/contracts/interface/${contractAddress}/${contractName}`;

  return axios
    .get<ContractInterfaceResponse>(apiUrl, {
    timeout: 30000,
  })
    .then((response) => response.data)
    .catch((error) => null);
}

export const createContractCallPromises = async (
  payload: any,
  stxAddress: string,
  network: SettingsNetwork,
  stxPublicKey: string,
) => {
  const sponsored = payload?.sponsored;
  const { pendingTransactions } = await fetchStxPendingTxData(stxAddress, network);
  const { funcArgs, postConds } = extractFromPayload(payload);

  const ftContactAddresses = getFTInfoFromPostConditions(postConds);

  const coinsMetaDataPromise = getCoinsInfo(ftContactAddresses, 'USD');

  const tx = {
    publicKey: stxPublicKey,
    contractAddress: payload.contractAddress,
    contractName: payload.contractName,
    functionName: payload.functionName,
    functionArgs: funcArgs,
    network,
    nonce: undefined,
    postConditions: postConds,
    sponsored,
    postConditionMode: payload.postConditionMode,
  };

  const unSignedContractCall = await generateUnsignedContractCall(tx);
  const { fee } = unSignedContractCall.auth.spendingCondition;

  const checkForPostConditionMessage = payload?.postConditionMode === 2 && payload?.postConditions?.values.length <= 0;
  const showPostConditionMessage = !!checkForPostConditionMessage;

  const newNonce = getNewNonce(pendingTransactions, getNonce(unSignedContractCall));
  setNonce(unSignedContractCall, newNonce);

  const contractInterfacePromise = getContractInterface(
    payload.contractAddress,
    payload.contractName,
    network,
  );

  return Promise.all([
    unSignedContractCall,
    contractInterfacePromise,
    coinsMetaDataPromise,
    showPostConditionMessage,
  ]);
};

export const createDeployContractRequest = async (
  payload: any,
  network: SettingsNetwork,
  stxPublicKey: string,
  feeMultipliers: FeesMultipliers,
  walletAddress: string,
) => {
  const { codeBody, contractName, postConditionMode } = payload;
  const { postConds } = extractFromPayload(payload);
  const postConditions = postConds;
  const sponsored = payload?.sponsored;
  const { pendingTransactions } = await fetchStxPendingTxData(
    walletAddress,
    network,
  );
  const contractDeployTx = await generateContractDeployTransaction({
    codeBody,
    contractName,
    postConditions,
    postConditionMode,
    pendingTxs: pendingTransactions,
    publicKey: stxPublicKey,
    network: network.type,
    sponsored,
  });
  const { fee } = contractDeployTx.auth.spendingCondition;
  if (feeMultipliers) {
    contractDeployTx.setFee(
      fee * BigInt(feeMultipliers.otherTxMultiplier),
    );
  }

  return {
    contractDeployTx,
    codeBody,
    contractName,
    sponsored,
  };
};

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
