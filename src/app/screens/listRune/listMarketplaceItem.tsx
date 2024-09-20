import TokenImage from '@components/tokenImage';
import type { FungibleToken, ListingProvider } from '@secretkeylabs/xverse-core';
import Checkbox from '@ui-library/checkbox';
import { StyledP } from '@ui-library/common.styled';
import { formatNumber } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'theme';

const Container = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  border: 1px solid;
  border-color: ${(props) => (props.$selected ? props.theme.colors.white_900 : 'transparent')};
  background-color: ${(props) =>
    props.$selected ? props.theme.colors.elevation2 : props.theme.colors.elevation1};
  transition: background-color 0.1s ease, border-color 0.1s ease;
`;

const RowCenter = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const InfoContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xxxs};
`;

const SubtitleContainer = styled.div((props) => ({
  marginTop: props.theme.space.xxs,
}));

const CheckBoxContainer = styled.div((props) => ({
  marginRight: props.theme.space.s,
}));

type Props = {
  runeMarketInfo: {
    floorPrice: number;
    marketplace: ListingProvider;
  };
  rune: FungibleToken;
  selected: boolean;
  onToggle: () => void;
};

function ListMarketplaceItem({ runeMarketInfo, rune, selected, onToggle }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const { floorPrice: rawFloorPrice, marketplace } = runeMarketInfo;
  const floorPrice = formatNumber(rawFloorPrice);

  return (
    <Container data-testid="rune-item" $selected={selected}>
      <CheckBoxContainer>
        <Checkbox checkboxId="list-rune" checked={selected} onChange={onToggle} color="white_400" />
      </CheckBoxContainer>
      <div style={{ marginRight: theme.space.s }}>
        <TokenImage fungibleToken={{ image: marketplace.logo } as FungibleToken} size={32} />
      </div>
      <InfoContainer>
        <RowCenter>
          <StyledP typography="body_bold_m" color="white_0">
            {marketplace.name}
          </StyledP>
        </RowCenter>
        <RowCenter>
          <SubtitleContainer>
            <StyledP typography="body_medium_s" color="white_200">
              {t('FLOOR_PRICE', {
                floor_price: floorPrice,
                symbol: rune.runeSymbol || rune.name,
              })}
            </StyledP>
          </SubtitleContainer>
        </RowCenter>
      </InfoContainer>
    </Container>
  );
}

export default ListMarketplaceItem;
