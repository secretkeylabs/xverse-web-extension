import BitcoinIcon from '@assets/img/dashboard/bitcoin_icon.svg';
import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, useTransition } from '@react-spring/web';
import SelectAccount from '@screens/connect/selectAccount';
import { getAppIconFromWebManifest } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddressPurpose } from 'sats-connect';
import AddressPurposeBox from '../addressPurposeBox';
import PermissionsList from '../permissionsList';
import {
  AddressBoxContainer,
  DapURL,
  HeadingContainer,
  LoaderContainer,
  OuterContainer,
  PermissionsContainer,
  RequestMessage,
  RequestMessagePlaceholder,
  Title,
  TopImage,
} from './index.styled';
import useBtcAddressRequest from './useBtcAddressRequest';

function BtcSelectAddressScreen() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'SELECT_BTC_ADDRESS_SCREEN' });
  const { network, btcAddress, ordinalsAddress, stxAddress, selectedAccount } = useWalletSelector();
  const [appIcon, setAppIcon] = useState<string>('');
  const [isLoadingIcon, setIsLoadingIcon] = useState(false);

  const { payload, origin, approveBtcAddressRequest, cancelAddressRequest } =
    useBtcAddressRequest();
  const appUrl = useMemo(() => origin.replace(/(^\w+:|^)\/\//, ''), [origin]);

  const transition = useTransition(isLoadingIcon, {
    from: { opacity: 0, y: 30 },
    enter: { opacity: 1, y: 0 },
  });

  const confirmCallback = async () => {
    setLoading(true);
    approveBtcAddressRequest();
    window.close();
  };

  const cancelCallback = () => {
    cancelAddressRequest();
    window.close();
  };

  useEffect(() => {
    // Handle address requests to a network that's not currently active
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('NETWORK_MISMATCH_ERROR_TITLE'),
          error: t('NETWORK_MISMATCH_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
    // Handle address requests with an unsupported purpose
    payload.purposes.forEach((purpose) => {
      if (
        purpose !== AddressPurpose.Ordinals &&
        purpose !== AddressPurpose.Payment &&
        purpose !== AddressPurpose.Stacks
      ) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle: t('INVALID_PURPOSE_ERROR_TITLE'),
            error: t('INVALID_PURPOSE_ERROR_DESCRIPTION'),
            browserTx: true,
          },
        });
      }
    });
  }, []);

  useEffect(() => {
    if (origin === '') {
      return;
    }

    setIsLoadingIcon(true);
    getAppIconFromWebManifest(origin)
      .then((manifestAppIcon) => {
        setAppIcon(manifestAppIcon);
      })
      .finally(() => {
        setIsLoadingIcon(false);
      });
  }, [origin]);

  const AddressPurposeRow = useCallback((purpose: AddressPurpose) => {
    if (purpose === AddressPurpose.Payment) {
      return (
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={BitcoinIcon}
          title={t('BITCOIN_ADDRESS')}
          address={btcAddress}
        />
      );
    }
    if (purpose === AddressPurpose.Ordinals) {
      return (
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={OrdinalsIcon}
          title={t('ORDINAL_ADDRESS')}
          address={ordinalsAddress}
        />
      );
    }
    if (purpose === AddressPurpose.Stacks) {
      return (
        <AddressPurposeBox
          key={purpose}
          purpose={purpose}
          icon={stxIcon}
          title={t('STX_ADDRESS')}
          address={stxAddress}
          bnsName={selectedAccount?.bnsName}
        />
      );
    }
  }, []);

  const handleSwitchAccount = () => {
    navigate('/account-list?hideListActions=true');
  };

  if (isLoadingIcon) {
    return (
      <LoaderContainer>
        <Spinner color="white" size={50} />
      </LoaderContainer>
    );
  }

  return (
    <OuterContainer>
      {transition((style) => (
        <animated.div style={style}>
          <HeadingContainer>
            {appIcon !== '' ? <TopImage src={appIcon} alt="Dapp Logo" /> : null}
            <Title>{t('TITLE')}</Title>
            <DapURL>{appUrl}</DapURL>
          </HeadingContainer>
          {payload.message ? (
            <RequestMessage>{payload.message.substring(0, 80)}</RequestMessage>
          ) : (
            <RequestMessagePlaceholder />
          )}
          <SelectAccount account={selectedAccount!} handlePressAccount={handleSwitchAccount} />
          <AddressBoxContainer>{payload.purposes.map(AddressPurposeRow)}</AddressBoxContainer>
          <PermissionsContainer>
            <PermissionsList />
          </PermissionsContainer>
          <StickyHorizontalSplitButtonContainer>
            <Button title={t('CANCEL_BUTTON')} variant="secondary" onClick={cancelCallback} />
            <Button title={t('CONNECT_BUTTON')} loading={loading} onClick={confirmCallback} />
          </StickyHorizontalSplitButtonContainer>
        </animated.div>
      ))}
    </OuterContainer>
  );
}

export default BtcSelectAddressScreen;
