import xCircleIcon from '@assets/img/send/x_circle.svg';
import { useTranslation } from 'react-i18next';
import { Final } from './shared/final';

export function BroadcastError() {
  const { t: tStatus } = useTranslation('translation', { keyPrefix: 'TRANSACTION_STATUS' });
  const { t: tConfirm } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  return (
    <Final
      img={{ src: xCircleIcon, alt: 'Error' }}
      heading={tConfirm('SOME_TRANSACTIONS_FAILED_TO_BROADCAST')}
      buttonText={tStatus('CLOSE')}
    />
  );
}
