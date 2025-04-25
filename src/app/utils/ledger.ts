import {
  MessageSigningProtocols,
  signMessageLedger,
  type LedgerTransport,
  type NetworkType,
} from '@secretkeylabs/xverse-core';

export const handleLedgerMessageSigning = async ({
  transport,
  addressIndex,
  address,
  networkType,
  message,
  protocol,
}: {
  transport: LedgerTransport;
  addressIndex?: number;
  address: string;
  networkType: NetworkType;
  message: string;
  protocol?: MessageSigningProtocols;
}) => {
  if (addressIndex === undefined) {
    throw new Error('Account not found');
  }

  const signature = await signMessageLedger({
    transport,
    networkType,
    accountIndex: 0,
    addressIndex,
    address,
    message,
    protocol,
  });

  return signature;
};

export const signatureVrsToRsv = (sig: string): string => sig.slice(2) + sig.slice(0, 2);
