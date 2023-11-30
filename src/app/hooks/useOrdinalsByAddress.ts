import { BtcOrdinal, getOrdinalsByAddress } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useWalletSelector from './useWalletSelector';

const useOrdinalsByAddress = (address: string) => {
  const { network } = useWalletSelector();
  const fetchOrdinals = async (): Promise<BtcOrdinal[]> => {
    const ordinals = await getOrdinalsByAddress(network.type, address);
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
