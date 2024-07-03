import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useRuneUtxosQuery from '@hooks/queries/runes/useRuneUtxosQuery';
import useHasFeature from '@hooks/useHasFeature';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { ArrowClockwise } from '@phosphor-icons/react';
import {
  ButtonImage,
  LoaderContainer,
  TabButton,
  TabButtonsContainer,
  TabContainer,
} from '@screens/listRune/index.styled';
import UnlistRuneItem from '@screens/unlistRune/unlistRuneItem';
import { FeatureId } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { ftDecimals } from '@utils/helper';
import { getFullTxId, getTxIdFromFullTxId, getVoutFromFullTxId } from '@utils/runes';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import theme from 'theme';
import { Container, Header, NoItemsContainer, UnlistRunesContainer } from './index.styled';

export default function UnlistRuneScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const navigate = useNavigate();
  const { runeId } = useParams();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const selectedRune = runesCoinsList.find((ft) => ft.principal === runeId);
  const showRunesListing =
    useHasFeature(FeatureId.RUNES_LISTING) || process.env.NODE_ENV === 'development';

  if (!showRunesListing) {
    navigate(-1);
  }

  useTrackMixPanelPageViewed();

  const {
    data: listedItems,
    isInitialLoading: isFetchingListedItems,
    isRefetching: isRefetchingListedItems,
    refetch,
  } = useRuneUtxosQuery(selectedRune?.name ?? '', 'listed', false);
  const isLoading = isFetchingListedItems || isRefetchingListedItems;
  const showContent = !isLoading && !!listedItems?.length;

  const handleGoBack = () =>
    navigate(`/coinDashboard/FT?ftKey=${selectedRune?.principal}&protocol=runes`);

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <Header>{t('LIST_RUNES')}</Header>
        <StyledP color="white_200" typography="body_m">
          {t('SELECT_RUNES_SECTION')}
        </StyledP>
        <TabContainer>
          <TabButtonsContainer>
            <TabButton
              isSelected={false}
              onClick={() => navigate(`/list-rune/${selectedRune?.principal}`)}
            >
              {t('NOT_LISTED')}
            </TabButton>
            <TabButton
              isSelected
              onClick={() => navigate(`/unlist-rune/${selectedRune?.principal}`)}
            >
              {t('LISTED')}
            </TabButton>
          </TabButtonsContainer>
          {!isLoading && (
            <ButtonImage data-testid="reload-button" onClick={() => refetch()}>
              <ArrowClockwise color={theme.colors.white_400} size="20" />
            </ButtonImage>
          )}
        </TabContainer>
        {isLoading && (
          <LoaderContainer>
            <Spinner color="white" size={25} />
          </LoaderContainer>
        )}
        {showContent && (
          <UnlistRunesContainer data-testid="listed">
            {listedItems.map((item) => {
              const key = getFullTxId(item);
              const runeAmount = ftDecimals(
                String(item.runes?.[0][1].amount),
                selectedRune?.decimals ?? 0,
              );
              return (
                <UnlistRuneItem
                  key={key}
                  txId={getTxIdFromFullTxId(key)}
                  vout={getVoutFromFullTxId(key)}
                  runeAmount={runeAmount}
                  orderIds={item.listing.map((listing) => listing.orderId)}
                  runeSymbol={item.runes?.[0][1].symbol ?? ''}
                  listPrice={BigNumber(item.listing[0].totalPriceSats)}
                  selectedRuneId={selectedRune?.principal ?? ''}
                />
              );
            })}
          </UnlistRunesContainer>
        )}
        {!isLoading && !listedItems?.length && (
          <NoItemsContainer>{t('NO_LISTED_ITEMS')}</NoItemsContainer>
        )}
      </Container>
      {showContent && <BottomBar tab="dashboard" />}
    </>
  );
}
