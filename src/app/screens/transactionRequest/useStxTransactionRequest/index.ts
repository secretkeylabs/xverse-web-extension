import { getPopupPayload, type Context } from '@common/utils/popup';
import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  stxCallContractParamsSchema,
  stxDeployContractParamsSchema,
  stxSignTransactionRequestMessageSchema,
} from '@sats-connect/core';
import { txPayloadToRequest } from '@secretkeylabs/xverse-core';
import {
  TransactionTypes,
  type ContractCallPayload,
  type ContractDeployPayload,
} from '@stacks/connect';
import { AuthType, PayloadType, deserializeTransaction } from '@stacks/transactions';
import { createUnsecuredToken, decodeToken } from 'jsontokens';
import { useEffect, useState } from 'react';
import { parse } from 'superjson';
import * as v from 'valibot';
import type { Return } from './types';
import { getPayload, isDeployContractPayload } from './utils';

export type DataStxSignTransaction = {
  context: Context;
  data: {
    method: 'stx_signTransaction';
    params: {
      transaction: string;
      pubkey?: string;
      broadcast?: boolean;
    };
    id: string;
    jsonrpc: '2.0';
  };
} | null;

export type StxTransactionRequestState = Return & {
  loading: boolean;
  error?: string;
};

function buildFromSignTransactionPayload(
  dataStxSignTransaction: NonNullable<DataStxSignTransaction>,
  stxAddress: string,
  network: ReturnType<typeof useNetworkSelector>,
): Return {
  const { transaction: transactionHex } = dataStxSignTransaction.data.params;
  const transaction = deserializeTransaction(transactionHex);

  let legacyPayload: any;
  const txPayload = transaction.payload;
  if (txPayload.payloadType === PayloadType.TokenTransfer) {
    legacyPayload = {
      txType: 'token_transfer',
      recipient: txPayload.recipient,
      amount: txPayload.amount,
      memo: txPayload.memo,
      sponsored: transaction.auth.authType === AuthType.Sponsored,
    };
  }
  if (txPayload.payloadType === PayloadType.ContractCall) {
    legacyPayload = txPayloadToRequest(transaction, stxAddress);
  }

  if (isDeployContractPayload(txPayload.payloadType)) {
    legacyPayload = {
      network,
      ...txPayloadToRequest(transaction, stxAddress),
    };
  }

  return {
    tabId: dataStxSignTransaction.context.tabId,
    messageId: dataStxSignTransaction.data.id,
    rpcMethod: 'stx_signTransaction',
    broadcast: dataStxSignTransaction.data.params.broadcast ?? true,
    payload: legacyPayload,
    transaction,
    requestToken: '',
  };
}

