import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { Inscription } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import {
  getInscriptionsCollectionGridItemId,
  getInscriptionsCollectionGridItemSubText,
  getInscriptionsCollectionGridItemSubTextColor,
} from '@utils/inscriptions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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
  text-transform: capitalize;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${(props) => props.theme.radius(3)}px;
  background: ${(props) => props.theme.colors.elevation1};
`;

const GridItemContainer = styled.button`
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: ${(props) => props.theme.space.s};
`;

export function OrdinalsCollectionGridItem({ item }: { item: Inscription }) {
  const navigate = useNavigate();
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();

  const handleOnClick = () => {
    setSelectedOrdinalDetails(item);
    navigate(`/nft-dashboard/ordinal-detail/${item.id}`);
  };

  const itemId = getInscriptionsCollectionGridItemId(item);
  const itemSubText = getInscriptionsCollectionGridItemSubText(item);
  const itemSubTextColor = getInscriptionsCollectionGridItemSubTextColor(item);

  return (
    <GridItemContainer onClick={handleOnClick}>
      <ImageContainer>
        <OrdinalImage ordinal={item} />
      </ImageContainer>
      <InfoContainer>
        <StyledItemId typography="body_bold_m" color="white_0">
          {itemId}
        </StyledItemId>
        <StyledItemSub typography="body_medium_m" color={itemSubTextColor}>
          {itemSubText}
        </StyledItemSub>
      </InfoContainer>
    </GridItemContainer>
  );
}
export default OrdinalsCollectionGridItem;
