import AlertMessage from '@components/alertMessage';
import useWalletSelector from '@hooks/useWalletSelector';
import { ChangeShowBtcReceiveAlertAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

type Props = {
  onReceiveAlertClose: () => void;
};

function ShowBtcReceiveAlert({ onReceiveAlertClose }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'ADDRESS_RECEIVE_ALERT_MESSAGE' });
  const { showBtcReceiveAlert } = useWalletSelector();
  const dispatch = useDispatch();

  const onToggleReceiveBtcAlert = () => {
    dispatch(ChangeShowBtcReceiveAlertAction(!showBtcReceiveAlert));
  };

  return (
    <AlertMessage
      title={t('RECEIVING_BTC')}
      description={t('RECEIVING_BTC_INFO')}
      buttonText={t('I_UNDERSTAND')}
      onClose={onReceiveAlertClose}
      onButtonClick={onReceiveAlertClose}
      tickMarkButtonText={t('DO_NOT_SHOW_MESSAGE')}
      tickMarkButtonClick={onToggleReceiveBtcAlert}
      tickMarkButtonChecked={!showBtcReceiveAlert ?? false}
    />
  );
}

export default ShowBtcReceiveAlert;
