import { useQuery } from '@tanstack/react-query';
import useOrdinalsApi from '@hooks/useOrdinalsApi';

const useInscriptionDetails = (id: string) => {
  const OrdinalsApi = useOrdinalsApi();

  return useQuery([`inscription-${id}`], async () => {
    try {
      const response = await OrdinalsApi.getInscription(id);
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  });
};

export default useInscriptionDetails;
