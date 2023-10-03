import { NetworkType, signSimpleBip322Message } from '@secretkeylabs/xverse-core';
import { Transport } from '@secretkeylabs/xverse-core/ledger/types';

export const handleBip322LedgerMessageSigning = async ({
  transport,
  addressIndex,
  networkType,
  message,
}: {
  transport: Transport;
  addressIndex?: number;
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
    message,
  });

  return signature;
};

export const signatureVrsToRsv = (sig: string): string => sig.slice(2) + sig.slice(0, 2);
