import ledgerConnectFailIcon from '@assets/img/hw/ledger/ledger_import_connect_fail.svg';
import { useTranslation } from 'react-i18next';
import { Layout } from './shared/layout';

type Props = {
  onTryAgain: () => void;
};

export function Error({ onTryAgain }: Props) {
  const { t } = useTranslation();

  return (
    <Layout
      image={{ src: ledgerConnectFailIcon, alt: t('LEDGER_CONNECT.ALT.CONNECT_ERROR_ALT') }}
      title="Error"
      subtitle="Connection failed. Please try again."
      actions={{
        main: { title: t('LEDGER_CONFIRM_TRANSACTION_SCREEN.RETRY_BUTTON'), onClick: onTryAgain },
        secondary: { title: t('COMMON.CANCEL'), onClick: window.close },
      }}
    />
  );
}
