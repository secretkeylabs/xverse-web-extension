import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useRuneUtxosQueryPerMarketplace from '@hooks/queries/runes/useRuneUtxosQueryPerMarketplace';
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
import { FeatureId, type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import theme from 'theme';
import { Container, Header, NoItemsContainer, UnlistRunesContainer } from './index.styled';
import UnlistRuneItemPerMarketplace, {
  type ListedUtxoWithProvider,
} from './unlistRuneItemPerMarketplace';

export default function UnlistRuneScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const navigate = useNavigate();
  const { runeId } = useParams();
  const { data: runesCoinsList = [], isLoading: isLoadingRunesCoinsList } =
    useVisibleRuneFungibleTokens();
  const selectedRune = runesCoinsList.find((ft) => ft.principal === runeId);
  const showRunesListing =
    useHasFeature(FeatureId.RUNES_LISTING) || process.env.NODE_ENV === 'development';

  if (!showRunesListing) {
    navigate(-1);
  }

  useTrackMixPanelPageViewed();

  const {
    data,
    isLoading: isFetchingListedItems,
    isRefetching: isRefetchingListedItems,
    refetch,
  } = useRuneUtxosQueryPerMarketplace(selectedRune, false);
  const { listedItems } = data || {};

  const isLoading = isFetchingListedItems || isRefetchingListedItems || isLoadingRunesCoinsList;
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
            {listedItems.map((item) => (
              <UnlistRuneItemPerMarketplace
                key={`${item.txid}:${item.vout}`}
                item={item as ListedUtxoWithProvider}
                selectedRune={selectedRune as FungibleToken}
              />
            ))}
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
