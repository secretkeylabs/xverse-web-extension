import NftImage from '@screens/nftDashboard/nftImage';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { type Account } from '@secretkeylabs/xverse-core';
import { getAccountGradient } from '@utils/gradient';

import type { AvatarInfo } from '@stores/wallet/actions/types';
import { AvatarContainer, GradientCircle } from './index.styled';

type Props = {
  account: Account | null;
  isSelected: boolean;
  isAccountListView?: boolean;
  avatar?: AvatarInfo | null;
};

function AccountAvatar({ account, avatar, isSelected, isAccountListView = false }: Props) {
  if (avatar?.type === 'inscription') {
    return (
      <AvatarContainer $isBig={isAccountListView} $isSelected={isSelected}>
        <OrdinalImage ordinal={avatar.inscription} />
      </AvatarContainer>
    );
  }

  if (avatar?.type === 'stacks') {
    return (
      <AvatarContainer $isBig={isAccountListView} $isSelected={isSelected}>
        <NftImage metadata={avatar.nft.token_metadata} />
      </AvatarContainer>
    );
  }

  const gradient = getAccountGradient(account?.stxAddress || account?.btcAddress!);

  return (
    <GradientCircle
      $firstGradient={gradient[0]}
      $secondGradient={gradient[1]}
      $thirdGradient={gradient[2]}
      $isBig={isAccountListView}
      $isSelected={isSelected}
    />
  );
}

export default AccountAvatar;
