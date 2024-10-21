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
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
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
          setValidationError({
            error: t('ADDRESS_MISMATCH'),
            alignment: 'left',
          });
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
