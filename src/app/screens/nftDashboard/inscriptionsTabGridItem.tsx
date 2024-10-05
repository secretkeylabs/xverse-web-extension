import CollectibleCollage from '@components/collectibleCollage/collectibleCollage';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Star } from '@phosphor-icons/react';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { InscriptionCollectionsData } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import {
  getCollectionKey,
  getInscriptionsTabGridItemId,
  getInscriptionsTabGridItemSubText,
  isCollection,
} from '@utils/inscriptions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from '../../../theme';

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

const StyledItemIdContainer = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
`;

const StyledStar = styled(Star)`
  margin-top: 2px;
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

function InscriptionsTabGridItem({ item: collection }: { item: InscriptionCollectionsData }) {
  const navigate = useNavigate();
  const { starredCollectibleIds, hiddenCollectibleIds } = useWalletSelector();
  const { ordinalsAddress } = useSelectedAccount();
  const collectionStarred = starredCollectibleIds[ordinalsAddress]?.some(
    ({ id }) => id === collection.collection_id,
  );
  const standaloneInscriptionStarred =
    !collection.collection_id &&
    collection.total_inscriptions === 1 &&
    starredCollectibleIds[ordinalsAddress]?.some(
      ({ id }) => id === collection.thumbnail_inscriptions?.[0].id,
    );

  const isItemHidden = Object.keys(hiddenCollectibleIds[ordinalsAddress] ?? {}).some(
    (id) => id === getCollectionKey(collection),
  );

  const handleClickCollectionId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const collectionId = e.currentTarget.value;
    navigate(`/nft-dashboard/ordinals-collection/${collectionId}/${isItemHidden ? 'hidden' : ''}`);
  };

  const handleClickInscriptionId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const inscriptionId = e.currentTarget.value;
    navigate(`/nft-dashboard/ordinal-detail/${inscriptionId}/${isItemHidden ? 'hidden' : ''}`);
  };

  const itemId = getInscriptionsTabGridItemId(collection);
  const itemSubText = getInscriptionsTabGridItemSubText(collection);

  return (
    <CollectionContainer data-testid="collection-container">
      <ThumbnailContainer
        data-testid="inscription-container"
        type="button"
        value={getCollectionKey(collection)}
        onClick={isCollection(collection) ? handleClickCollectionId : handleClickInscriptionId}
      >
        {!collection.thumbnail_inscriptions ? ( // eslint-disable-line no-nested-ternary
          <OrdinalImage ordinal={{ id: '', content_type: 'unknown', number: 0 }} />
        ) : !isCollection(collection) || collection.thumbnail_inscriptions.length === 1 ? ( // eslint-disable-line no-nested-ternary
          <OrdinalImage ordinal={collection.thumbnail_inscriptions[0]} />
        ) : collection.category === 'brc-20' ? (
          <OrdinalImage ordinal={collection.thumbnail_inscriptions[0]} withoutTitles />
        ) : (
          <CollectibleCollage items={collection.thumbnail_inscriptions} />
        )}
      </ThumbnailContainer>
      <InfoContainer>
        <StyledItemIdContainer>
          {(collectionStarred || standaloneInscriptionStarred) && (
            <StyledStar size={14} color={Theme.colors.white_0} weight="fill" />
          )}
          <StyledItemId data-testid="inscription-name" typography="body_bold_m" color="white_0">
            {itemId}
          </StyledItemId>
        </StyledItemIdContainer>

        <StyledItemSub
          data-testid="inscription-amount"
          typography="body_medium_m"
          color="white_400"
        >
          {itemSubText}
        </StyledItemSub>
      </InfoContainer>
    </CollectionContainer>
  );
}

export default InscriptionsTabGridItem;
