import { fetchAppInfo } from '@secretkeylabs/xverse-core/api';
import { AppInfo } from '@secretkeylabs/xverse-core/types';
import { setFeeMultiplierAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

export const useFeeMultipliers = () => {
  const dispatch = useDispatch();

  const fetchFeeMultiplierData = async (): Promise<AppInfo> => {
    const response: AppInfo = await fetchAppInfo();
    dispatch(setFeeMultiplierAction(response));
    return response;
  };

  return useQuery({
    queryKey: ['fee_multipliers'],
    queryFn: fetchFeeMultiplierData,
  });
};

export default useFeeMultipliers;
