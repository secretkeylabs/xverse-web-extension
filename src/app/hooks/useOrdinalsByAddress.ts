import { getOrdinalsByAddress } from '@secretkeylabs/xverse-core/api/xverse';
import { BtcOrdinal } from '@secretkeylabs/xverse-core/types';
import { useQuery } from '@tanstack/react-query';

const useOrdinalsByAddress = (address: string) => {
  const fetchOrdinals = async (): Promise<BtcOrdinal[]> => {
    const ordinals = await getOrdinalsByAddress(address);
    return ordinals.filter((item) => item.id !== undefined);
  };

  const {
    data: ordinals,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`ordinals-${address}`],
    queryFn: fetchOrdinals,
  });

  return {
    ordinals,
    isLoading,
    refetch,
  };
};

export default useOrdinalsByAddress;
