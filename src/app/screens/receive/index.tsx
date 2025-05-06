import StarknetIcon from '@assets/img/dashboard/strk_icon.png';
import StxIcon from '@assets/img/dashboard/stx_icon.svg';
import BtcIcon from '@assets/img/receive_btc_image.svg';
import OrdinalIcon from '@assets/img/receive_ordinals_image.svg';
import { BtcAddressTypeForAddressLabel } from '@components/btcAddressTypeLabel';
import { GlobalPreferredBtcAddressSheet } from '@components/preferredBtcAddress';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Check, Copy } from '@phosphor-icons/react';
import QrCode from '@screens/receive/qrCode';
import { contractType } from '@secretkeylabs/xverse-core';
import { markAlertSeen, shouldShowAlert } from '@utils/alertTracker';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Theme from 'theme';
import {
  AddressContainer,
  AddressText,
  AddressTypeContainer,
  BnsNameText,
  BottomBarContainer,
  Button,
  DescriptionText,
  OuterContainer,
  QRCodeContainer,
  SpacedCallout,
  TooltipCallout,
  TopTitleText,
} from './index.styled';

type SupportedAddresses = 'BTC' | 'STX' | 'ORD' | 'STRK';
const validAddresses: SupportedAddresses[] = ['BTC', 'STX', 'ORD', 'STRK'];

function Receive() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress, ordinalsAddress } = selectedAccount;
  const { network, btcPaymentAddressType, hasBackedUpWallet } = useWalletSelector();
  const userCanSwitchPaymentType = useCanUserSwitchPaymentType();

  const starknetAddress = (() => {
    if (selectedAccount.accountType !== 'software') return '';

    // Support undefined strkAddresses during PoC period.
    if (!selectedAccount.strkAddresses) return '';

    return selectedAccount.strkAddresses[contractType.AX040W0G].address;
  })();

  const { t } = useTranslation('translation', { keyPrefix: 'RECEIVE' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const [addressCopied, setAddressCopied] = useState(false);
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
    STRK: {
      address: starknetAddress,
      title: t('STARKNET_ADDRESS'),
      desc: t('STARKNET_ADDRESS_MESSAGE'),
      icon: StarknetIcon,
      gradient: '#2a2a73',
    },
  };

  const showBnsName = currency === 'STX' && !!selectedAccount?.bnsName;

  const handleBackButtonClick = () => navigate(-1);

  const handleOnClick = () => {
    if (!currency) return;

    // eslint-disable-next-line no-console
    navigator.clipboard.writeText(renderData[currency].address).catch(console.error);

    setAddressCopied(true);
    toast(commonT('COPIED_TO_CLIPBOARD'));
    setTimeout(() => {
      setAddressCopied(false);
    }, 2000);
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

  return (
    <>
      <TopRow
        backupReminder={!hasBackedUpWallet}
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
            {addressCopied ? (
              <Check color={Theme.colors.white_0} size={20} />
            ) : (
              <Copy color={Theme.colors.white_0} size={20} />
            )}
          </Button>
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
