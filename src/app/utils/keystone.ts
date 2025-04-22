import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import {
  signMessageKeystone,
  type MessageSigningProtocols,
  type NetworkType,
} from '@secretkeylabs/xverse-core';

// eslint-disable-next-line import/prefer-default-export
export const handleKeystoneMessageSigning = async ({
  transport,
  addressIndex,
  address,
  networkType,
  message,
  protocol,
  mfp,
  xpub,
}: {
  transport: TransportWebUSB;
  addressIndex?: number;
  address: string;
  networkType: NetworkType;
  message: string;
  protocol?: MessageSigningProtocols;
  mfp: string;
  xpub: {
    btc?: string;
    ordinals?: string;
  };
}) => {
  if (addressIndex === undefined) {
    throw new Error('Account not found');
  }

  const signature = await signMessageKeystone({
    transport,
    networkType,
    accountIndex: 0,
    addressIndex,
    address,
    message,
    protocol,
    mfp,
    xpub,
  });

  return signature;
};
