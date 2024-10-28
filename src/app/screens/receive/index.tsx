import StxIcon from '@assets/img/dashboard/stx_icon.svg';
import BtcIcon from '@assets/img/receive_btc_image.svg';
import OrdinalIcon from '@assets/img/receive_ordinals_image.svg';
import { BtcAddressTypeForAddressLabel } from '@components/btcAddressTypeLabel';
import { GlobalPreferredBtcAddressSheet } from '@components/preferredBtcAddress';
import ShowBtcReceiveAlert from '@components/showBtcReceiveAlert';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import BottomTabBar from '@components/tabBar';
import TooltipCalloutRaw from '@components/tooltip';
import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Check, Copy } from '@phosphor-icons/react';
import QrCode from '@screens/receive/qrCode';
import Callout from '@ui-library/callout';
import { markAlertSeen, shouldShowAlert } from '@utils/alertTracker';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

const OuterContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  columnGap: 16,
});

const AddressTypeContainer = styled.div((props) => ({
  display: 'flex',
  marginBottom: props.theme.space.xs,
}));

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.spacing(3),
  padding: 12,
  background: props.theme.colors.elevation2,
  borderRadius: 24,
  width: 40,
  height: 40,
}));

const TopTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  textAlign: 'center',
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'center',
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(6),
}));

const BnsNameText = styled.h1((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  ...props.theme.typography.body_bold_l,
  textAlign: 'center',
  marginBottom: 4,
}));

const QRCodeContainer = styled.div<{ $marginBottom: number }>((props) => ({
  display: 'flex',
  backgroundColor: props.theme.colors.white['0'],
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  width: 159,
  height: 159,
  alignSelf: 'center',
  marginTop: props.theme.spacing(15),
  marginBottom: props.$marginBottom,
}));

const AddressText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'left',
  color: props.theme.colors.white_200,
  wordBreak: 'break-all',
}));

const BottomBarContainer = styled.div({
  marginTop: 22,
});

const SpacedCallout = styled(Callout)((props) => ({
  marginTop: props.theme.space.s,
}));

const TooltipCallout = styled(TooltipCalloutRaw)(() => ({
  maxWidth: 300,
}));

type SupportedAddresses = 'BTC' | 'STX' | 'ORD';
const validAddresses: SupportedAddresses[] = ['BTC', 'STX', 'ORD'];

