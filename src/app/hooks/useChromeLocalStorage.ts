import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import chromeStorage from '@utils/chromeStorage';

const useChromeLocalStorage = <T extends unknown>(key: string, defaultValue?: T) => {
  const queryClient = useQueryClient();

  const { data: value, isFetching } = useQuery({
    queryKey: ['chromeLocalStorage', key],
    queryFn: async () => {
      const result = await chromeStorage.local.getItem<T>(key);
      return result === undefined ? defaultValue : result;
    },
    refetchOnWindowFocus: false,
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
