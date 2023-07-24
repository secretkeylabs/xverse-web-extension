import { getStxAddressKeyChain } from '@secretkeylabs/xverse-core/wallet';
import { signMessage } from '@secretkeylabs/xverse-core/connect/signature';
import { SignaturePayload } from '@stacks/connect';
import {
  ChainID,
  TupleCV,
  deserializeCV,
  signStructuredData,
  createStacksPrivateKey,
} from '@stacks/transactions';
import { decodeToken } from 'jsontokens';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SignMessagePayload } from 'sats-connect';
import { signBip322Message } from '@secretkeylabs/xverse-core/connect/bip322Signature';
import useWalletSelector from './useWalletSelector';
import useSecretKey from './useSecretKey';

export type SignatureMessageType = 'utf8' | 'structured';

export function isStructuredMessage(
  messageType: SignatureMessageType,
): messageType is 'structured' {
  return messageType === 'structured';
}
export function isUtf8Message(messageType: SignatureMessageType): messageType is 'utf8' {
  return messageType === 'utf8';
}

export function isSignBip322Request(
  requestPayload: SignMessagePayload | SignaturePayload,
): requestPayload is SignMessagePayload {
  return (requestPayload as SignMessagePayload).address !== undefined;
}

function useSignatureRequest() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') || params.get('signMessageRequest');
  const request = decodeToken(requestToken as string);
  const messageType = params.get('messageType') || '';
  const tabId = params.get('tabId') ?? '0';
  return {
    payload: request.payload as any,
    isSignMessageBip322: isSignBip322Request(request.payload as any),
    request: requestToken as string,
    domain: request.payload.domain
      ? deserializeCV(Buffer.from(request.payload.domain, 'hex'))
      : null,
    messageType: messageType as SignatureMessageType,
    tabId,
  };
}

export function useSignMessage(messageType: SignatureMessageType) {
  const { selectedAccount, network } = useWalletSelector();
  const {getSeed} = useSecretKey();
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
        return signMessage(message, privateKey);
      }
      if (!domain) throw new Error('Domain is required for structured messages');
      const sk = createStacksPrivateKey(privateKey);
      const messageDeserialize = deserializeCV(Buffer.from(message, 'hex'));
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

export function useSignBip322Message(message: string, address: string) {
  const { accountsList, network } = useWalletSelector();
  const {getSeed} = useSecretKey();
  return useCallback(async () => {
    const seedPhrase = await getSeed();
   return signBip322Message({
    accounts: accountsList,
    message,
    signatureAddress: address,
    seedPhrase,
    network: network.type,
  })}, []);
}

export default useSignatureRequest;
