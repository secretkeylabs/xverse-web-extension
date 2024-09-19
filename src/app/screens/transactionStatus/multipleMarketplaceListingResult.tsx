import { ArrowLeft } from '@phosphor-icons/react';
import type { FungibleToken, ListingProvider } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MarketplaceRuneListingResult from './marketplaceRuneListingResults';

const Container = styled.div((props) => ({
  background: props.theme.colors.elevation0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: '100%',
  padding: `0px ${props.theme.space.m}`,
}));

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '68px',
  marginBottom: props.theme.space.xs,
}));

const BackButton = styled.button((_props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
}));

const HeaderContainer = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.l,
}));

const MarketplacesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
}));

export default function MultipleMarketplaceListingResult() {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const navigate = useNavigate();
  const location = useLocation();
  const { minPriceSats, rune, orders } = location.state as {
    minPriceSats: number;
    rune: FungibleToken;
    orders: [
      {
        marketplace: ListingProvider;
        successful: boolean;
      },
    ];
  };

  return (
    <Container>
      <BackButtonContainer>
        <BackButton data-testid="back-button" onClick={() => navigate('/')}>
          <ArrowLeft weight="regular" size="20" color="white" />
        </BackButton>
      </BackButtonContainer>
      <HeaderContainer>{t('LISTING_STATUS')}</HeaderContainer>
      <MarketplacesContainer>
        {orders?.map(({ marketplace, successful }, index) => (
          <MarketplaceRuneListingResult
            // eslint-disable-next-line
            key={index}
            minPriceSats={minPriceSats || 0}
            marketplace={marketplace}
            rune={rune}
            successful={successful}
          />
        ))}
      </MarketplacesContainer>
    </Container>
  );
}
