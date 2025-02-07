import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';
import { useTranslation } from 'react-i18next';
import { Layout } from './shared/layout';

type Props = {
  onStart: () => void;
  onBack: () => void;
};
export function Initial({ onStart, onBack }: Props) {
  const { t } = useTranslation();

  const title = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.TITLE');
  const subtitle = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.STX_SUBTITLE');
  const mainLabel = t('LEDGER_VERIFY_SCREEN.CONNECT_BUTTON');
  const secondaryLabel = t('COMMON.BACK');

  return (
    <Layout
      image={{ src: ledgerConnectStxIcon, alt: t('LEDGER_CONNECT.ALT.CONNECT_STX_ALT') }}
      title={title}
      subtitle={subtitle}
      actions={{
        main: { title: mainLabel, onClick: onStart },
        secondary: { title: secondaryLabel, onClick: onBack },
      }}
    />
  );
}
