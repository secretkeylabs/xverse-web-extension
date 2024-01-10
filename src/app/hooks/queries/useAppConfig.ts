import useWalletSelector from '@hooks/useWalletSelector';
import { getAppConfig } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';

const useAppConfig = () => {
  const { network } = useWalletSelector();

  return useQuery({
    queryKey: ['app-config', network.type],
    queryFn: async () => {
      const response = await getAppConfig(network.type);
      return response;
    },
  });
};

export default useAppConfig;
