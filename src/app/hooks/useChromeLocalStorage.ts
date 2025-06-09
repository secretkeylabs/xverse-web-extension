import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import chromeStorage from '@utils/chromeStorage';

const useChromeLocalStorage = <T extends unknown>(key: string, defaultValue?: T) => {
  const queryClient = useQueryClient();

  const { data: value, isFetching } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['chromeLocalStorage', key],
    queryFn: async () => {
      const result = await chromeStorage.local.getItem<T>(key);

      if (result === undefined) return defaultValue ?? null;

      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const mutation = useMutation({
    mutationFn: async (newValue: T) => {
      await chromeStorage.local.setItem(key, newValue);
      queryClient.setQueryData(['chromeLocalStorage', key], newValue);
    },
  });

  const setValue = (newValue: T) => {
    mutation.mutate(newValue);
  };

  return [value, setValue, isFetching] as const;
};

export default useChromeLocalStorage;
