import { StyledP } from '@ui-library/common.styled';
import { BundleItem, getBundleItemId, getBundleItemSubText } from '@utils/rareSats';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import RareSatAsset from '@components/rareSatAsset/rareSatAsset';

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

export function RareSatsBundleGridItem({
  item,
  itemIndex,
}: {
  item: BundleItem;
  itemIndex: number;
}) {
  const navigate = useNavigate();
  const { setSelectedSatBundleItemIndex } = useSatBundleDataReducer();
  const { selectedSatBundle } = useNftDataSelector();

  const handleOnClick = () => {
    setSelectedSatBundleItemIndex(itemIndex);
    navigate('/nft-dashboard/rare-sats-detail');
  };

  const itemId = getBundleItemId(selectedSatBundle!, itemIndex);
  const itemSubText = getBundleItemSubText({
    satType: item.type,
    rareSatsType: item.rarity_ranking,
  });

  return (
    <GridItemContainer onClick={handleOnClick}>
      <ImageContainer>
        <RareSatAsset item={item} />
      </ImageContainer>
      <InfoContainer>
        <StyledItemId typography="body_bold_m" color="white_0">
          {itemId}
        </StyledItemId>
        <StyledItemSub typography="body_medium_m" color="white_400">
          {itemSubText}
        </StyledItemSub>
      </InfoContainer>
    </GridItemContainer>
  );
}
export default RareSatsBundleGridItem;
