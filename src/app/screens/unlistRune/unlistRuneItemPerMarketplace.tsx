import TokenImage from '@components/tokenImage';
import { CaretRight } from '@phosphor-icons/react';
import {
  satsToBtc,
  type FungibleToken,
  type GetListedUtxosResponseUtxo,
  type ListingProvider,
  type ListingWithMarketplace,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: ${(props) => props.theme.space.s};
  border-radius: ${(props) => props.theme.space.xs};
  background-color: ${(props) => props.theme.colors.elevation1};
  justify-content: space-between;
  cursor: pointer;
`;

const MainWrapper = styled.div`
  display: flex;
  gap: ${(props) => props.theme.space.m};
  width: 100%;
  margin-right: 8px;
  justify-content: space-between;
`;

const TokenImageMainContainer = styled.div<{ totalImages: number }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: `${(props.totalImages - 1) * 20 + 28}px`,
}));

const TokenImageContainer = styled.div`
  margin-right: -8px;
`;

const TotalSatsText = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_400,
}));

const RuneTitle = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-bottom: 2px;
`;

export type ListingWithListingProvider = ListingWithMarketplace & { marketplace: ListingProvider };
export type ListedUtxoWithProvider = Omit<GetListedUtxosResponseUtxo, 'listings'> & {
  listings: ListingWithListingProvider[];
};

type Props = {
  item: ListedUtxoWithProvider;
  selectedRune: FungibleToken;
};

function UnlistRuneItemPerMarketplace({ item, selectedRune }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'UNLIST_RUNE_SCREEN' });
  const location = useLocation();
  const navigate = useNavigate();

  const runeAmount = ftDecimals(String(item.runes?.[0][1].amount), selectedRune?.decimals ?? 0);
  const lowestListingTotalSats = BigNumber(Math.min(...item.listings.map((l) => l.totalPriceSats)));
  const runeSymbol = item.runes?.[0][1].symbol ?? '';

  const handleOnClick = () => {
    navigate(`${location.pathname}/utxo`, {
      state: {
        item,
        selectedRune,
      },
    });
  };

  return (
    <Container data-testid="listed-rune-container" onClick={handleOnClick}>
      <MainWrapper>
        <div>
          <NumericFormat
            value={runeAmount}
            displayType="text"
            suffix={` ${runeSymbol}`}
            thousandSeparator
            decimalScale={2}
            renderText={(value: string) => (
              <RuneTitle typography="body_medium_m" color="white_0">
                {value}
              </RuneTitle>
            )}
          />
          <TotalSatsText>
            <span>{t('LOWEST_LISTING')} </span>
            <span style={{ color: Theme.colors.white_0 }}>
              {satsToBtc(lowestListingTotalSats).toNumber()} BTC
            </span>
          </TotalSatsText>
        </div>
        <TokenImageMainContainer totalImages={item.listings.length}>
          {item.listings.map((listing) => (
            <TokenImageContainer key={listing.marketplaceName}>
              <TokenImage
                fungibleToken={{ image: listing.marketplace.logo } as FungibleToken}
                size={28}
              />
            </TokenImageContainer>
          ))}
        </TokenImageMainContainer>
      </MainWrapper>
      <CaretRight size="16px" />
    </Container>
  );
}

export default UnlistRuneItemPerMarketplace;
