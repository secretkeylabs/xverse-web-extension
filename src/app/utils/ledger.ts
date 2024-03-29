import { NetworkType, signSimpleBip322Message, Transport } from '@secretkeylabs/xverse-core';

export const handleBip322LedgerMessageSigning = async ({
  transport,
  addressIndex,
  address,
  networkType,
  message,
}: {
  transport: Transport;
  addressIndex?: number;
  address: string;
  networkType: NetworkType;
  message: string;
}) => {
  if (addressIndex === undefined) {
    throw new Error('Account not found');
  }

  const signature = await signSimpleBip322Message({
    transport,
    networkType,
    addressIndex,
    address,
    message,
  });

  return signature;
};

export const signatureVrsToRsv = (sig: string): string => sig.slice(2) + sig.slice(0, 2);
