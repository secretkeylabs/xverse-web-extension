import CollectibleCollage from '@components/collectibleCollage/collectibleCollage';
import { StacksCollectionData } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getNftsTabGridItemSubText } from '@utils/nfts';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Nft from './nft';
import NftImage from './nftImage';

const CollectionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
}));

const ThumbnailContainer = styled.button`
  background: transparent;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const StyledItemId = styled(StyledP)`
  text-align: left;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
`;

const StyledItemSub = styled(StyledP)`
  text-align: left;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
`;

export function NftTabGridItem({
  item: collection,
  isLoading = false,
}: {
  item: StacksCollectionData;
  isLoading?: boolean;
}) {
  const navigate = useNavigate();

  const handleClickCollection = () => {
    navigate(`nft-collection/${collection.collection_id}`);
  };

  const itemId = collection.collection_name;
  const itemSubText = getNftsTabGridItemSubText(collection);

  return (
    <CollectionContainer data-testid="collection-container">
      <ThumbnailContainer onClick={handleClickCollection}>
        {isLoading ? (
          <NftImage />
        ) : collection?.all_nfts?.length > 1 ? (
          <CollectibleCollage items={collection?.all_nfts} />
        ) : (
          <Nft asset={collection.all_nfts[0]} isGalleryOpen />
        )}
      </ThumbnailContainer>
      <InfoContainer>
        <StyledItemId typography="body_bold_m" color="white_0">
          {itemId}
        </StyledItemId>
        <StyledItemSub typography="body_medium_m" color="white_400">
          {itemSubText}
        </StyledItemSub>
      </InfoContainer>
    </CollectionContainer>
  );
}
export default NftTabGridItem;
