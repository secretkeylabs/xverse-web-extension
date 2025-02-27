import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BitcoinNetworkType,
  type Params,
  type SignMessageOptions,
  type SignMessagePayload,
} from '@sats-connect/core';
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
  const { network, btcPaymentAddressType } = useWalletSelector();
  const { switchAccount } = useWalletReducer();
  const allAccounts = useGetAllAccounts();

  const requestedAccount = allAccounts.find(
    (account) =>
      requestPayload?.address === account.btcAddresses.native?.address ||
      requestPayload?.address === account.btcAddresses.nested?.address ||
      requestPayload?.address === account.btcAddresses.taproot.address,
  );

  const validateSignMessage = () => {
    if (!requestPayload) return;
    if (requestPayload.network.type !== network.type) {
      setValidationError({
        error: t('NETWORK_MISMATCH'),
      });
      return;
    }

    if (!requestedAccount) {
      setValidationError({
        error: t('ADDRESS_MISMATCH'),
      });
      return;
    }

    if (selectedAccount.ordinalsAddress !== requestedAccount.btcAddresses.taproot.address) {
      switchAccount(requestedAccount);
    }

    if (requestPayload?.address === requestedAccount.btcAddresses.taproot.address) {
      return;
    }
    // Skip validation for hardware wallets since they handle address type internally
    if (selectedAccount.accountType === 'software') {
      const isNativeAddress =
        requestPayload?.address === requestedAccount.btcAddresses.native?.address;
      const isNestedAddress =
        requestPayload?.address === requestedAccount.btcAddresses.nested?.address;
      const addressTypeMatches =
        (btcPaymentAddressType === 'native' && isNativeAddress) ||
        (btcPaymentAddressType === 'nested' && isNestedAddress);

      if (!addressTypeMatches) {
        setValidationError({
          error: t('ADDRESS_TYPE_MISMATCH'),
        });
      }
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
