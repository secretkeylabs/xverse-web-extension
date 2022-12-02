import {
  SettingsNetwork,
  fetchStxPendingTxData,
  getCoinsInfo,
  generateUnsignedContractCall,
  getNonce,
  getNewNonce,
  setNonce,
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
        (arg: string) =>
          deserializeStacksMessage(
            new BufferReader(hexStringToBuffer(arg)),
            StacksMessageType.PostCondition
          ) as PostCondition
      ) as PostCondition[])
    : [];

  return { funcArgs, postConds };
};

export const getFTInfoFromPostConditions = (postConds: PostCondition[]) =>
  (
    postConds?.filter(
      (postCond) => postCond.conditionType === PostConditionType.Fungible
    ) as FungiblePostCondition[]
  )?.map(
    (postCond: FungiblePostCondition) =>
      `${addressToString(postCond.assetInfo.address)}.${postCond.assetInfo.contractName.content}`
  );

export const ShowMoreContext = createContext({ showMore: false });

export async function getContractInterface(
  contractAddress: string,
  contractName: string,
  network: SettingsNetwork
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
  stxPublicKey: string
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

  const checkForPostConditionMessage =
    payload?.postConditionMode === 2 && payload?.postConditions?.values.length <= 0;
  const showPostConditionMessage = !!checkForPostConditionMessage;

  const newNonce = getNewNonce(pendingTransactions, getNonce(unSignedContractCall));
  setNonce(unSignedContractCall, newNonce);

  const contractInterfacePromise = getContractInterface(
    payload.contractAddress,
    payload.contractName,
    network
  );

  return Promise.all([
    unSignedContractCall,
    contractInterfacePromise,
    coinsMetaDataPromise,
    showPostConditionMessage,
  ]);
};

export async function getContractCallPromises(
  payload: TransactionPayload,
  stxAddress: string,
  network: SettingsNetwork,
  stxPublicKey: string
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
