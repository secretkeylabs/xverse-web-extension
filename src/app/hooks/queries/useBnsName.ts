import { useEffect, useState } from 'react';
import { StacksNetwork, validateStxAddress } from '@secretkeylabs/xverse-core';
import { fetchAddressOfBnsName, getBnsName } from '@secretkeylabs/xverse-core/api';
import useWalletSelector from '../useWalletSelector';
import useNetworkSelector from '../useNetwork';

export const useBnsName = (walletAddress: string, network: StacksNetwork) => {
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
  const selectedNetwork = useNetworkSelector();
  const [associatedAddress, setAssociatedAddress] = useState('');

  useEffect(() => {
    (async () => {
      if (currencyType !== 'BTC') {
        if (!validateStxAddress({ stxAddress: recipientAddress, network: network.type })) {
          const address = await fetchAddressOfBnsName(
            recipientAddress.toLocaleLowerCase(),
            walletAddress.toLocaleLowerCase(),
            selectedNetwork,
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