function buildFromLegacyParams(
  params: URLSearchParams,
  stxAddress: string,
  stxPublicKey: string,
  network: ReturnType<typeof useNetworkSelector>,
): Return {
  let rpcMethod = params.get('rpcMethod') ?? '';
  const tabId = Number(params.get('tabId') ?? '0');
  const messageId = params.get('messageId') ?? '';

  switch (rpcMethod) {
    case 'stx_transferStx': {
      const payload = {
        network,
        recipient: params.get('recipient'),
        amount: params.get('amount'),
        memo: params.get('memo'),
        txType: 'token_transfer',
      };
      return {
        messageId,
        tabId,
        rpcMethod,
        broadcast: true,
        payload,
        requestToken: '',
      };
    }
    case 'stx_signTransaction': {
      const transactionHex = params.get('transaction') ?? '';
      const transaction = deserializeTransaction(transactionHex);

      let legacyPayload: any;
      const txPayload = transaction.payload;
      if (txPayload.payloadType === PayloadType.TokenTransfer) {
        legacyPayload = {
          txType: 'token_transfer',
          recipient: txPayload.recipient,
          amount: txPayload.amount,
          memo: txPayload.memo,
          sponsored: transaction.auth.authType === AuthType.Sponsored,
        };
      }
      if (txPayload.payloadType === PayloadType.ContractCall) {
        legacyPayload = txPayloadToRequest(transaction, stxAddress);
      }

      if (isDeployContractPayload(txPayload.payloadType)) {
        legacyPayload = {
          network,
          ...txPayloadToRequest(transaction, stxAddress),
        };
      }

      return {
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,
        payload: legacyPayload,
        transaction,
        requestToken: '',
      };
    }
    case 'stx_callContract': {
      const contract = params.get('contract') ?? '';
      const functionName = params.get('functionName') ?? '';
      const argumentsString = params.get('arguments') ?? '';
      const argumentsParseResult = v.safeParse(
        stxCallContractParamsSchema.entries.arguments,
        parse(decodeToken(argumentsString).payload as string),
      );

      const argumentsArray = argumentsParseResult.success
        ? argumentsParseResult.output
        : (() => {
            // eslint-disable-next-line no-console
            console.error('Error parsing arguments', argumentsParseResult.issues);
            return undefined;
          })();

      const payload: ContractCallPayload = {
        txType: TransactionTypes.ContractCall,
        contractAddress: contract.split('.')[0],
        contractName: contract.split('.')[1],
        functionName,
        functionArgs: argumentsArray ?? [],
        publicKey: stxPublicKey,
        network,
        postConditions: [],
      };
      const requestToken = createUnsecuredToken(payload as any);

      return {
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,
        payload,
        requestToken,
      };
    }
    case 'stx_deployContract': {
      const name = params.get('name') ?? '';
      const clarityCodeParam = params.get('clarityCode') ?? '';
      const clarityCode = (() => {
        const parseResult = v.safeParse(
          stxDeployContractParamsSchema.entries.clarityCode,
          clarityCodeParam,
        );
        return parseResult.success ? parseResult.output : '';
      })();

      const payload: ContractDeployPayload = {
        contractName: name,
        codeBody: clarityCode,
        txType: TransactionTypes.ContractDeploy,
        publicKey: stxPublicKey,
      };
      const requestToken = createUnsecuredToken(payload as any);

      return {
        tabId,
        messageId,
        rpcMethod,
        broadcast: true,
        payload,
        requestToken,
      };
    }
    default: {
      const requestToken = params.get('request') ?? '';
      const decodedToken = decodeToken(requestToken ?? '') as any;
      const transaction = decodedToken.payload.txHex
        ? deserializeTransaction(decodedToken.payload.txHex!)
        : undefined;
      const txPayload = getPayload({ decodedToken, transaction });

      return {
        broadcast: true,
        payload: txPayload,
        transaction,
        tabId,
        requestToken,
      };
    }
  }
}

const loadingPlaceholder: StxTransactionRequestState = {
  loading: true,
  broadcast: true,
  payload: {},
  tabId: 0,
  requestToken: '',
};

const useStxTransactionRequest = (
  dataStxSignTransactionOverride?: DataStxSignTransaction,
): StxTransactionRequestState => {
  const { stxAddress, stxPublicKey } = useSelectedAccount();
  const network = useNetworkSelector();
  const approvalParams = useApprovalSearchParams();
  const [state, setState] = useState<StxTransactionRequestState>(() => {
    if (dataStxSignTransactionOverride) {
      return {
        loading: false,
        ...buildFromSignTransactionPayload(dataStxSignTransactionOverride, stxAddress, network),
      };
    }
    return loadingPlaceholder;
  });

  useEffect(() => {
    if (dataStxSignTransactionOverride) {
      setState({
        loading: false,
        ...buildFromSignTransactionPayload(dataStxSignTransactionOverride, stxAddress, network),
      });
      return;
    }

    let cancelled = false;

    (async () => {
      const [errorStxSignTransaction, payloadDataStxSignTransaction] = await getPopupPayload(
        (data) => v.parse(stxSignTransactionRequestMessageSchema, data),
      );

      if (!cancelled && !errorStxSignTransaction && payloadDataStxSignTransaction) {
        setState({
          loading: false,
          ...buildFromSignTransactionPayload(payloadDataStxSignTransaction, stxAddress, network),
        });
        return;
      }

      if (approvalParams.status === 'loading') {
        return;
      }

      if (approvalParams.status === 'error') {
        if (!cancelled) {
          setState({
            ...loadingPlaceholder,
            loading: false,
            error: approvalParams.error,
          });
        }
        return;
      }

      try {
        const built = buildFromLegacyParams(
          approvalParams.params,
          stxAddress,
          stxPublicKey,
          network,
        );
        if (!cancelled) {
          setState({ loading: false, ...built });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({
            ...loadingPlaceholder,
            loading: false,
            error: e?.message ?? 'Failed to parse transaction request',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    approvalParams,
    dataStxSignTransactionOverride,
    network,
    stxAddress,
    stxPublicKey,
  ]);

  return state;
};

export default useStxTransactionRequest;
