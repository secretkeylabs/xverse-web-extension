import { useQuery } from '@tanstack/react-query';
import useXverseApi from './apiClients/useXverseApi';
import useWalletSelector from './useWalletSelector';

function useFeaturedDapps() {
  const xverseApi = useXverseApi();
  const { network } = useWalletSelector();

  const fetchFeaturedDapps = async () => {
    const response = await xverseApi.getFeaturedDapps();

    const featured = response.find((f) => f.section === 'Featured')?.apps ?? [];
    const recommended = response.find((f) => f.section === 'Recommended')?.apps ?? [];

    const categories = new Set(
      recommended.map((r) => r.category).filter((c): c is string => c !== undefined),
    );

    const tabs = Array.from(categories).map((c: string) => ({
      label: c,
      value: c,
    }));

    return { featured, recommended, tabs };
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['featuredApps', network.type],
    queryFn: fetchFeaturedDapps,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    featured: data?.featured,
    recommended: data?.recommended,
    tabs: data?.tabs,
    isLoading,
    refetch,
  };
}

export default useFeaturedDapps;
