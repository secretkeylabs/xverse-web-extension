import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { FeesMultipliers } from '@secretkeylabs/xverse-core/types';
import { fetchAppInfo } from '@secretkeylabs/xverse-core/api';
import { setFeeMultiplierAction } from '@stores/wallet/actions/actionCreators';

export const useFeeMultipliers = () => {
  const dispatch = useDispatch();

  const fetchFeeMultiplierData = async (): Promise<FeesMultipliers> => {
    try {
      const response: FeesMultipliers = await fetchAppInfo();
      dispatch(setFeeMultiplierAction(response));
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return useQuery({
    queryKey: ['fee_multipliers'],
    queryFn: fetchFeeMultiplierData,
  });
};

export default useFeeMultipliers;
