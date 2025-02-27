import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { RpcErrorCode, type GetInscriptionsRequestMessage } from '@sats-connect/core';
import { OrdinalsApi } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';

const handleGetInscriptions = async (
  message: GetInscriptionsRequestMessage,
  port: chrome.runtime.Port,
) => {
  const tabId = getTabIdFromPort(port);

  const {
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    selectedWalletId,
    softwareWallets,
    ledgerAccountsList,
    keystoneAccountsList,
    network: network.type,
  });

  if (!existingAccount) {
    sendRpcResponse(
      tabId,
      makeRPCError(message.id, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: 'Could not find selected account.',
      }),
    );
    return;
  }

  const ordinalsApi = new OrdinalsApi({ network: network.type });

  try {
    const inscriptionsList = await ordinalsApi.getInscriptions(
      existingAccount.btcAddresses.taproot.address,
      message.params.offset,
      message.params.limit,
    );
    sendRpcResponse(
      tabId,
      makeRpcSuccessResponse<'ord_getInscriptions'>(message.id, {
        total: inscriptionsList.total,
        limit: inscriptionsList.limit,
        offset: inscriptionsList.offset,
        inscriptions: inscriptionsList.results.map((inscription) => ({
          inscriptionId: inscription.id,
          inscriptionNumber: String(inscription.number),
          collectionName: inscription.collection_name ? inscription.collection_name : '',
          contentType: inscription.content_type,
          contentLength: String(inscription.content_length),
          address: inscription.address,
          output: inscription.output,
          offset: Number(inscription.offset),
          postage: inscription.value,
          genesisTransaction: inscription.genesis_tx_id,
          timestamp: inscription.genesis_timestamp,
        })),
      }),
    );
  } catch (error) {
    sendRpcResponse(
      tabId,
      makeRPCError(message.id, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: (error as any).message,
      }),
    );
  }
};

export default handleGetInscriptions;
