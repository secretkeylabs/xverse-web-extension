import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import BatchPsbtSigning from '@components/batchPsbtSigning';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { SignMultipleTransactionOptions } from '@sats-connect/core';
import { decodeToken } from 'jsontokens';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

function SignBatchPsbtRequest() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const { network } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const requestToken = params.get('signBatchPsbtRequest') ?? '';
  const { payload } = decodeToken(requestToken) as any as SignMultipleTransactionOptions;

  const onSigned = (signedPsbts: string[]) => {
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: SatsConnectMethods.signBatchPsbtResponse,
      payload: {
        signBatchPsbtRequest: requestToken,
        signBatchPsbtResponse: signedPsbts.map((psbtBase64) => ({ psbtBase64 })),
      },
    };

    chrome.tabs.sendMessage(+tabId, signingMessage);
  };

  const onCancel = () => {
    const signingMessage = {
      source: MESSAGE_SOURCE,
      method: SatsConnectMethods.signBatchPsbtResponse,
      payload: { signBatchPsbtRequest: requestToken, signBatchPsbtResponse: 'cancel' },
    };

    chrome.tabs.sendMessage(+tabId, signingMessage);
    window.close();
  };

  const onDone = () => {
    window.close();
  };

  useEffect(() => {
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
      return;
    }

    const checkAddressMismatch = (input) => {
      if (
        input.address !== selectedAccount.btcAddress &&
        input.address !== selectedAccount.ordinalsAddress
      ) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            error: t('ADDRESS_MISMATCH'),
            browserTx: true,
            textAlignment: 'left',
          },
        });
        return true;
      }
      return false;
    };

    payload.psbts?.some((psbt) => psbt.inputsToSign?.some(checkAddressMismatch));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run this once on load
  }, []);

  return (
    <BatchPsbtSigning
      psbts={payload.psbts}
      onSigned={onSigned}
      onCancel={onCancel}
      onPostSignDone={onDone}
    />
  );
}

export default SignBatchPsbtRequest;
