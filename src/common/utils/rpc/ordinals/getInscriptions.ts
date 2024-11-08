import { getTabIdFromPort } from '@common/utils';
import getSelectedAccount from '@common/utils/getSelectedAccount';
import { makeContext } from '@common/utils/popup';
import { makeAccountResourceId } from '@components/permissionsManager/resources';
import * as utils from '@components/permissionsManager/utils';
import { RpcErrorCode, getInscriptionsSchema, type RpcRequestMessage } from '@sats-connect/core';
import { OrdinalsApi } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import * as v from 'valibot';
import { handleInvalidMessage } from '../handle-invalid-message';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '../helpers';
import {
  sendAccessDeniedResponseMessage,
  sendInternalErrorMessage,
} from '../responseMessages/errors';

const handleGetInscriptions = async (message: RpcRequestMessage, port: chrome.runtime.Port) => {
  const parseResult = v.safeParse(getInscriptionsSchema, message);

  if (!parseResult.success) {
    handleInvalidMessage(message, getTabIdFromPort(port), parseResult.issues);
    return;
  }
  const { origin, tabId } = makeContext(port);
  const [loadError, store] = await utils.getPermissionsStore();

  if (loadError) {
    sendInternalErrorMessage({
      tabId,
      messageId: message.id,
      message: 'Error loading permissions store.',
    });
    return;
  }

  if (!store) {
    sendAccessDeniedResponseMessage({ tabId, messageId: message.id });
    return;
  }

  const {
    selectedAccountIndex,
    selectedAccountType,
    accountsList: softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
    network,
  } = rootStore.store.getState().walletState;

  const existingAccount = getSelectedAccount({
    selectedAccountIndex,
    selectedAccountType,
    softwareAccountsList,
    ledgerAccountsList,
    keystoneAccountsList,
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

  const permission = utils.getClientPermission(
    store.permissions,
    origin,
    makeAccountResourceId({
      accountId: selectedAccountIndex,
      networkType: network.type,
      masterPubKey: existingAccount.masterPubKey,
    }),
  );

  if (!permission) {
    sendAccessDeniedResponseMessage({ tabId, messageId: message.id });
    return;
  }

  if (!permission.actions.has('read')) {
    sendAccessDeniedResponseMessage({ tabId, messageId: message.id });
    return;
  }

  await utils.permissionsStoreMutex.runExclusive(async () => {
    // Update the last used time for the client
    utils.updateClientMetadata(store, origin, { lastUsed: new Date().getTime() });
    await utils.savePermissionsStore(store);
  });

  const ordinalsApi = new OrdinalsApi({ network: network.type });

  try {
    const inscriptionsList = await ordinalsApi.getInscriptions(
      existingAccount.ordinalsAddress,
      parseResult.output.params.offset,
      parseResult.output.params.limit,
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
