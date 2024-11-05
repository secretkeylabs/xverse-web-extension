import BitcoinToken from '@assets/img/dashboard/bitcoin_token.svg';
import ordinalsIcon from '@assets/img/dashboard/ordinalBRC20.svg';
import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import ReceiveCardComponent from '@components/receiveCardComponent';
import ShowBtcReceiveAlert from '@components/showBtcReceiveAlert';
import ShowOrdinalReceiveAlert from '@components/showOrdinalReceiveAlert';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { markAlertSeen, shouldShowAlert } from '@utils/alertTracker';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Icon,
  IconBackground,
  MergedIcon,
  MergedOrdinalsIcon,
  ReceiveContainer,
  SpacedCallout,
  StacksIcon,
  VerifyButtonContainer,
  VerifyOrViewContainer,
} from './index.styled';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function ReceiveSheet({ visible, onClose }: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'DASHBOARD_SCREEN',
  });

  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress, ordinalsAddress } = selectedAccount;
  const { showBtcReceiveAlert, showOrdinalReceiveAlert, btcPaymentAddressType } =
    useWalletSelector();
  const navigate = useNavigate();

  const [isBtcReceiveAlertVisible, setIsBtcReceiveAlertVisible] = useState(false);
  const [isOrdinalReceiveAlertVisible, setIsOrdinalReceiveAlertVisible] = useState(false);
  const [areReceivingAddressesVisible, setAreReceivingAddressesVisible] = useState(
    !isLedgerAccount(selectedAccount),
  );
  const [choseToVerifyAddresses, setChoseToVerifyAddresses] = useState(false);
  const [showNativeSegWitCallout, setShowNativeSegWitCallout] = useState(
    shouldShowAlert('co:panel:address_changed_to_native'),
  );

  const onReceiveModalClose = () => {
    onClose();

    if (isLedgerAccount(selectedAccount)) {
      setAreReceivingAddressesVisible(false);
      setChoseToVerifyAddresses(false);
    }
  };

  const onBTCReceiveSelect = () => {
    navigate('/receive/BTC');
  };

  const onSTXReceiveSelect = () => {
    navigate('/receive/STX');
  };

  const onOrdinalReceiveAlertOpen = () => {
    if (showOrdinalReceiveAlert) setIsOrdinalReceiveAlertVisible(true);
  };

  const onOrdinalReceiveAlertClose = () => {
    setIsOrdinalReceiveAlertVisible(false);
  };

  const onReceiveAlertClose = () => {
    setIsBtcReceiveAlertVisible(false);
  };

  const onReceiveAlertOpen = () => {
    if (showBtcReceiveAlert) setIsBtcReceiveAlertVisible(true);
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/ORD');
  };

  const onNativeSegWitPanelClose = () => {
    setShowNativeSegWitCallout(false);
    markAlertSeen('co:panel:address_changed_to_native');
  };

  const receiveContent = (
    <ReceiveContainer>
      <ReceiveCardComponent
        title={t('BITCOIN')}
        address={btcAddress}
        onQrAddressClick={onBTCReceiveSelect}
        onCopyAddressClick={onReceiveAlertOpen}
        showVerifyButton={choseToVerifyAddresses}
        currency="BTC"
        icon={<Icon src={BitcoinToken} />}
      >
        {showNativeSegWitCallout && btcPaymentAddressType === 'native' && (
          <SpacedCallout
            titleText={t('CALLOUTS.NATIVE_SEGWIT.TITLE')}
            bodyText={t('CALLOUTS.NATIVE_SEGWIT.DESCRIPTION')}
            onClose={onNativeSegWitPanelClose}
            hideIcon
          />
        )}
      </ReceiveCardComponent>

      <ReceiveCardComponent
        title={t('ORDINALS_AND_BRC20')}
        address={ordinalsAddress}
        onQrAddressClick={onOrdinalsReceivePress}
        onCopyAddressClick={onOrdinalReceiveAlertOpen}
        showVerifyButton={choseToVerifyAddresses}
        currency="ORD"
        icon={<MergedOrdinalsIcon src={ordinalsIcon} />}
      />

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_AND_TOKEN')}
          address={stxAddress}
          onQrAddressClick={onSTXReceiveSelect}
          showVerifyButton={choseToVerifyAddresses}
          currency="STX"
          icon={
            <MergedIcon>
              <StacksIcon src={stacksIcon} />
              <IconBackground>
                <Plus weight="bold" size={12} />
              </IconBackground>
            </MergedIcon>
          }
        />
      )}

      {isLedgerAccount(selectedAccount) && !stxAddress && (
        <Button
          variant="secondary"
          icon={<Plus color="white" size={16} />}
          title={t('ADD_STACKS_ADDRESS')}
          onClick={async () => {
            if (!isInOptions()) {
              await chrome.tabs.create({
                url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
              });
            } else {
              navigate('/add-stx-address-ledger');
            }
          }}
        />
      )}
    </ReceiveContainer>
  );

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <Button
          title={t('VERIFY_ADDRESSES_ON_LEDGER')}
          onClick={() => {
            setChoseToVerifyAddresses(true);
            setAreReceivingAddressesVisible(true);
          }}
        />
      </VerifyButtonContainer>
      <Button
        variant="secondary"
        title={t('VIEW_ADDRESSES')}
        onClick={() => {
          if (choseToVerifyAddresses) {
            setChoseToVerifyAddresses(false);
          }
          setAreReceivingAddressesVisible(true);
        }}
      />
    </VerifyOrViewContainer>
  );

  return (
    <>
      {isBtcReceiveAlertVisible && (
        <ShowBtcReceiveAlert onReceiveAlertClose={onReceiveAlertClose} />
      )}
      {isOrdinalReceiveAlertVisible && (
        <ShowOrdinalReceiveAlert onOrdinalReceiveAlertClose={onOrdinalReceiveAlertClose} />
      )}
      <Sheet visible={visible} title={t('RECEIVE')} onClose={onReceiveModalClose}>
        {areReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
      </Sheet>
    </>
  );
}

export default ReceiveSheet;
