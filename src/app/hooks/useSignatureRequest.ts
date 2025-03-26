import { hex } from '@scure/base';
import { getStxAddressKeyChain, signStacksMessage } from '@secretkeylabs/xverse-core';
import type { SignaturePayload, StructuredDataSignatureRequestOptions } from '@stacks/connect';
import { deserializeCV, hexToCV, signStructuredData, type TupleCV } from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useNetworkSelector from './useNetwork';
import useSelectedAccount from './useSelectedAccount';
import useVault from './useVault';

type SignatureMessageType = 'utf8' | 'structured';

export function isStructuredMessage(
  messageType: SignatureMessageType,
): messageType is 'structured' {
  return messageType === 'structured';
}
export function isUtf8Message(messageType: SignatureMessageType): messageType is 'utf8' {
  return messageType === 'utf8';
}

function useSignatureRequest() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('messageId') ?? '';
  const { stxPublicKey, stxAddress } = useSelectedAccount();
  const selectedNetwork = useNetworkSelector();

  const { payload, domain, messageType, requestToken } = useMemo(() => {
    const token = params.get('request') || params.get('signMessageRequest');
    if (token) {
      const request = decodeToken(token as string);
      const type = params.get('messageType') || '';
      return {
        payload: request.payload as any, // TODO: fix type error
        requestToken: token,
        messageType: type as SignatureMessageType,
        domain: (request.payload as any).domain // TODO: fix type error
          ? deserializeCV(hex.decode((request.payload as any).domain)) // TODO: fix type error
          : null,
      };
    }
    const message = params.get('message') || '';
    const requestDomain = params.get('domain') || '';

    const innerDomain = requestDomain ? (hexToCV(requestDomain) as TupleCV) : undefined;

    const rpcPayload: SignaturePayload | StructuredDataSignatureRequestOptions = {
      message,
      stxAddress,
      domain: innerDomain,
      publicKey: stxPublicKey,
      network: selectedNetwork,
    };
    return {
      payload: rpcPayload,
      messageType: requestDomain ? 'structured' : ('utf8' as SignatureMessageType),
      requestToken: null,
      domain: innerDomain,
    };
  }, [params, stxAddress, stxPublicKey, selectedNetwork]);

  return {
    tabId,
    requestId,
    requestToken,
    payload,
    domain,
    messageType,
  };
}

export function useSignMessage(messageType: SignatureMessageType) {
  const selectedAccount = useSelectedAccount();
  const CurrentNetwork = useNetworkSelector();
  const vault = useVault();

  return useCallback(
    async ({ message, domain }: { message: string; domain?: TupleCV }) => {
      if (!selectedAccount) return null;

      if (selectedAccount.accountType !== 'software') {
        throw new Error('Only software wallets are supported for stx message sign');
      }

      const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(
        selectedAccount.walletId,
      );

      const { privateKey } = await getStxAddressKeyChain(
        CurrentNetwork,
        rootNode,
        derivationType,
        BigInt(selectedAccount.id),
      );
      if (messageType === 'utf8') {
        return signStacksMessage(message, privateKey);
      }
      if (!domain) throw new Error('Domain is required for structured messages');
      const messageDeserialize = hexToCV(message);
      const signature = signStructuredData({
        domain,
        message: messageDeserialize,
        privateKey,
      });
      return {
        signature,
        publicKey: selectedAccount.stxPublicKey,
      };
    },
    [selectedAccount],
  );
}

export default useSignatureRequest;
