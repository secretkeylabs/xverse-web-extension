import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import ordinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import ReceiveCardComponent from '@components/receiveCardComponent';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { Plus } from '@phosphor-icons/react';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.xl,
  gap: props.theme.space.m,
}));

const Icon = styled.img({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 2,
  left: 0,
  top: 0,
});

const IconContainer = styled.div((props) => ({
  position: 'relative',
  marginBottom: props.theme.space.l,
}));

const IconBackground = styled.div((props) => ({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 1,
  left: 20,
  top: 0,
  backgroundColor: props.theme.colors.white_900,
  borderRadius: 30,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const VerifyOrViewContainer = styled.div((props) => ({
  margin: props.theme.space.m,
  marginTop: props.theme.space.xl,
  marginBottom: props.theme.space.xxl,
}));

const VerifyButtonContainer = styled.div((props) => ({
  minWidth: 300,
  marginBottom: props.theme.space.s,
}));

type Props = {
  visible: boolean;
  onClose: () => void;
};

function ReceiveNftModal({ visible, onClose }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { stxAddress, ordinalsAddress } = selectedAccount;
  const [isReceivingAddressesVisible, setIsReceivingAddressesVisible] = useState(
    !isLedgerAccount(selectedAccount),
  );
  const [choseToVerifyAddresses, setChoseToVerifyAddresses] = useState(false);

  const onReceivePress = () => {
    trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
      addressType: 'stx',
      source: 'collectibles',
    });
    navigate('/receive/STX');
  };

  const onOrdinalsReceivePress = () => {
    trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
      addressType: 'btc_ordinals',
      source: 'collectibles',
    });
    navigate('/receive/ORD');
  };

  const handleReceiveModalClose = () => {
    if (isLedgerAccount(selectedAccount)) {
      setIsReceivingAddressesVisible(false);
    }

    if (choseToVerifyAddresses) {
      setChoseToVerifyAddresses(false);
    }

    onClose();
  };

  const handleReceiveModalOpen = () => {
    setIsReceivingAddressesVisible(true);
  };

  const handleVerifyAddresses = () => {
    setChoseToVerifyAddresses(true);
    handleReceiveModalOpen();
  };

  const receiveContent = (
    <ColumnContainer>
      {ordinalsAddress && (
        <ReceiveCardComponent
          title={t('ORDINALS')}
          address={ordinalsAddress}
          onQrAddressClick={onOrdinalsReceivePress}
          receiveModalClose={handleReceiveModalClose}
          showVerifyButton={choseToVerifyAddresses}
          currency="ORD"
          icon={
            <IconContainer>
              <Icon src={ordinalsIcon} />
              <IconBackground>
                <Plus weight="bold" size={12} />
              </IconBackground>
            </IconContainer>
          }
        />
      )}

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_NFT')}
          address={stxAddress}
          onQrAddressClick={onReceivePress}
          receiveModalClose={handleReceiveModalClose}
          showVerifyButton={choseToVerifyAddresses}
          currency="STX"
          icon={
            <IconContainer>
              <Icon src={stacksIcon} />
              <IconBackground>
                <Plus weight="bold" size={12} />
              </IconBackground>
            </IconContainer>
          }
        />
      )}

      {isLedgerAccount(selectedAccount) && !stxAddress && (
        <Button
          variant="secondary"
          icon={<Plus weight="bold" size={16} />}
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
    </ColumnContainer>
  );

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <Button
          title={t('VERIFY_ADDRESS_ON_LEDGER')}
          onClick={
            !stxAddress
              ? async () => {
                  if (isInOptions()) {
                    navigate('/verify-ledger?currency=ORD');
                  } else {
                    await chrome.tabs.create({
                      url: chrome.runtime.getURL(`options.html#/verify-ledger?currency=ORD`),
                    });
                  }
                }
              : handleVerifyAddresses
          }
        />
      </VerifyButtonContainer>
      <Button variant="secondary" title={t('VIEW_ADDRESS')} onClick={handleReceiveModalOpen} />
    </VerifyOrViewContainer>
  );

  return (
    <Sheet visible={visible} title={t('RECEIVE_NFT')} onClose={handleReceiveModalClose}>
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </Sheet>
  );
}

export default ReceiveNftModal;
