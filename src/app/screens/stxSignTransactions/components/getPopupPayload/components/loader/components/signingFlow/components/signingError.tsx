import xCircle from '@assets/img/send/x_circle.svg';
import { useTranslation } from 'react-i18next';
import { Final } from './shared/final';

export function SigningError() {
  const { t } = useTranslation();

  return (
    <Final
      img={{ src: xCircle, alt: 'Error' }}
      heading={t('CONFIRM_TRANSACTION.FAILED_TO_SIGN')}
      buttonText={t('CONFIRM_TRANSACTION.CLOSE')}
    />
  );
}
