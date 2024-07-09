import { fetchAddressOfBnsName, getBnsName, validateStxAddress } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import useNetworkSelector from '../useNetwork';
import useWalletSelector from '../useWalletSelector';

export const useBnsName = (walletAddress: string) => {
  const network = useNetworkSelector();
  const [bnsName, setBnsName] = useState('');

  useEffect(() => {
    (async () => {
      if (walletAddress) {
        const name = await getBnsName(walletAddress, network);
        setBnsName(name ?? '');
      } else {
        setBnsName('');
      }
    })();
  }, [walletAddress, network]);

  return bnsName;
};

export const useBnsResolver = (
  recipientAddress: string,
  walletAddress: string,
  currencyType?: string,
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
  }, [recipientAddress, network, currencyType, selectedNetwork, walletAddress]);

  return associatedAddress;
};
