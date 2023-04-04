import AlertMessage from '@components/alertMessage';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  ChangeShowBtcReceiveAlertAction,
  ChangeShowOrdinalReceiveAlertAction,
} from '@stores/wallet/actions/actionCreators';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 600,
  width: 360,
  margin: 'auto',
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid rgba(126, 137,171,0.2)',
  boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.35)',
}));

const TestnetContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.theme.colors.background.elevation1,
  paddingTop: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(3),
}));

const TestnetText = styled.h1((props) => ({
  ...props.theme.body_xs,
  textAlign: 'center',
  color: props.theme.colors.white['200'],
}));

function ScreenContainer(): JSX.Element {
  const { network, showBtcReceiveAlert, showOrdinalReceiveAlert } = useWalletSelector();
  const { t } = useTranslation('translation');
  const [dontShowOrdinalReceiveAlert, setDontShowOrdinalReceiveAlert] = useState<boolean>(false);
  const [dontShowBtcReceiveAlert, setDontShowBtcReceiveAlert] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onReceiveAlertClose = () => {
    if (dontShowBtcReceiveAlert) {
      dispatch(ChangeShowBtcReceiveAlertAction(null));
    } else dispatch(ChangeShowBtcReceiveAlertAction(false));
  };

  const onReceiveOrdinalAlertClose = () => {
    if (dontShowOrdinalReceiveAlert) {
      dispatch(ChangeShowOrdinalReceiveAlertAction(null));
    } else dispatch(ChangeShowOrdinalReceiveAlertAction(false));
  };

  const onDontShowReceiveBtcAlert = () => {
    setDontShowBtcReceiveAlert(true);
  };

  const onDontShowReceiveOrdinalAlert = () => {
    setDontShowOrdinalReceiveAlert(true);
  };

  return (
    <RouteContainer>
      {network.type === 'Testnet' && (
        <TestnetContainer>
          <TestnetText>{t('SETTING_SCREEN.TESTNET')}</TestnetText>
        </TestnetContainer>
      )}
      {showBtcReceiveAlert && (
        <AlertMessage
          title={t('ADDRESS_RECEIVE_ALERT_MESSAGE.RECEIVING_BTC')}
          description={t('ADDRESS_RECEIVE_ALERT_MESSAGE.RECEIVING_BTC_INFO')}
          buttonText={t('ADDRESS_RECEIVE_ALERT_MESSAGE.I_UNDERSTAND')}
          onClose={onReceiveAlertClose}
          onButtonClick={onReceiveAlertClose}
          tickMarkButtonText={t('ADDRESS_RECEIVE_ALERT_MESSAGE.DO_NOT_SHOW_MESSAGE')}
          tickMarkButtonClick={onDontShowReceiveBtcAlert}
        />
      )}
      {showOrdinalReceiveAlert && (
        <AlertMessage
          title={t('ADDRESS_RECEIVE_ALERT_MESSAGE.RECEIVING_ORDINALS')}
          description={t('ADDRESS_RECEIVE_ALERT_MESSAGE.RECEIVING_ORDINAL_INFO')}
          buttonText={t('ADDRESS_RECEIVE_ALERT_MESSAGE.I_UNDERSTAND')}
          onClose={onReceiveOrdinalAlertClose}
          onButtonClick={onReceiveOrdinalAlertClose}
          tickMarkButtonText={t('ADDRESS_RECEIVE_ALERT_MESSAGE.DO_NOT_SHOW_MESSAGE')}
          tickMarkButtonClick={onDontShowReceiveOrdinalAlert}
        />
      )}
      <Outlet />
    </RouteContainer>
  );
}

export default ScreenContainer;
