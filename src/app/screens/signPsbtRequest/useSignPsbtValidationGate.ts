import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { SignTransactionPayload } from '@sats-connect/core';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  payload: SignTransactionPayload | undefined;
  parsedPsbt: btcTransaction.EnhancedPsbt | undefined;
};

type ValidationError = {
  error: string;
  errorTitle?: string;
  alignment?: 'center' | 'left';
};

const useSignPsbtValidationGate = ({ payload, parsedPsbt }: Props) => {
  const { btcAddress, btcAddresses, ordinalsAddress } = useSelectedAccount();
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  useEffect(() => {
    if (!payload) return;
    if (!parsedPsbt) {
      setValidationError({
        error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
        errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
      });
      return;
    }
    if (payload.network.type !== network.type) {
      setValidationError({
        error: t('NETWORK_MISMATCH'),
      });
      return;
    }
    if (payload.inputsToSign) {
      payload.inputsToSign.forEach((input) => {
        if (input.address !== btcAddress && input.address !== ordinalsAddress) {
          if (
            input.address === btcAddresses.native?.address ||
            input.address === btcAddresses.nested?.address
          ) {
            setValidationError({
              errorTitle: t('ADDRESS_TYPE_MISMATCH_TITLE'),
              error: t('ADDRESS_TYPE_MISMATCH'),
              alignment: 'left',
            });
          } else {
            setValidationError({
              error: t('ADDRESS_MISMATCH'),
              errorTitle: t('ADDRESS_MISMATCH_TITLE'),
              alignment: 'left',
            });
          }
        }
      });
      return;
    }
    return () => {
      setValidationError(null);
    };
  }, [payload, parsedPsbt]);

  return { validationError, setValidationError };
};

export default useSignPsbtValidationGate;
