import AlertMessage from '@components/alertMessage';
import { ChangeShowBtcReceiveAlertAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  onReceiveAlertClose: () => void;
}
function ShowBtcReceiveAlert({ onReceiveAlertClose }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'ADDRESS_RECEIVE_ALERT_MESSAGE' });
  const dispatch = useDispatch();

  const onDontShowReceiveBtcAlert = () => {
    dispatch(ChangeShowBtcReceiveAlertAction(false));
  };

  return (
    <AlertMessage
      title={t('RECEIVING_BTC')}
      description={t('RECEIVING_BTC_INFO')}
      buttonText={t('I_UNDERSTAND')}
      onClose={onReceiveAlertClose}
      onButtonClick={onReceiveAlertClose}
      tickMarkButtonText={t('DO_NOT_SHOW_MESSAGE')}
      tickMarkButtonClick={onDontShowReceiveBtcAlert}
    />
  );
}

export default ShowBtcReceiveAlert;
