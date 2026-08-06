import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { useApprovalSearchParams } from '@common/utils/popup/useApprovalSearchParams';
import BatchPsbtSigning from '@components/batchPsbtSigning';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { SignMultipleTransactionOptions } from '@sats-connect/core';
import Spinner from '@ui-library/spinner';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.s,
}));

function SignBatchPsbtRequest() {
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const { network } = useWalletSelector();
  const approvalParams = useApprovalSearchParams();
  const params = approvalParams.status === 'ready' ? approvalParams.params : new URLSearchParams();
  const tabId = params.get('tabId') ?? '0';
  const requestToken = params.get('signBatchPsbtRequest') ?? '';

  const payload = useMemo(() => {
    if (approvalParams.status !== 'ready' || !requestToken) {
      return undefined;
    }
    return (decodeToken(requestToken) as any as SignMultipleTransactionOptions).payload;
  }, [approvalParams.status, requestToken]);

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
    if (!payload) {
      return;
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
      return;
    }

    const checkAddressMismatch = (input) => {
      if (
        input.address !== selectedAccount.btcAddress &&
        input.address !== selectedAccount.ordinalsAddress
      ) {
        let errorTitle = '';
        let error = '';
        if (
          selectedAccount.btcAddresses.native?.address === input.address ||
          selectedAccount.btcAddresses.nested?.address === input.address
        ) {
          errorTitle = t('ADDRESS_TYPE_MISMATCH_TITLE');
          error = t('ADDRESS_TYPE_MISMATCH');
        } else {
          errorTitle = t('ADDRESS_MISMATCH_TITLE');
          error = t('ADDRESS_MISMATCH');
        }

        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'BTC',
            errorTitle,
            error,
            browserTx: true,
            textAlignment: 'left',
          },
        });

        return true;
      }
      return false;
    };

    payload.psbts?.some((psbt) => psbt.inputsToSign?.some(checkAddressMismatch));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run this once payload is ready
  }, [payload]);

  if (approvalParams.status === 'loading') {
    return (
      <LoaderContainer>
        <Spinner color="white" size={50} />
      </LoaderContainer>
    );
  }

  if (approvalParams.status === 'error' || !payload) {
    return <div>{approvalParams.status === 'error' ? approvalParams.error : 'Invalid request'}</div>;
  }

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
