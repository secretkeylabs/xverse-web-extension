import { getOrdinalsByAddress } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useOrdinalsByAddress = (address: string) => {
  const fetchOrdinals = async () => {
    const ordinals = await getOrdinalsByAddress(address);
    return ordinals.filter((item) => (item.id !== undefined));
  };

  const {
    data: ordinals, isLoading, refetch,
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
