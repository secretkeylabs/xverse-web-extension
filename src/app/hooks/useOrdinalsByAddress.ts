import { getOrdinalsByAddress, type BtcOrdinal } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import useBtcClient from './apiClients/useBtcClient';
import useWalletSelector from './useWalletSelector';

const useOrdinalsByAddress = (address: string) => {
  const { network } = useWalletSelector();
  const btcClient = useBtcClient();

  const fetchOrdinals = async (): Promise<BtcOrdinal[]> => {
    const ordinals = await getOrdinalsByAddress(btcClient, network.type, address);
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
