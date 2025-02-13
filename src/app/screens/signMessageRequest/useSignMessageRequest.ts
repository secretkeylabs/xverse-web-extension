import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BitcoinNetworkType,
  type Params,
  type SignMessageOptions,
  type SignMessagePayload,
} from '@sats-connect/core';
import { isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import SuperJSON from 'superjson';

export const useSignMessageRequestParams = () => {
  const { search } = useLocation();
  const { network } = useWalletSelector();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tabId = params.get('tabId') ?? '0';
  const requestId = params.get('requestId') ?? '';
  const payloadToken = params.get('payload') ?? '';

  const { payload, requestToken } = useMemo(() => {
    const token = params.get('signMessageRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as SignMessageOptions;
      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const rpcPayload: SignMessagePayload = {
      ...SuperJSON.parse<Params<'signMessage'>>(payloadToken),
      network: {
        type: network.type as BitcoinNetworkType,
      },
    };

    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, [params, payloadToken, network.type]);

  return { tabId, payload, requestToken, requestId };
};

type ValidationError = {
  error: string;
  errorTitle?: string;
};

export const useSignMessageValidation = (requestPayload: SignMessagePayload | undefined) => {
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const selectedAccount = useSelectedAccount();
  const { accountsList, network, btcPaymentAddressType } = useWalletSelector();
  const { switchAccount } = useWalletReducer();

  const checkAddressAvailability = () => {
    const account = accountsList.filter(
      (acc) =>
        requestPayload?.address === acc.btcAddresses.native?.address ||
        requestPayload?.address === acc.btcAddresses.nested?.address ||
        requestPayload?.address === acc.btcAddresses.taproot.address,
    );
    return isHardwareAccount(selectedAccount) ? account[0] || selectedAccount : account[0];
  };

  const validateSignMessage = () => {
    if (!requestPayload) return;
    if (requestPayload.network.type !== network.type) {
      setValidationError({
        error: t('NETWORK_MISMATCH'),
      });
      return;
    }
    const account = checkAddressAvailability();

    if (!account) {
      setValidationError({
        error: t('ADDRESS_MISMATCH'),
      });
      return;
    }

    if (selectedAccount.ordinalsAddress !== account.btcAddresses.taproot.address) {
      switchAccount(account);
    }

    if (requestPayload?.address === account.btcAddresses.taproot.address) {
      return;
    }

    // ensure we have the correct address type signing on payment address
    if (
      (btcPaymentAddressType === 'native' &&
        requestPayload?.address !== account.btcAddresses.native?.address) ||
      (btcPaymentAddressType === 'nested' &&
        requestPayload?.address !== account.btcAddresses.nested?.address)
    ) {
      setValidationError({
        error: t('ADDRESS_TYPE_MISMATCH'),
      });
    }
  };

  useEffect(() => {
    if (requestPayload) {
      validateSignMessage();
    }
    return () => {
      setValidationError(null);
    };
  }, [requestPayload]);

  return { validationError, validateSignMessage, setValidationError };
};
