import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SignTransactionPayload } from 'sats-connect';

type Props = {
  payload: SignTransactionPayload;
  parsedPsbt: btcTransaction.EnhancedPsbt | undefined;
};
const useSignPsbtValidationGate = ({ payload, parsedPsbt }: Props) => {
  const { btcAddress, ordinalsAddress, network } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  useEffect(() => {
    if (!parsedPsbt) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          errorTitle: t('PSBT_CANT_PARSE_ERROR_TITLE'),
          error: t('PSBT_CANT_PARSE_ERROR_DESCRIPTION'),
          browserTx: true,
        },
      });
    }
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
    }
    if (payload.inputsToSign) {
      payload.inputsToSign.forEach((input) => {
        if (input.address !== btcAddress && input.address !== ordinalsAddress) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'BTC',
              error: t('ADDRESS_MISMATCH'),
              browserTx: true,
            },
          });
        }
      });
    }
  });
};

export default useSignPsbtValidationGate;
