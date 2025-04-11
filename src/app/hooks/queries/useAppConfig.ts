import useXverseApi from '@hooks/apiClients/useXverseApi';
import useWalletSelector from '@hooks/useWalletSelector';
import { useQuery } from '@tanstack/react-query';

const useAppConfig = () => {
  const { network } = useWalletSelector();
  const xverseApiClient = useXverseApi();

  return useQuery({
    queryKey: ['app-config', network.type],
    queryFn: async () => {
      const response = await xverseApiClient.getAppConfig();
      return response;
    },
  });
};

export default useAppConfig;
