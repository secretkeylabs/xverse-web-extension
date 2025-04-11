import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { type Inscription } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

/**
 * Get inscription details belonging to an address by ordinalId
 */
const useAddressInscription = (ordinalId?: string, ordinal?: Inscription | null) => {
  const { ordinalsAddress } = useSelectedAccount();
  const xverseApiClient = useXverseApi();

  const fetchOrdinals = async (): Promise<Inscription> => {
    if (ordinal && ordinal.id === ordinalId) return ordinal;
    if (!ordinalsAddress || !ordinalId) {
      throw new InvalidParamsError('ordinalsAddress and ordinalId are required');
    }
    return xverseApiClient.getInscription(ordinalsAddress, ordinalId);
  };

  return useQuery({
    enabled: !!(ordinal || (ordinalsAddress && ordinalId)),
    retry: handleRetries,
    queryKey: ['address-inscription', ordinalsAddress, ordinalId],
    queryFn: fetchOrdinals,
  });
};

export default useAddressInscription;
