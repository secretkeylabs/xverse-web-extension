import useWalletSelector from '@hooks/useWalletSelector';
import type { AppInfo } from '@secretkeylabs/xverse-core';
import { getXverseApiClient } from '@secretkeylabs/xverse-core';
import { setFeeMultiplierAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

const useFeeMultipliers = () => {
  const { network } = useWalletSelector();
  const xverseApi = getXverseApiClient(network.type);
  const dispatch = useDispatch();

  const fetchFeeMultiplierData = async (): Promise<AppInfo> => {
    const response = await xverseApi.fetchAppInfo();
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
