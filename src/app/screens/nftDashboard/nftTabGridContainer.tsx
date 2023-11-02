import CollectibleCollage from '@components/collectibleCollage/collectibleCollage';
import useNftDataReducer from '@hooks/stores/useNftReducer';
import { StacksCollectionData } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getNftsTabGridItemSubText } from '@utils/inscriptions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Nft from './nft';

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
`;

const StyledItemSub = styled(StyledP)`
  text-align: left;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
`;

export function NftTabGridItem({ item: collection }: { item: StacksCollectionData }) {
  const navigate = useNavigate();
  const { storeNftData } = useNftDataReducer();

  const handleClickCollection = () => {
    storeNftData(collection.thumbnail_nfts[0].asset_identifier);
    navigate(`nft-collection/${collection.collection_id}`);
  };

  const itemId = collection.collection_name;
  const itemSubText = getNftsTabGridItemSubText(collection);

  return (
    <CollectionContainer>
      <ThumbnailContainer onClick={handleClickCollection}>
        {collection.total_nft > 1 ? (
          <CollectibleCollage items={collection.thumbnail_nfts} />
        ) : (
          <Nft asset={collection.thumbnail_nfts[0]} isGalleryOpen />
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
