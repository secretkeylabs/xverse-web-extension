import useRunesApi from '@hooks/apiClients/useRunesApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { SubmitRuneSellRequest } from '@secretkeylabs/xverse-core';
import { sanitizeRuneName } from '@utils/helper';
import { useCallback } from 'react';

const useSubmitRuneSellPsbt = () => {
  const { ordinalsAddress, ordinalsPublicKey, btcAddress } = useSelectedAccount();
  const runesApi = useRunesApi();

  const submitRuneSellPsbt = useCallback(
    async (signedPsbtBase64: string, runeName: string) => {
      const expiresAt = new Date();
      const sanitizedRuneName = sanitizeRuneName(runeName);
      // setting the expiration date to 10 days from now
      expiresAt.setDate(expiresAt.getDate() + 10);
      const args: SubmitRuneSellRequest = {
        side: 'sell',
        symbol: sanitizedRuneName,
        signedPsbtBase64,
        makerRunesPublicKey: ordinalsPublicKey,
        makerRunesAddress: ordinalsAddress,
        makerReceiveAddress: btcAddress,
        expiresAt: expiresAt.toISOString(),
      };
      return runesApi.submitRunesSellOrder(args);
    },
    [btcAddress, ordinalsAddress, ordinalsPublicKey, runesApi],
  );

  return { submitRuneSellPsbt };
};

export default useSubmitRuneSellPsbt;
