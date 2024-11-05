import AlertMessage from '@components/alertMessage';
import useWalletSelector from '@hooks/useWalletSelector';
import { ChangeShowOrdinalReceiveAlertAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

type Props = {
  onOrdinalReceiveAlertClose: () => void;
};

function ShowOrdinalReceiveAlert({ onOrdinalReceiveAlertClose }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'ADDRESS_RECEIVE_ALERT_MESSAGE' });
  const { showOrdinalReceiveAlert } = useWalletSelector();
  const dispatch = useDispatch();

  const onToggleReceiveOrdinalAlert = () => {
    dispatch(ChangeShowOrdinalReceiveAlertAction(!showOrdinalReceiveAlert));
  };

  return (
    <AlertMessage
      title={t('RECEIVING_ORDINALS')}
      description={t('RECEIVING_ORDINAL_INFO')}
      buttonText={t('I_UNDERSTAND')}
      onClose={onOrdinalReceiveAlertClose}
      onButtonClick={onOrdinalReceiveAlertClose}
      tickMarkButtonText={t('DO_NOT_SHOW_MESSAGE')}
      tickMarkButtonClick={onToggleReceiveOrdinalAlert}
      tickMarkButtonChecked={!showOrdinalReceiveAlert}
    />
  );
}

export default ShowOrdinalReceiveAlert;
