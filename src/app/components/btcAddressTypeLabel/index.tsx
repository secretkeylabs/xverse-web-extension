import * as btc from '@scure/btc-signer';
import type { BtcAddressType, NetworkType } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

const LabelContainer = styled.div((props) => ({
  backgroundColor: props.theme.colors.white_900,
  borderRadius: '6px',
  padding: '3px 8px',
}));

const labelMap: Record<BtcAddressType, string> = {
  native: 'Native SegWit',
  nested: 'Nested SegWit',
  taproot: 'Taproot',
};

type BtcAddressTypeLabelProps = {
  addressType: BtcAddressType;
};

export function BtcAddressTypeLabel({ addressType }: BtcAddressTypeLabelProps) {
  return <LabelContainer>{labelMap[addressType]}</LabelContainer>;
}

type BtcAddressTypeForAddressLabelProps = {
  address: string;
  network: NetworkType;
};

export function BtcAddressTypeForAddressLabel({
  address,
  network,
}: BtcAddressTypeForAddressLabelProps) {
  try {
    const addressMetadata = btc
      .Address(network === 'Mainnet' ? btc.NETWORK : btc.TEST_NETWORK)
      .decode(address);

    let addressType: BtcAddressType;

    switch (addressMetadata.type) {
      case 'sh':
        addressType = 'nested';
        break;
      case 'wpkh':
        addressType = 'native';
        break;
      case 'tr':
        addressType = 'taproot';
        break;
      default:
        return null;
    }

    return <BtcAddressTypeLabel addressType={addressType} />;
  } catch (e) {
    return null;
  }
}
