import { addressBook } from '@secretkeylabs/xverse-core';
import { useMemo } from 'react';
import useVault from './useVault';
import useWalletSelector from './useWalletSelector';

/**
 * Hook to access the AddressBook vault
 * @returns AddressBook instance
 */
const useAddressBook = () => {
  const masterVault = useVault();
  const { network } = useWalletSelector();

  return useMemo(
    () => new addressBook.AddressBook(masterVault, network.type),
    [masterVault, network.type],
  );
};

export default useAddressBook;
