import { useEffect, useState } from 'react';
import { SettingsNetwork, validateStxAddress } from '@secretkeylabs/xverse-core';
import {
  fetchAddressOfBnsName, getBnsName,
} from '@secretkeylabs/xverse-core/api';
import useWalletSelector from './useWalletSelector';

export const useBnsName = (walletAddress: string, network: SettingsNetwork) => {
  const [bnsName, setBnsName] = useState('');

  useEffect(() => {
    (async () => {
      const name = await getBnsName(walletAddress, network);
      setBnsName(name ?? '');
    })();
  }, [walletAddress]);

  return bnsName;
};

export const useBNSResolver = (
  recipientAddress: string,
  walletAddress: string,
  currencyType: string,
) => {
  const { network } = useWalletSelector();
  const [associatedAddress, setAssociatedAddress] = useState('');

  useEffect(() => {
    (async () => {
      if (currencyType !== 'BTC') {
        if (!validateStxAddress({ stxAddress: recipientAddress, network })) {
          const address = await fetchAddressOfBnsName(
            recipientAddress.toLocaleLowerCase(),
            walletAddress.toLocaleLowerCase(),
            network,
          );
          setAssociatedAddress(address ?? '');
        } else {
          setAssociatedAddress('');
        }
      } else {
        setAssociatedAddress('');
      }
    })();
  }, [recipientAddress]);

  return associatedAddress;
};

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
