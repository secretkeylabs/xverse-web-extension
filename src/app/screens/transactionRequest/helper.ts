import { SettingsNetwork, createContractCallPromises } from '@secretkeylabs/xverse-core';
import { TransactionPayload } from '@stacks/connect';

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
