import FiatAmountText from '@components/fiatAmountText';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { useGetTransactionFeePriority } from '@screens/stxSignTransactions/hooks';
import { getStxFiatEquivalent } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import { microStxToStx } from '../../../../../utils';
import { FeeLogic, type FeeLogicProps } from './feeLogic';
import type { Props } from './types';

export function FeeLoader({ transaction, onEdit: onEditProp }: Props) {
  const { data: feePriority } = useGetTransactionFeePriority(transaction);
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { fiatCurrency } = useWalletSelector();
  const feeMicroStx = transaction.auth.spendingCondition.fee;
  const feeStx = microStxToStx(feeMicroStx);

  const { data: feeInCurrencyAmount } = useQuery({
    queryKey: [
      `currency-conversion-STX-${fiatCurrency}`,
      // Needs `toString` b/c `queryKey` may only contain JSON-serializable values
      feeMicroStx.toString(),
      stxBtcRate,
      btcFiatRate,
    ] as const,
    queryFn: ({ queryKey: [, fromAmount] }) =>
      getStxFiatEquivalent(
        BigNumber(fromAmount),
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
      ).toString(),
  });

  const onEdit = onEditProp && (() => onEditProp(transaction));
  const fee = <NumericFormat value={feeStx} displayType="text" thousandSeparator suffix=" STX" />;

  const feeInCurrency = feeInCurrencyAmount && (
    <FiatAmountText fiatAmount={BigNumber(feeInCurrencyAmount)} fiatCurrency={fiatCurrency} />
  );

  const childProps: FeeLogicProps = {
    fee,
    feePriority,
    feeInCurrency,
    onEdit,
  };

  return <FeeLogic {...childProps} />;
}
