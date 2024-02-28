import { Inscription, NonFungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Color } from 'theme';

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
  cursor: ${(props) => (props.onClick ? 'pointer' : 'initial')};
  width: 100%;
`;

interface Props {
  item?: Inscription | NonFungibleToken;
  itemId?: string;
  itemSubText?: string;
  itemSubTextColor?: Color;
  children: ReactNode;
  onClick?: (item: Inscription | NonFungibleToken) => void;
}
export function CollectibleCollectionGridItem({
  item,
  itemId,
  itemSubText,
  itemSubTextColor,
  children,
  onClick,
}: Props) {
  const handleOnClick =
    onClick && item
      ? () => {
          onClick(item);
        }
      : undefined;

  return (
    <GridItemContainer onClick={handleOnClick}>
      <ImageContainer>{children}</ImageContainer>
      <InfoContainer>
        <StyledItemId typography="body_bold_m" color="white_0">
          {itemId}
        </StyledItemId>
        {itemSubText && (
          <StyledItemSub typography="body_medium_m" color={itemSubTextColor ?? 'white_400'}>
            {itemSubText}
          </StyledItemSub>
        )}
      </InfoContainer>
    </GridItemContainer>
  );
}
export default CollectibleCollectionGridItem;
