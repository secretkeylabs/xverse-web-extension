import useWalletSelector from '@hooks/useWalletSelector';
import type { AppInfo, StacksTransaction } from '@secretkeylabs/xverse-core';
import { fetchAppInfo } from '@secretkeylabs/xverse-core';
import { getFee } from '@stacks/transactions';
import { setFeeMultiplierAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

export const useFeeMultipliers = () => {
  const { network } = useWalletSelector();
  const dispatch = useDispatch();

  const fetchFeeMultiplierData = async (): Promise<AppInfo> => {
    const response = await fetchAppInfo(network.type);
    if (!response) throw new Error('Failed to fetch fee multipliers');

    dispatch(setFeeMultiplierAction(response));
    return response;
  };

  return useQuery({
    queryKey: ['fee_multipliers'],
    queryFn: fetchFeeMultiplierData,
  });
};

export default useFeeMultipliers;

export const applyFeeMultiplier = (
  unsignedTx: StacksTransaction,
  feeMultipliers: AppInfo | null,
) => {
  if (!feeMultipliers) {
    return;
  }
  const fee = getFee(unsignedTx.auth);
  if (feeMultipliers?.stxSendTxMultiplier) {
    const newFee = fee * BigInt(feeMultipliers.stxSendTxMultiplier);
    // TODO remove this check once fee multipliers are lowered again
    // we switched to using estimated network fees,
    // so need this while fee multipliers are still very high
    if (newFee < BigInt(feeMultipliers.thresholdHighStacksFee)) {
      unsignedTx.setFee(newFee);
    }
  }
};

export const useApplyFeeMultiplier = () => {
  const { feeMultipliers } = useWalletSelector();

  return (unsignedTx: StacksTransaction) => applyFeeMultiplier(unsignedTx, feeMultipliers);
};
