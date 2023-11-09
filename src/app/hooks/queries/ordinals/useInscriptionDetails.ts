import useOrdinalsApi from '@hooks/useOrdinalsApi';
import { useQuery } from '@tanstack/react-query';

const useInscriptionDetails = (id: string) => {
  const OrdinalsApi = useOrdinalsApi();

  return useQuery({
    queryKey: [`inscription-${id}`],
    queryFn: async () => {
      const response = await OrdinalsApi.getInscription(id);
      return response;
    },
  });
};

export default useInscriptionDetails;
