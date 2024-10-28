import * as btc from '@scure/btc-signer';
import type { BtcAddressType, NetworkType } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

const LabelContainer = styled.p((props) => ({
  ...props.theme.typography.body_medium_s,
  color: 'white_0',
  backgroundColor: props.theme.colors.white_900,
  borderRadius: '6px',
  padding: '3px 8px',
}));

const labelMap: Record<BtcAddressType, string> = {
  native: 'Native SegWit',
  nested: 'Nested SegWit',
  taproot: 'Ordinals',
};

// TODO: centralize this tooltip with the styles
const StyledTooltip = styled(Tooltip)`
  ${(props) => props.theme.typography.body_bold_m}
  max-width: 200px;
  background-color: ${(props) => props.theme.colors.white_0};
  color: #12151e;
  border-radius: ${(props) => props.theme.space.s};
  padding: 10px 12px;
`;

type BtcAddressTypeLabelProps = {
  addressType: BtcAddressType;
};

export function BtcAddressTypeLabel({ addressType }: BtcAddressTypeLabelProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'INFORMATION' });
  if (addressType === 'taproot') {
    return (
      <>
        <LabelContainer id="ordinals_address_anchor">{labelMap[addressType]}</LabelContainer>
        <StyledTooltip anchorId="ordinals_address_anchor" variant="light">
          {t('ORDINALS_ADDRESS_TOOLTIP')}
        </StyledTooltip>
      </>
    );
  }
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
