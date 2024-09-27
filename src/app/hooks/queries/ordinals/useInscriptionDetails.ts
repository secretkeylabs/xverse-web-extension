import useOrdinalsApi from '@hooks/apiClients/useOrdinalsApi';
import { useQuery } from '@tanstack/react-query';

const useInscriptionDetails = (id: string) => {
  const OrdinalsApi = useOrdinalsApi();
  return useQuery({
    queryKey: [`inscription-details-${id}`],
    queryFn: () => OrdinalsApi.getInscription(id),
  });
};

export default useInscriptionDetails;
