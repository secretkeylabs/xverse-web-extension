import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { estimateStacksTransactionWithFallback } from '@secretkeylabs/xverse-core';
import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import FeeSelectPopup from '@ui-components/selectFeeRate/feeSelectPopup';
import { modifyRecommendedStxFees } from '@utils/transactions/transactions';
import { bigIntReplacer } from '../../../../../../../../../utils';
import { MICROSTX_IN_STX } from './transactionDetails/utils';
import { mapObjectValues, microStxToStx } from './utils';

type FeeEditorProps = {
  isOpen: boolean;
  transaction: StacksTransactionWire;
  onClose: () => void;
  onSetFee: (fee: number) => void;
};
export function FeeEditor({ onClose, transaction, onSetFee, isOpen }: FeeEditorProps) {
  const selectedNetwork = useNetworkSelector();
  const { feeMultipliers, fiatCurrency } = useWalletSelector();
  const { data: stxData } = useStxWalletData();

  const { data } = useQuery({
    queryKey: ['estimate-fee-priority', transaction, selectedNetwork, feeMultipliers],
    // We need a custom hash fn b/c `transaction` has bigints, which React
    // Query's default hashing function, JSON.stringify, can't handle.
    queryKeyHashFn: (queryKey) => JSON.stringify(queryKey, bigIntReplacer),
    queryFn: async () => {
      const recommendedFees = (
        await estimateStacksTransactionWithFallback(transaction, selectedNetwork)
      ).map((estimate) => Number(estimate.fee));
      const modifiedFees = modifyRecommendedStxFees(
        { low: recommendedFees[0], medium: recommendedFees[1], high: recommendedFees[2] },
        feeMultipliers,
        transaction.payload.payloadType,
      );
      return modifiedFees;
    },
  });

  if (!isOpen) return null;

  const feePriorityEstimates = (() => {
    if (!data) return {};

    return mapObjectValues(data, microStxToStx);
  })();
  const stxBalance = microStxToStx(stxData?.availableBalance.toString() ?? 0);
  const fee = microStxToStx(transaction.auth.spendingCondition.fee);

  return (
    // NOTE: In the Stacks ecosystem, it is more typical to manage fees than fee
    // rates. The following component, however, is aimed at editing fee rates.
    // Nevertheless, it is used for its UI with the desired fee values; an
    // overload of sorts, to avoid a refactor or writing a new component.
    <FeeSelectPopup
      {...{
        currentFeeRate: fee.toLocaleString(),
        feeUnits: 'STX',
        fiatUnit: fiatCurrency,
        feeRates: feePriorityEstimates,
        onClose,
        absoluteBalance: stxBalance,

        getFeeForFeeRate: (x) => Promise.resolve(Number(x)),
        setFeeRate: (userCustomFeeStx) => {
          const feeMicroStx = Number(userCustomFeeStx) * MICROSTX_IN_STX;
          onSetFee(Math.round(feeMicroStx));
        },

        baseToFiat: () => '', // unused
        selected: null, // unused
        setSelected: () => {}, // unused
      }}
    />
  );
}
