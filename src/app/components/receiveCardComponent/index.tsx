import Copy from '@assets/img/nftDashboard/Copy.svg';
import QrCode from '@assets/img/nftDashboard/QrCode.svg';
import Tick from '@assets/img/tick.svg';
import ActionButton from '@components/button';
import { getShortTruncatedAddress } from '@utils/helper';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import styled from 'styled-components';

const ReceiveCard = styled.div((props) => ({
  background: props.theme.colors.elevation6_600,
  borderRadius: props.theme.radius(2),
  width: 328,
  height: 104,
  padding: props.theme.space.m,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const Button = styled.button((props) => ({
  background: props.theme.colors.elevation6,
  borderRadius: props.theme.radius(7),
  width: 40,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.space.xs,
  padding: props.theme.spacing(5.5),
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
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white_400,
}));

const StyledTooltip = styled(Tooltip)`
  background-color: ${(props) => props.theme.colors.white_0};
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

const VerifyButtonContainer = styled.div({
  width: 68,
});

type Props = {
  className?: string;
  title: string;
  address: string;
  onQrAddressClick: () => void;
  children: ReactNode;
  onCopyAddressClick?: () => void;
  showVerifyButton?: boolean;
  currency?: string;
};

function ReceiveCardComponent({
  className,
  children,
  title,
  address,
  onQrAddressClick,
  onCopyAddressClick,
  showVerifyButton,
  currency,
}: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  let addressText = 'Receive Ordinals, Runes & BRC20 tokens';

  if (currency === 'BTC') addressText = 'Receive payments in BTC';
  if (currency === 'STX') addressText = 'Receive STX, Stacks NFTs & SIP-10';

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  const onCopyClick = () => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    if (onCopyAddressClick) onCopyAddressClick();
  };

  return (
    <ReceiveCard data-testid="address-div" className={className}>
      <ColumnContainer>
        {children}
        <TitleText>{title}</TitleText>
        <AddressText data-testid="address-label">
          {showVerifyButton ? addressText : getShortTruncatedAddress(address)}
        </AddressText>
      </ColumnContainer>
      {showVerifyButton ? (
        <VerifyButtonContainer>
          <ActionButton
            transparent
            text="Verify"
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
            {isCopied ? <ButtonIcon src={Tick} /> : <ButtonIcon src={Copy} />}
          </Button>
          <StyledTooltip
            anchorId={`copy-address-${title}`}
            variant="light"
            content={t('COPIED')}
            events={['click']}
            place="top"
            hidden={!isCopied}
          />
          <Button data-testid="qr-button" onClick={onQrAddressClick}>
            <ButtonIcon src={QrCode} />
          </Button>
        </RowContainer>
      )}
    </ReceiveCard>
  );
}

export default ReceiveCardComponent;
