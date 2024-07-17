import { getStxAddressKeyChain, signStacksMessage } from '@secretkeylabs/xverse-core';
import { SignaturePayload, StructuredDataSignatureRequestOptions } from '@stacks/connect';
import {
  ChainID,
  TupleCV,
  createStacksPrivateKey,
  deserializeCV,
  hexToCV,
  signStructuredData,
} from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useNetworkSelector from './useNetwork';
import useSeedVault from './useSeedVault';
import useSelectedAccount from './useSelectedAccount';
import useWalletSelector from './useWalletSelector';

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
          ? deserializeCV(Buffer.from((request.payload as any).domain, 'hex')) // TODO: fix type error
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
  const { network } = useWalletSelector();
  const { getSeed } = useSeedVault();
  return useCallback(
    async ({ message, domain }: { message: string; domain?: TupleCV }) => {
      const seedPhrase = await getSeed();
      if (!selectedAccount) return null;
      const { privateKey } = await getStxAddressKeyChain(
        seedPhrase,
        network.type === 'Mainnet' ? ChainID.Mainnet : ChainID.Testnet,
        selectedAccount.id,
      );
      if (messageType === 'utf8') {
        return signStacksMessage(message, privateKey);
      }
      if (!domain) throw new Error('Domain is required for structured messages');
      const sk = createStacksPrivateKey(privateKey);
      const messageDeserialize = hexToCV(message);
      const signature = signStructuredData({
        domain,
        message: messageDeserialize,
        privateKey: sk,
      }).data;
      return {
        signature,
        publicKey: selectedAccount.stxPublicKey,
      };
    },
    [selectedAccount],
  );
}

export default useSignatureRequest;
