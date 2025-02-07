import Nft from '@screens/nftDashboard/nft';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { CondensedInscription, NonFungibleToken } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

const CollageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: calc(7%);
  gap: calc(6%);
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  border-radius: ${(props) => props.theme.radius(2)}px;
`;

const CollageItem = styled.div`
  width: calc(50% - 3%);
  height: calc(50% - 3%);
  overflow: hidden;
`;

const RemainingAmountOfAssets = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  aspectRatio: 1,
  overflow: 'hidden',
  borderRadius: props.theme.radius(1),
  background: props.theme.colors.elevation1,
  p: {
    ...props.theme.typography.body_medium_m,
    fontSize: 'calc((2vw + 2vh)* 0.8)',
    color: props.theme.colors.white_0,
  },
}));

function CollectibleCollage({ items }: { items: Array<CondensedInscription | NonFungibleToken> }) {
  const moreThanFourItems = items.length > 4;

  const isStacksNft = (item: CondensedInscription | NonFungibleToken): boolean =>
    'asset_identifier' in item;
  return (
    <CollageContainer>
      {items.slice(0, 4).map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <CollageItem key={index}>
          {moreThanFourItems && index === 3 ? (
            <RemainingAmountOfAssets>
              <p>+{items.length - 4}</p>
            </RemainingAmountOfAssets>
          ) : // Conditionally render RareSatAsset if item is a BundleItem otherwise render Nft
          isStacksNft(item) ? (
            <Nft asset={item as NonFungibleToken} isGalleryOpen={false} />
          ) : (
            <OrdinalImage ordinal={item as CondensedInscription} />
          )}
        </CollageItem>
      ))}
    </CollageContainer>
  );
}

export default CollectibleCollage;