function Receive() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress, ordinalsAddress } = selectedAccount;
  const { showBtcReceiveAlert, showOrdinalReceiveAlert, network, btcPaymentAddressType } =
    useWalletSelector();
  const userCanSwitchPaymentType = useCanUserSwitchPaymentType();

  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const [addressCopied, setAddressCopied] = useState(false);
  const [isBtcReceiveAlertVisible, setIsBtcReceiveAlertVisible] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const [showBtcAddressTypeSelectorSheet, setShowBtcAddressTypeSelectorSheet] = useState(false);
  const [showNativeSegWitCallout, setShowNativeSegWitCallout] = useState(
    shouldShowAlert('co:receive:address_changed_to_native'),
  );
  const [showAddressChangeTooltip, setShowAddressChangeTooltip] = useState(
    shouldShowAlert('co:receive:address_change_button'),
  );
  const topBarSettingsRef = useRef<HTMLButtonElement | null>(null);

  const { currency } = useParams<{ currency: SupportedAddresses }>();

  const renderData: Record<
    SupportedAddresses,
    { address: string; title: string; desc: string; icon: string; gradient: string }
  > = {
    BTC: {
      address: btcAddress,
      title: t('BTC_ADDRESS'),
      desc: t('BTC_RECEIVE_MESSAGE'),
      icon: BtcIcon,
      gradient: '#F2A90A',
    },
    STX: {
      address: stxAddress,
      title: t('STX_ADDRESS'),
      desc: t('STX_RECEIVE_MESSAGE'),
      icon: StxIcon,
      gradient: '#FC6432',
    },
    ORD: {
      address: ordinalsAddress,
      title: t('ORDINAL_ADDRESS'),
      desc: t('ORDINALS_RECEIVE_MESSAGE'),
      icon: OrdinalIcon,
      gradient: '#61FF8D',
    },
  };

  const showBnsName = currency === 'STX' && !!selectedAccount?.bnsName;

  const handleBackButtonClick = () => navigate(-1);

  // this should not happen but this is the optimal render to allow back navigation
  if (!currency || !validAddresses.includes(currency)) {
    return (
      <>
        <TopRow title={t('RECEIVE')} onClick={handleBackButtonClick} />
        <BottomBarContainer>
          <BottomTabBar tab="dashboard" />
        </BottomBarContainer>
      </>
    );
  }

  const handleOnClick = () => {
    navigator.clipboard.writeText(renderData[currency].address);
    setAddressCopied(true);
    if (currency === 'BTC' && showBtcReceiveAlert) setIsBtcReceiveAlertVisible(true);
    if (currency === 'ORD' && showOrdinalReceiveAlert) setIsOrdinalReceiveAlertVisible(true);
  };

  const onNativeSegWitCalloutClose = () => {
    setShowNativeSegWitCallout(false);
    markAlertSeen('co:receive:address_changed_to_native');
  };
  const onAddressChangeTooltipClose = () => {
    setShowAddressChangeTooltip(false);
    markAlertSeen('co:receive:address_change_button');
  };
  const showBtcAddressTypeSelector = userCanSwitchPaymentType && currency === 'BTC';

  return (
    <>
      <TopRow
        onClick={handleBackButtonClick}
        onSettingsClick={
          showBtcAddressTypeSelector ? () => setShowBtcAddressTypeSelectorSheet(true) : undefined
        }
        settingsRef={topBarSettingsRef}
      />
      {showBtcAddressTypeSelector && showAddressChangeTooltip && (
        <TooltipCallout
          titleText={t('CALLOUTS.ADDRESS_CHANGE_TOOLTIP.TITLE')}
          bodyText={t('CALLOUTS.ADDRESS_CHANGE_TOOLTIP.DESCRIPTION')}
          onClose={onAddressChangeTooltipClose}
          target={topBarSettingsRef}
          hideIcon
        />
      )}
      <OuterContainer>
        <TopTitleText>{renderData[currency].title}</TopTitleText>
        <DescriptionText>{renderData[currency].desc}</DescriptionText>
        <QRCodeContainer data-testid="qr-container" $marginBottom={showBnsName ? 24 : 30}>
          <QrCode
            image={renderData[currency].icon}
            data={renderData[currency].address}
            gradientColor={renderData[currency].gradient}
          />
        </QRCodeContainer>
        {showBnsName && <BnsNameText>{selectedAccount?.bnsName}</BnsNameText>}
        {currency === 'BTC' && (
          <AddressTypeContainer>
            <BtcAddressTypeForAddressLabel
              address={renderData[currency].address}
              network={network.type}
            />
          </AddressTypeContainer>
        )}
        <AddressContainer>
          <AddressText data-testid="address-label">{renderData[currency].address}</AddressText>
          <Button id={`copy-${renderData[currency].address}`} onClick={handleOnClick}>
            {addressCopied ? <Check color="white" size="20" /> : <Copy color="white" size="20" />}
          </Button>
          <Tooltip
            anchorId={`copy-${renderData[currency].address}`}
            variant="light"
            content={t('COPIED_ADDRESS')}
            events={['click']}
            place="top"
          />
        </AddressContainer>
        {currency === 'BTC' && showNativeSegWitCallout && btcPaymentAddressType === 'native' && (
          <SpacedCallout
            titleText={t('CALLOUTS.NATIVE_SEGWIT.TITLE')}
            bodyText={t('CALLOUTS.NATIVE_SEGWIT.DESCRIPTION')}
            onClose={onNativeSegWitCalloutClose}
            hideIcon
          />
        )}
      </OuterContainer>
      <BottomBarContainer>
        <BottomTabBar tab="dashboard" />
      </BottomBarContainer>
      {isBtcReceiveAlertVisible && (
        <ShowBtcReceiveAlert onReceiveAlertClose={() => setIsBtcReceiveAlertVisible(false)} />
      )}
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert
          onOrdinalReceiveAlertClose={() => setIsOrdinalReceiveAlertVisible(false)}
        />
      )}
      {showBtcAddressTypeSelector && (
        <GlobalPreferredBtcAddressSheet
          visible={showBtcAddressTypeSelectorSheet}
          onHide={() => setShowBtcAddressTypeSelectorSheet(false)}
        />
      )}
    </>
  );
}

export default Receive;
