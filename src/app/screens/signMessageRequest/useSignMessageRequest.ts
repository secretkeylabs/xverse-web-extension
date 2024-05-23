import useSeedVault from '@hooks/useSeedVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { BitcoinNetworkType, SignMessageOptions, SignMessagePayload } from '@sats-connect/core';
import { SettingsNetwork, signBip322Message } from '@secretkeylabs/xverse-core';
import { isHardwareAccount } from '@utils/helper';
import { decodeToken } from 'jsontokens';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const useSignMessageRequestParams = (network: SettingsNetwork) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tabId = params.get('tabId') ?? '0';
  const origin = params.get('origin') ?? '';
  const requestId = params.get('requestId') ?? '';

  const { payload, requestToken } = useMemo(() => {
    const token = params.get('signMessageRequest') ?? '';
    if (token) {
      const request = decodeToken(token) as any as SignMessageOptions;
      return {
        payload: request.payload,
        requestToken: token,
      };
    }
    const address = params.get('address') ?? '';
    const message = params.get('message') ?? '';
    const rpcPayload: SignMessagePayload = {
      message,
      address,
      network:
        network.type === 'Mainnet'
          ? {
              type: BitcoinNetworkType.Mainnet,
            }
          : {
              type: BitcoinNetworkType.Testnet,
            },
    };
    return {
      payload: rpcPayload,
      requestToken: null,
    };
  }, []);

  return { tabId, origin, payload, requestToken, requestId };
};

type ValidationError = {
  error: string;
  errorTitle?: string;
};

export const useSignMessageValidation = (requestPayload: SignMessagePayload | undefined) => {
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const { accountsList, selectedAccount, network } = useWalletSelector();
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
    if (account) {
      switchAccount(account);
    } else {
      setValidationError({
        error: t('ADDRESS_MISMATCH'),
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

  return { validationError, validateSignMessage };
};

export const useSignMessageRequest = () => {
  const { network, accountsList } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const { payload, requestToken, tabId, origin, requestId } = useSignMessageRequestParams(network);

  const confirmSignMessage = async () => {
    const { address, message } = payload;
    const seedPhrase = await getSeed();
    return signBip322Message({
      accounts: accountsList,
      message,
      signatureAddress: address,
      seedPhrase,
      network: network.type,
    });
  };

  return {
    payload,
    requestToken,
    tabId,
    origin,
    requestId,
    confirmSignMessage,
  };
};

export function useSignBip322Message(message: string, address: string) {
  const { accountsList, network } = useWalletSelector();
  const { getSeed } = useSeedVault();
  return useCallback(async () => {
    const seedPhrase = await getSeed();
    return signBip322Message({
      accounts: accountsList,
      message,
      signatureAddress: address,
      seedPhrase,
      network: network.type,
    });
  }, []);
}
