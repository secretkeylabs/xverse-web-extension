import BitcoinToken from '@assets/img/dashboard/bitcoin_token.svg';
import ordinalsIcon from '@assets/img/dashboard/ordinalBRC20.svg';
import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import ReceiveCardComponent from '@components/receiveCardComponent';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { InputFeedback } from '@ui-library/inputFeedback';
import Sheet from '@ui-library/sheet';
import { markAlertSeen, shouldShowAlert } from '@utils/alertTracker';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Icon,
  IconBackground,
  InfoMessageContainer,
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
  const { t: informationT } = useTranslation('translation', {
    keyPrefix: 'INFORMATION',
  });

  const selectedAccount = useSelectedAccount();
  const { stxAddress, btcAddress, ordinalsAddress } = selectedAccount;
  const { btcPaymentAddressType, hasBackedUpWallet } = useWalletSelector();
  const navigate = useNavigate();

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
    trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
      addressType: 'btc_payment',
      source: 'dashboard',
    });
    navigate('/receive/BTC');
  };

  const onSTXReceiveSelect = () => {
    trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
      addressType: 'stx',
      source: 'dashboard',
    });
    navigate('/receive/STX');
  };

  const onOrdinalsReceivePress = () => {
    trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
      addressType: 'btc_ordinals',
      source: 'dashboard',
    });
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
        receiveModalClose={onReceiveModalClose}
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
        receiveModalClose={onReceiveModalClose}
        showVerifyButton={choseToVerifyAddresses}
        currency="ORD"
        icon={<MergedOrdinalsIcon src={ordinalsIcon} />}
      />

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_AND_TOKEN')}
          address={stxAddress}
          onQrAddressClick={onSTXReceiveSelect}
          receiveModalClose={onReceiveModalClose}
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
    <Sheet visible={visible} title={t('RECEIVE')} onClose={onReceiveModalClose}>
      {!hasBackedUpWallet && (
        <InfoMessageContainer>
          <Link to={RoutePaths.BackupWallet}>
            <InputFeedback message={informationT('WALLET_NOT_BACKED_UP')} variant="warning" />
          </Link>
        </InfoMessageContainer>
      )}
      {areReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </Sheet>
  );
}

export default ReceiveSheet;
