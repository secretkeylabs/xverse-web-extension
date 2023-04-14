import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '@secretkeylabs/xverse-core/api/xverse';

const useAppConfig = () => {
  const result = useQuery(['app-config'], () => getAppConfig());
  return result;
};

export default useAppConfig;
