import { CoreError } from '@secretkeylabs/xverse-core';
import type { AddressBookEntry } from '@secretkeylabs/xverse-core/addressBook/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { handleAddressBookError } from '../utils/handleAddressBookError';
import useAddressBook from './useAddressBook';
import useWalletSelector from './useWalletSelector';

/**
 * Hook to access and manage address book entries
 * @returns Object with address book entries and methods to manage them
 */
const useAddressBookEntries = () => {
  const addressBook = useAddressBook();
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN.ADDRESS_BOOK.ERROR' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const queryKey = ['addressBookEntries', network.type];

  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useQuery<AddressBookEntry[], CoreError>({
    queryKey,
    queryFn: async () => addressBook.getEntries(),
    refetchOnMount: true,
    onError: (err) => {
      toast.error(t('FETCH_FAILED'));
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data: { address: string; name: string }) => {
      await addressBook.addEntry(data);
      await refetch();
    },
    onError: (err) => handleAddressBookError(err, t, tCommon),
  });

  const removeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await addressBook.removeEntry(id);
      await refetch();
    },
    onError: (err) => handleAddressBookError(err, t, tCommon),
  });

  const editEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { address: string; name: string } }) => {
      await addressBook.editEntry(id, data);
      await refetch();
    },
    onError: (err) => handleAddressBookError(err, t, tCommon),
  });

  return {
    entries,
    isLoading,
    error,
    addEntry: addEntryMutation.mutate,
    removeEntry: removeEntryMutation.mutate,
    editEntry: editEntryMutation.mutate,
    isAddingEntry: addEntryMutation.isLoading,
    isRemovingEntry: removeEntryMutation.isLoading,
    isEditingEntry: editEntryMutation.isLoading,
  };
};

export default useAddressBookEntries;
