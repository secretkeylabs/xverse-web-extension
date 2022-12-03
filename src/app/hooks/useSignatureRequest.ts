import { getStxAddressKeyChain } from '@secretkeylabs/xverse-core/wallet';
import {
  signMessage,
  signStructuredDataMessage,
} from '@secretkeylabs/xverse-core/connect/signature';
import {
  ChainID, ClarityValue, deserializeCV, TupleCV,
} from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useWalletSelector from './useWalletSelector';

export type SignatureMessageType = 'utf8' | 'structured';

export interface SignatureMessage {
  message: string | ClarityValue;
  domain?: TupleCV | undefined;
  messageType: SignatureMessageType;
}

export function isStructuredMessage(
  messageType: SignatureMessageType,
): messageType is 'structured' {
  return messageType === 'structured';
}
export function isUtf8Message(messageType: SignatureMessageType): messageType is 'utf8' {
  return messageType === 'utf8';
}

export function isSignatureMessageType(messageType: unknown): messageType is SignatureMessageType {
  return typeof messageType === 'string' && ['utf8', 'structured'].includes(messageType);
}

function useSignatureRequest() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken);
  const messageType = params.get('messageType');
  const tabId = params.get('tabId') ?? '0';
  return {
    payload: request.payload as any,
    request: requestToken,
    domain: request.payload.domain ? deserializeCV(Buffer.from(request.payload.domain, 'hex')) : null,
    messageType: messageType as SignatureMessageType,
    tabId,
  };
  c
}
export function useSignMessage(messageType: SignatureMessageType) {
  const {
    selectedAccount,
    seedPhrase,
    network,
  } = useWalletSelector();
  return useCallback(
    async ({ message, domain }: { message: string | ClarityValue; domain?: TupleCV }) => {
      if (!selectedAccount) return null;
      const { privateKey } = await getStxAddressKeyChain(
        seedPhrase,
        network.type === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet,
        selectedAccount.id,
      );
      if (messageType === 'utf8' && typeof message === 'string') {
        return signMessage(message, privateKey);
      }
      if (!domain) throw new Error('Domain is required for structured messages');
      return signStructuredDataMessage(message as ClarityValue, domain, privateKey);
    },
    [selectedAccount],
  );
}

export default useSignatureRequest;
