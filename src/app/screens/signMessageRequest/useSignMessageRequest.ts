import useSeedVault from '@hooks/useSeedVault';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BitcoinNetworkType,
  type Params,
  type SignMessageOptions,
  type SignMessagePayload,
} from '@sats-connect/core';
import { signMessage } from '@secretkeylabs/xverse-core';
import { isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import SuperJSON from 'superjson';

const useSignMessageRequestParams = () => {
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
  const { accountsList, network } = useWalletSelector();
  const { btcAddress } = useSelectedAccount();
  const { switchAccount } = useWalletReducer();

  const checkAddressAvailability = () => {
    const account = accountsList.filter((acc) => {
      if (acc.btcAddress === requestPayload?.address) {
        return true;
      }
      if (acc.ordinalsAddress === requestPayload?.address) {
        return true;
      }
      return false;
    });
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

    if (btcAddress === account.btcAddress) return;

    switchAccount(account);
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

export const useSignMessageRequest = () => {
  const { network, accountsList } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const { payload, requestToken, tabId, requestId } = useSignMessageRequestParams();

  const confirmSignMessage = async () => {
    const { address, message } = payload;
    const seedPhrase = await getSeed();
    return signMessage({
      accounts: accountsList,
      message,
      address,
      protocol: payload.protocol,
      seedPhrase,
      network: network.type,
    });
  };

  return {
    payload,
    requestToken,
    tabId,
    requestId,
    confirmSignMessage,
  };
};
