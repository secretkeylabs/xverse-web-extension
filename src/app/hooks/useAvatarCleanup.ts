import {
  getStacksApiClient,
  isNftOwnedByAccount,
  isOrdinalOwnedByAccount,
  type Account,
} from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import type { AvatarInfo } from '@stores/wallet/actions/types';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useXverseApi from './apiClients/useXverseApi';
import useGetAllAccounts from './useGetAllAccounts';
import useWalletSelector from './useWalletSelector';

/* Check and clear NFT Avatar that being used, but no-longer belongs to this Wallet */
export default function useAvatarCleanup() {
  const dispatch = useDispatch();
  const { avatarIds, network } = useWalletSelector();
  const xverseApi = useXverseApi();
  const stacksApiClient = getStacksApiClient(network.type);
  const allAccounts = useGetAllAccounts();

  const checkAndRemoveInvalidAvatar = useCallback(
    async (account: Account, avatar: AvatarInfo) => {
      const { address } = account.btcAddresses.taproot;

      if (avatar?.type === 'inscription') {
        const inscription = await xverseApi.getInscription(
          account.btcAddresses.taproot.address,
          avatar.inscription.id,
        );

        if (!isOrdinalOwnedByAccount(inscription, account)) {
          dispatch(removeAccountAvatarAction({ address }));
        }
      } else if (avatar?.type === 'stacks') {
        const isStacksOwnedByAccount = await isNftOwnedByAccount(
          avatar.nft,
          account,
          stacksApiClient,
        );

        if (!isStacksOwnedByAccount) {
          dispatch(removeAccountAvatarAction({ address }));
        }
      }
    },
    [dispatch, stacksApiClient, xverseApi],
  );

  useEffect(() => {
    if (!avatarIds) return;
    allAccounts
      .filter((account) => !!avatarIds[account.btcAddresses.taproot.address])
      .forEach((account) =>
        checkAndRemoveInvalidAvatar(account, avatarIds[account.btcAddresses.taproot.address]),
      );
  }, [checkAndRemoveInvalidAvatar, avatarIds, allAccounts]);
}
