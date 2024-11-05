import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { Star } from '@phosphor-icons/react';
import type { Inscription, NonFungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { Color } from 'theme';
import Theme from 'theme';

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

const StyledItemId = styled(StyledP)`
  text-align: left;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
`;

const StyledStar = styled(Star)`
  margin-top: 2px;
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

type Props = {
  item?: Inscription | NonFungibleToken;
  itemId?: string;
  itemSubText?: string;
  itemSubTextColor?: Color;
  children: ReactNode;
  onClick?: (item: Inscription | NonFungibleToken) => void;
};

const isInscription = (item?: Inscription | NonFungibleToken): item is Inscription =>
  item !== undefined && 'id' in item;

function CollectibleCollectionGridItem({
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

  const { ordinalsAddress, stxAddress } = useSelectedAccount();
  const { starredCollectibleIds } = useWalletSelector();
  const inscriptionStarred =
    isInscription(item) && starredCollectibleIds[ordinalsAddress]?.some(({ id }) => id === item.id);
  const nftStarred =
    !isInscription(item) &&
    starredCollectibleIds[stxAddress]?.some(
      ({ id }) => id === `${item?.asset_identifier}:${item?.identifier.tokenId}`,
    );

  return (
    <GridItemContainer data-testid="collection-item" onClick={handleOnClick}>
      <ImageContainer>{children}</ImageContainer>
      <InfoContainer>
        <StyledItemIdContainer>
          {(inscriptionStarred || nftStarred) && (
            <StyledStar size={14} color={Theme.colors.white_0} weight="fill" />
          )}
          <StyledItemId typography="body_bold_m" color="white_0">
            {itemId}
          </StyledItemId>
        </StyledItemIdContainer>
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
