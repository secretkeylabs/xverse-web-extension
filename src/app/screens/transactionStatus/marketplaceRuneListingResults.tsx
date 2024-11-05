import CheckCircle from '@assets/img/listings/CheckCircle.svg';
import XCircle from '@assets/img/listings/XCircle.svg';
import TokenImage from '@components/tokenImage';
import { ArrowUpRight } from '@phosphor-icons/react';
import {
  marketplaceRuneDashboardUrl,
  type FungibleToken,
  type ListingProvider,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { formatNumber } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'theme';

const Container = styled.div<{ $successful: boolean; $enabled: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.s};
  border: 1px solid;
  border-color: ${(props) =>
    props.$successful ? props.theme.colors.white_800 : props.theme.colors.white_900};
  transition: background-color 0.1s ease, border-color 0.1s ease;
  width: 100%;
  gap: 10px;
  cursor: ${(props) => (props.$enabled ? 'pointer' : 'auto')};
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
`;

const SubtitleContainer = styled.div((props) => ({
  marginTop: props.theme.space.xxs,
}));

type Props = {
  minPriceSats: number;
  marketplace: ListingProvider;
  rune: FungibleToken;
  successful: boolean;
};

function MarketplaceRuneListingResult({ minPriceSats, marketplace, rune, successful }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const floorPrice = formatNumber(minPriceSats);

  const marketplaceUrl = marketplaceRuneDashboardUrl(rune, marketplace.name);
  const enabled = successful && !!marketplaceUrl;

  const handleClick = () => enabled && window.open(marketplaceUrl, '_blank', 'noopener,noreferrer');

  return (
    <Container
      data-testid="marketplace-listing-result"
      $successful={successful}
      $enabled={enabled}
      onClick={handleClick}
    >
      <div style={{ marginRight: theme.space.s }}>
        <TokenImage
          fungibleToken={{ image: marketplace.logo } as FungibleToken}
          size={32}
          customProtocolIcon={successful ? CheckCircle : XCircle}
          showProtocolIcon
        />
      </div>
      <InfoContainer>
        <RowCenter>
          <StyledP typography="body_bold_m" color="white_0">
            {marketplace.name}
          </StyledP>
        </RowCenter>
        <RowCenter>
          <SubtitleContainer>
            {successful ? (
              <StyledP typography="body_medium_m" color="white_200">
                {t('LISTED_FOR', {
                  floor_price: floorPrice,
                  symbol: rune.runeSymbol || rune.name,
                })}
              </StyledP>
            ) : (
              <StyledP typography="body_medium_m" color="danger_light">
                {t('FAILED_TO_LIST')}
              </StyledP>
            )}
          </SubtitleContainer>
        </RowCenter>
      </InfoContainer>
      {enabled && <ArrowUpRight size="16" color={theme.colors.white_0} />}
    </Container>
  );
}

export default MarketplaceRuneListingResult;
