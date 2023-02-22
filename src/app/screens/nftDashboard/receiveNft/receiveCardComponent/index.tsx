import styled from 'styled-components';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { getShortTruncatedAddress } from '@utils/helper';
import Copy from '@assets/img/nftDashboard/Copy.svg';
import QrCode from '@assets/img/nftDashboard/QrCode.svg';
import { useTranslation } from 'react-i18next';

interface Props {
  icon: string;
  title: string;
  address: string;
  onQrAddressClick: () => void;
}

const ReceiveCard = styled.div((props) => ({
  background: props.theme.colors.background.elevation3,
  borderRadius: 12,
  width: 328,
  height: 104,
  padding: 22,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.spacing(6),
}));

const Button = styled.button((props) => ({
  background: '#3F4263',
  borderRadius: 32,
  width: 44,
  height: 44,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.spacing(4),
  padding: props.theme.spacing(5.5),
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flex: 1,
  marginRight: 30,
  flexDirection: 'column',
});
const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  flex: 2,
});

const Icon = styled.img({
  width: 24,
  height: 24,
});

const ButtonIcon = styled.img({
  width: 22,
  height: 22,
});

const TitleText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  marginTop: props.theme.spacing(3),
  color: props.theme.colors.white[0],
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(1),
  color: props.theme.colors.white[400],
}));

const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

function ReceiveCardComponent({
  icon, title, address, onQrAddressClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const onCopyClick = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <ReceiveCard>
      <ColumnContainer>
        <Icon src={icon} />
        <TitleText>{title}</TitleText>
        <AddressText>{getShortTruncatedAddress(address)}</AddressText>
      </ColumnContainer>
      <RowContainer>
        <Button id={`copy-address-${title}`} onClick={onCopyClick}>
          <ButtonIcon src={Copy} />
        </Button>
        <StyledToolTip
          anchorId={`copy-address-${title}`}
          variant="light"
          content={t('COPIED')}
          events={['click']}
          place="top"
        />
        <Button onClick={onQrAddressClick}>
          <ButtonIcon src={QrCode} />
        </Button>
      </RowContainer>

    </ReceiveCard>
  );
}

export default ReceiveCardComponent;
