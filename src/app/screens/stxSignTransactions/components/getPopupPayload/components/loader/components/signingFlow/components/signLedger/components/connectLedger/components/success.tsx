import ledgerConnectDoneIcon from '@assets/img/ledger/ledger_import_connect_done.svg';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './shared/layout';

type Props = {
  onFinish: () => void;
};

const onFinishTimeout = 500;

export function Success({ onFinish }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, onFinishTimeout);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  const title = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.TITLE');
  const subtitle = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.STX_SUBTITLE');
  const mainLabel = t('LEDGER_VERIFY_SCREEN.CONNECT_BUTTON');
  const secondaryLabel = t('COMMON.CANCEL');

  return (
    <Layout
      image={{ src: ledgerConnectDoneIcon, alt: t('LEDGER_CONNECT.ALT.CONNECT_SUCCESS_ALT') }}
      title={title}
      subtitle={subtitle}
      actions={{
        main: { title: mainLabel, disabled: true },
        secondary: { title: secondaryLabel, disabled: true },
      }}
    />
  );
}
