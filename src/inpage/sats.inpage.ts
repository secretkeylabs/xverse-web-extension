import {
  DomEventName,
  type CreateInscriptionEventDetails,
  type CreateRepeatInscriptionsEventDetails,
  type GetAddressRequestEventDetails,
  type SendBtcRequestEventDetails,
  type SignBatchPsbtRequestEventDetails,
  type SignMessageRequestEventDetails,
  type SignPsbtRequestEventDetails,
} from '@common/types/inpage-types';
import {
  SatsConnectMethods,
  type CreateInscriptionResponseMessage,
  type CreateRepeatInscriptionsResponseMessage,
  type GetAddressResponseMessage,
  type SendBtcResponseMessage,
  type SignBatchPsbtResponseMessage,
  type SignMessageResponseMessage,
  type SignPsbtResponseMessage,
} from '@common/types/message-types';
import {
  rpcResponseMessageSchema,
  type BitcoinProvider,
  type CreateInscriptionResponse,
  type CreateRepeatInscriptionsResponse,
  type GetAddressResponse,
  type Params,
  type Requests,
  type RpcRequest,
  type RpcResponse,
  type SignMultipleTransactionsResponse,
  type SignTransactionResponse,
} from '@sats-connect/core';
import { nanoid } from 'nanoid';
import * as v from 'valibot';
import { isValidLegacyEvent } from './utils';

