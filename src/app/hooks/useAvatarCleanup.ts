import {
  getNftCollections,
  getXverseApiClient,
  isOrdinalOwnedByAccount,
  type Account,
} from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import type { AvatarInfo } from '@stores/wallet/actions/types';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useNetworkSelector from './useNetwork';
import useWalletSelector from './useWalletSelector';

/* Check and clear NFT Avatar that being used, but no-longer belongs to this Wallet */
export default function useAvatarCleanup() {
  const dispatch = useDispatch();
  const { avatarIds, network, accountsList } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const xverseApi = getXverseApiClient(network.type);

  const checkAndRemoveInvalidAvatar = useCallback(
    async (account: Account, avatar: AvatarInfo | null) => {
      if (avatar?.type === 'inscription') {
        const inscription = await xverseApi.getInscription(
          account.ordinalsAddress,
          avatar.inscription.id,
        );

        if (!isOrdinalOwnedByAccount(inscription, account)) {
          dispatch(removeAccountAvatarAction({ address: account.btcAddress }));
        }
      } else if (avatar?.type === 'stacks') {
        const nftList = await getNftCollections(account.stxAddress, selectedNetwork);
        const isNftOwnedByAccount = nftList.results.some((collection) =>
          collection.all_nfts.some((nft) => {
            const fullyQualifiedTokenId = `${nft.asset_identifier}:${nft.identifier.tokenId}`;
            return fullyQualifiedTokenId === avatar.nft.fully_qualified_token_id;
          }),
        );

        if (!isNftOwnedByAccount) {
          dispatch(removeAccountAvatarAction({ address: account.btcAddress }));
        }
      }
    },
    [dispatch, selectedNetwork, xverseApi],
  );

  useEffect(() => {
    if (!avatarIds) return;
    accountsList
      .filter((account) => !!avatarIds[account.btcAddress])
      .forEach((account) => checkAndRemoveInvalidAvatar(account, avatarIds[account.btcAddress]));
  }, [checkAndRemoveInvalidAvatar, avatarIds, accountsList]);
}
