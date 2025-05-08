import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';

import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Transport } from '../../../types';
import { Layout } from './shared/layout';

type Props = {
  onCancel: () => void;
  onConnect: (transport: Transport) => void;
  onError: (e: Error) => void;
};
export function Connecting({ onCancel, onConnect, onError }: Props) {
  const { t } = useTranslation();

  const {
    isPending,
    isError,
    error,
    isSuccess,
    data: transport,
  } = useQuery({
    queryKey: ['transport-web-usb-signing-flow'],
    queryFn: () => TransportWebUSB.create(),
    gcTime: 0,
  });

  useEffect(() => {
    if (isPending) return;

    if (isError) {
      onError(error);
      return;
    }

    onConnect(transport);
  }, [transport, isPending, isError, isSuccess, onConnect, onError, error]);

  const title = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.TITLE');
  const subtitle = t('LEDGER_CONFIRM_TRANSACTION_SCREEN.CONNECT.STX_SUBTITLE');
  const mainLabel = t('LEDGER_VERIFY_SCREEN.CONNECT_BUTTON');
  const secondaryLabel = t('COMMON.CANCEL');

  return (
    <Layout
      image={{ src: ledgerConnectStxIcon, alt: t('LEDGER_CONNECT.ALT.CONNECT_STX_ALT') }}
      title={title}
      subtitle={subtitle}
      actions={{
        main: { title: mainLabel, disabled: true, loading: true },
        secondary: { title: secondaryLabel, onClick: onCancel },
      }}
    />
  );
}