const SatsMethodsProvider: BitcoinProvider = {
  connect: async (btcAddressRequest): Promise<GetAddressResponse> => {
    const event = new CustomEvent<GetAddressRequestEventDetails>(DomEventName.getAddressRequest, {
      detail: { btcAddressRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<GetAddressResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.getAddressResponse)) return;
        if (eventMessage.data.payload?.addressRequest !== btcAddressRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.addressResponse === 'cancel') {
          reject(eventMessage.data.payload.addressResponse);
          return;
        }
        if (typeof eventMessage.data.payload.addressResponse !== 'string') {
          resolve(eventMessage.data.payload.addressResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signTransaction: async (signPsbtRequest: string): Promise<SignTransactionResponse> => {
    const event = new CustomEvent<SignPsbtRequestEventDetails>(DomEventName.signPsbtRequest, {
      detail: { signPsbtRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignPsbtResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.signPsbtResponse)) return;
        if (eventMessage.data.payload?.signPsbtRequest !== signPsbtRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signPsbtResponse === 'cancel') {
          reject(eventMessage.data.payload.signPsbtResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signPsbtResponse !== 'string') {
          resolve(eventMessage.data.payload.signPsbtResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signMultipleTransactions: async (
    signBatchPsbtRequest: string,
  ): Promise<SignMultipleTransactionsResponse> => {
    const event = new CustomEvent<SignBatchPsbtRequestEventDetails>(
      DomEventName.signBatchPsbtRequest,
      {
        detail: { signBatchPsbtRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignBatchPsbtResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.signBatchPsbtResponse)) return;
        if (eventMessage.data.payload?.signBatchPsbtRequest !== signBatchPsbtRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signBatchPsbtResponse === 'cancel') {
          reject(eventMessage.data.payload.signBatchPsbtResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signBatchPsbtResponse !== 'string') {
          resolve(eventMessage.data.payload.signBatchPsbtResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  signMessage: async (signMessageRequest: string): Promise<string> => {
    const event = new CustomEvent<SignMessageRequestEventDetails>(DomEventName.signMessageRequest, {
      detail: { signMessageRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SignMessageResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.signMessageResponse)) return;
        if (eventMessage.data.payload?.signMessageRequest !== signMessageRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.signMessageResponse === 'cancel') {
          reject(eventMessage.data.payload.signMessageResponse);
          return;
        }
        if (typeof eventMessage.data.payload.signMessageResponse === 'string') {
          resolve(eventMessage.data.payload.signMessageResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  sendBtcTransaction: async (sendBtcRequest: string): Promise<string> => {
    const event = new CustomEvent<SendBtcRequestEventDetails>(DomEventName.sendBtcRequest, {
      detail: { sendBtcRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<SendBtcResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.sendBtcResponse)) return;
        if (eventMessage.data.payload?.sendBtcRequest !== sendBtcRequest) return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.sendBtcResponse === 'cancel') {
          reject(eventMessage.data.payload.sendBtcResponse);
          return;
        }
        if (typeof eventMessage.data.payload.sendBtcResponse === 'string') {
          resolve(eventMessage.data.payload.sendBtcResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  createInscription: async (
    createInscriptionRequest: string,
  ): Promise<CreateInscriptionResponse> => {
    const event = new CustomEvent<CreateInscriptionEventDetails>(
      DomEventName.createInscriptionRequest,
      {
        detail: { createInscriptionRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (eventMessage: MessageEvent<CreateInscriptionResponseMessage>) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.createInscriptionResponse)) return;
        if (eventMessage.data.payload?.createInscriptionRequest !== createInscriptionRequest)
          return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.createInscriptionResponse === 'cancel') {
          reject(eventMessage.data.payload.createInscriptionResponse);
          return;
        }
        if (typeof eventMessage.data.payload.createInscriptionResponse !== 'string') {
          resolve(eventMessage.data.payload.createInscriptionResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  createRepeatInscriptions: async (
    createRepeatInscriptionsRequest: string,
  ): Promise<CreateRepeatInscriptionsResponse> => {
    const event = new CustomEvent<CreateRepeatInscriptionsEventDetails>(
      DomEventName.createRepeatInscriptionsRequest,
      {
        detail: { createRepeatInscriptionsRequest },
      },
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (
        eventMessage: MessageEvent<CreateRepeatInscriptionsResponseMessage>,
      ) => {
        if (!isValidLegacyEvent(eventMessage, SatsConnectMethods.createRepeatInscriptionsResponse))
          return;
        if (
          eventMessage.data.payload?.createRepeatInscriptionsRequest !==
          createRepeatInscriptionsRequest
        )
          return;
        window.removeEventListener('message', handleMessage);
        if (eventMessage.data.payload.createRepeatInscriptionsResponse === 'cancel') {
          reject(eventMessage.data.payload.createRepeatInscriptionsResponse);
          return;
        }
        if (typeof eventMessage.data.payload.createRepeatInscriptionsResponse !== 'string') {
          resolve(eventMessage.data.payload.createRepeatInscriptionsResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
  request: async <Method extends keyof Requests>(
    method: Method,
    params: Params<Method>,
  ): Promise<RpcResponse<Method>> => {
    const id = nanoid();
    const rpcRequest: RpcRequest<Method, Params<Method>> = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };
    const rpcRequestEvent = new CustomEvent(DomEventName.rpcRequest, { detail: rpcRequest });
    document.dispatchEvent(rpcRequestEvent);
    return new Promise((resolve) => {
      function handleRpcResponseEvent(message: MessageEvent<unknown>) {
        const parseResult = v.safeParse(rpcResponseMessageSchema, message.data);

        if (!parseResult.success) {
          // Ignore message if it's not an RPC message.
          return;
        }

        const rpcResponseMessage = parseResult.output;

        if (rpcResponseMessage.id !== id) {
          // Ignore message if it's not a response to the current request.
          return;
        }

        window.removeEventListener('message', handleRpcResponseEvent);

        // NOTE: Ideally the response would be runtime type-checked before the
        // promise is resolved since the message crosses a type assertion
        // boundary. For now, since all the responses are typed, it's relatively
        // safe to assume that the message will conform to the expected type.
        return resolve(rpcResponseMessage as RpcResponse<Method>);
      }
      window.addEventListener('message', handleRpcResponseEvent);
    });
  },
};
export default SatsMethodsProvider;
