import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { getInscription, type Inscription } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';

/**
 * Get inscription details belonging to an address by ordinalId
 */
const useAddressInscription = (ordinalId: string, ordinal?: Inscription | null) => {
  const { ordinalsAddress } = useSelectedAccount();
  const { network } = useWalletSelector();
  const fetchOrdinals = async (): Promise<Inscription> => {
    if (ordinal && ordinal.id === ordinalId) return ordinal;
    if (!ordinalsAddress || !ordinalId) {
      throw new InvalidParamsError('ordinalsAddress and ordinalId are required');
    }
    return getInscription(network.type, ordinalsAddress, ordinalId);
  };

  return useQuery({
    enabled: !!(ordinal || (ordinalsAddress && ordinalId)),
    retry: handleRetries,
    queryKey: ['ordinal-details', ordinalsAddress, ordinalId],
    queryFn: fetchOrdinals,
  });
};

export default useAddressInscription;
