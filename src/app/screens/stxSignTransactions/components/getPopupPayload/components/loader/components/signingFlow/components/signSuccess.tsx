import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import type { StacksTransactionWire } from '@stacks/transactions';
import { useTranslation } from 'react-i18next';
import { Final } from './shared/final';

type Props = {
  transactions: StacksTransactionWire[];
  isBroadcastRequested: boolean;
};
export function SignSuccess({ transactions, isBroadcastRequested }: Props) {
  const { t: t1 } = useTranslation('translation', { keyPrefix: 'TRANSACTION_STATUS' });
  const { t: t2 } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const title = (() => {
    if (isBroadcastRequested)
      return transactions.length > 1 ? t1('BROADCASTED_MULTIPLE') : t1('BROADCASTED');

    return transactions.length > 1 ? t2('TRANSACTIONS_SIGNED') : t2('TRANSACTION_SIGNED');
  })();

  return (
    <Final
      img={{ src: checkCircleIcon, alt: 'Success' }}
      heading={title}
      buttonText={t1('CLOSE')}
    />
  );
}
