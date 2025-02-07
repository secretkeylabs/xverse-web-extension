import Copy from '@assets/img/nftDashboard/Copy.svg';
import QrCode from '@assets/img/nftDashboard/QrCode.svg';
import { BtcAddressTypeForAddressLabel } from '@components/btcAddressTypeLabel';
import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { getShortTruncatedAddress } from '@utils/helper';
import { type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ReceiveCard = styled.div((props) => ({
  background: props.theme.colors.elevation6_600,
  borderRadius: props.theme.radius(2),
  width: '100%',
  minHeight: 105,
  padding: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const Button = styled.button((props) => ({
  background: props.theme.colors.white_900,
  borderRadius: props.theme.radius(7),
  width: 40,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.space.xs,
  padding: props.theme.spacing(5.5),
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.white_800,
  },
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});
const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

const ButtonIcon = styled.img({
  width: 22,
  height: 22,
});

const TitleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  marginTop: props.theme.spacing(3),
  color: props.theme.colors.white_0,
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.space.xs,
  alignItems: 'center',
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white_400,
}));

const VerifyButtonContainer = styled.div({
  width: 68,
});

type Props = {
  className?: string;
  title: string;
  address: string;
  onQrAddressClick: () => void;
  children?: ReactNode;
  onCopyAddressClick?: () => void;
  receiveModalClose?: () => void;
  showVerifyButton?: boolean;
  currency?: string;
  icon?: React.ReactNode;
};

function ReceiveCardComponent({
  className,
  children,
  title,
  address,
  onQrAddressClick,
  onCopyAddressClick,
  receiveModalClose,
  showVerifyButton,
  currency,
  icon,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const { network } = useWalletSelector();

  let addressText = 'Receive Ordinals, Runes & BRC20 tokens';

  if (currency === 'BTC') addressText = 'Receive payments in BTC';
  if (currency === 'STX') addressText = 'Receive STX, Stacks NFTs & SIP-10';

  const onCopyClick = () => {
    navigator.clipboard.writeText(address);

    if (receiveModalClose) receiveModalClose();
    if (onCopyAddressClick) onCopyAddressClick();

    toast(commonT('COPIED_TO_CLIPBOARD'));
  };

  return (
    <ReceiveCard data-testid="address-div" className={className}>
      <Container>
        <ColumnContainer>
          {icon}
          <TitleText>
            {title}
            {currency === 'BTC' && (
              <BtcAddressTypeForAddressLabel address={address} network={network.type} />
            )}
          </TitleText>
          <AddressText data-testid="address-label">
            {showVerifyButton ? addressText : getShortTruncatedAddress(address)}
          </AddressText>
        </ColumnContainer>
        {showVerifyButton ? (
          <VerifyButtonContainer>
            <ActionButton
              transparent
              text={t('VERIFY')}
              onPress={async () => {
                await chrome.tabs.create({
                  url: chrome.runtime.getURL(`options.html#/verify-ledger?currency=${currency}`),
                });
              }}
            />
          </VerifyButtonContainer>
        ) : (
          <RowContainer>
            <Button id={`copy-address-${title}`} onClick={onCopyClick}>
              <ButtonIcon src={Copy} />
            </Button>
            <Button data-testid="qr-button" onClick={onQrAddressClick}>
              <ButtonIcon src={QrCode} />
            </Button>
          </RowContainer>
        )}
      </Container>
      {children}
    </ReceiveCard>
  );
}

export default ReceiveCardComponent;
