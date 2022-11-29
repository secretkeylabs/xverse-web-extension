import { SettingsNetwork } from '@secretkeylabs/xverse-core';
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
)?.map((postCond: FungiblePostCondition) => `${addressToString(postCond.assetInfo.address)}.${
  postCond.assetInfo.contractName.content
}`);

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
