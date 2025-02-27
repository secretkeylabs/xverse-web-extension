import linkIcon from '@assets/img/linkIcon.svg';
import CopyButton from '@components/copyButton';
import OptionsDialog from '@components/optionsDialog/optionsDialog';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useRuneUtxosQuery from '@hooks/queries/runes/useRuneUtxosQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useSpamTokens from '@hooks/queries/useSpamTokens';
import useHasFeature from '@hooks/useHasFeature';
import { broadcastResetUserFlow, useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { Flag } from '@phosphor-icons/react';
import RuneBundleRow from '@screens/coinDashboard/runes/bundleRow';
import type { FungibleTokenWithStates } from '@secretkeylabs/xverse-core';
import { FeatureId, mapRareSatsAPIResponseToBundle } from '@secretkeylabs/xverse-core';
import {
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setSip10ManageTokensAction,
  setSpamTokenAction,
} from '@stores/wallet/actions/actionCreators';
import { SPAM_OPTIONS_WIDTH, type CurrencyTypes } from '@utils/constants';
import { ftDecimals, getExplorerUrl, getTruncatedAddress } from '@utils/helper';
import { getFullTxId, getTxIdFromFullTxId, getVoutFromFullTxId } from '@utils/runes';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import Theme from 'theme';
import type { Tab } from '..';
import CoinHeader from '../coinHeader';
import {
  Button,
  ButtonRow,
  ChartContainer,
  Container,
  ContractAddressCopyButton,
  ContractDeploymentButton,
  CopyButtonContainer,
  FtInfoContainer,
  RuneBundlesContainer,
  SecondaryContainer,
  ShareIcon,
  TokenContractAddress,
  TokenText,
} from '../index.styled';
import TokenHistoricalData from '../tokenHistoricalData';
import TokenPrice, { type ChartPriceStats } from '../tokenPrice';
import TransactionsHistoryList from '../transactionsHistoryList';

// TODO: This should be refactored into separate components for each protocol/coin as needed
// TODO: with a shared component for the common parts

export default function CoinDashboard() {
  const [searchParams] = useSearchParams();
  const ftKey = searchParams.get('ftKey') ?? '';
  const protocol = searchParams.get('protocol') ?? '';
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const defaultTab: Tab = searchParams.get('secondaryTab') === 'true' ? 'third' : 'first';
  const [currentTab, setCurrentTab] = useState<Tab>(defaultTab);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [optionsDialogIndents, setOptionsDialogIndents] = useState<
    { top: string; left: string } | undefined
  >();
  const { addToSpamTokens } = useSpamTokens();
  const dispatch = useDispatch();
  const { currency } = useParams();
  const { data: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { data: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { data: brc20CoinsList } = useVisibleBrc20FungibleTokens();

  const [chartPriceStats, setChartPriceStats] = useState<ChartPriceStats | undefined>();

  let selectedFt: FungibleTokenWithStates | undefined;

  if (ftKey && protocol) {
    switch (protocol) {
      case 'stacks':
        selectedFt = sip10CoinsList?.find((ft: FungibleTokenWithStates) => ft.principal === ftKey);
        break;
      case 'brc-20':
        selectedFt = brc20CoinsList?.find((ft: FungibleTokenWithStates) => ft.principal === ftKey);
        break;
      case 'runes':
        selectedFt = runesCoinsList?.find((ft: FungibleTokenWithStates) => ft.principal === ftKey);
        break;
      default:
        selectedFt = undefined;
    }
  }
  const { data: runeUtxos } = useRuneUtxosQuery(
    selectedFt?.protocol === 'runes' ? selectedFt?.name : '',
  );

  const showData = currentTab === 'second';
  const showTxHistory = currentTab === 'first';
  const showStxContract = currentTab === 'third' && selectedFt && protocol === 'stacks';
  const showRuneBundles = currentTab === 'third' && selectedFt && protocol === 'runes';

  useResetUserFlow('/coinDashboard');

  const handleGoBack = () => broadcastResetUserFlow();

  useTrackMixPanelPageViewed(
    protocol
      ? {
          protocol,
        }
      : {},
  );

  const openOptionsDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowOptionsDialog(true);
    setOptionsDialogIndents({
      top: `${(event.target as HTMLElement).parentElement?.getBoundingClientRect().top}px`,
      left: `calc(100% - ${SPAM_OPTIONS_WIDTH}px)`,
    });
  };

  const closeOptionsDialog = () => setShowOptionsDialog(false);
  const showDataTab = useHasFeature(FeatureId.PORTFOLIO_TRACKING);
  return (
    <>
      <TopRow
        onClick={handleGoBack}
        onMenuClick={currency !== 'STX' ? openOptionsDialog : undefined}
      />
      {showOptionsDialog && (
        <OptionsDialog
          closeDialog={closeOptionsDialog}
          optionsDialogIndents={optionsDialogIndents}
          width={SPAM_OPTIONS_WIDTH}
        >
          <ButtonRow
            onClick={() => {
              if (!selectedFt) {
                handleGoBack();
                return;
              }
              // set the visibility to false
              const payload = {
                principal: selectedFt.principal,
                isEnabled: false,
              };
              if (protocol === 'runes') {
                dispatch(setRunesManageTokensAction(payload));
              } else if (protocol === 'stacks') {
                dispatch(setSip10ManageTokensAction(payload));
              } else if (protocol === 'brc-20') {
                dispatch(setBrc20ManageTokensAction(payload));
              }

              addToSpamTokens(selectedFt.principal);
              dispatch(setSpamTokenAction(selectedFt));

              handleGoBack();
            }}
          >
            <Flag size={24} color={Theme.colors.danger_light} />
            <TokenText color="danger_light" typography="body_medium_l">
              {t('HIDE_AND_REPORT')}
            </TokenText>
          </ButtonRow>
        </OptionsDialog>
      )}
      <Container>
        <CoinHeader
          currency={currency as CurrencyTypes}
          fungibleToken={selectedFt}
          chartPriceStats={chartPriceStats}
        />
        <ChartContainer>
          <TokenHistoricalData
            currency={currency as CurrencyTypes}
            fungibleToken={selectedFt}
            setChartPriceStats={setChartPriceStats}
          />
        </ChartContainer>
        {/* TODO: import { Tabs } from ui-library/tabs.tsx */}

        <FtInfoContainer>
          <Button
            disabled={currentTab === 'first'}
            isSelected={currentTab === 'first'}
            onClick={() => setCurrentTab('first')}
          >
            {t('TRANSACTIONS')}
          </Button>
          {showDataTab && (
            <Button
              disabled={currentTab === 'second'}
              isSelected={currentTab === 'second'}
              onClick={() => setCurrentTab('second')}
            >
              {t('MARKET')}
            </Button>
          )}
          <Button
            data-testid="coin-secondary-button"
            disabled={currentTab === 'third'}
            isSelected={currentTab === 'third'}
            onClick={() => setCurrentTab('third')}
          >
            {protocol === 'stacks' && t('CONTRACT')}
            {protocol === 'runes' && t('BUNDLES')}
          </Button>
        </FtInfoContainer>

        {showData && (
          <TokenPrice
            currency={currency as CurrencyTypes}
            fungibleToken={selectedFt as FungibleTokenWithStates}
            chartPriceStats={chartPriceStats}
          />
        )}

        {showTxHistory && (
          <TransactionsHistoryList
            coin={currency as CurrencyTypes}
            stxTxFilter={
              selectedFt?.protocol === 'runes'
                ? selectedFt?.name
                : `${selectedFt?.principal}::${selectedFt?.assetName}`
            }
            brc20Token={protocol === 'brc-20' ? selectedFt?.principal || null : null}
            runeToken={protocol === 'runes' ? selectedFt?.name || null : null}
            runeSymbol={protocol === 'runes' ? selectedFt?.runeSymbol || null : null}
            withTitle={false}
          />
        )}
        {showStxContract && (
          <SecondaryContainer data-testid="coin-secondary-container">
            <h1>{t('FT_CONTRACT_PREFIX')}</h1>
            <ContractAddressCopyButton
              onClick={() => navigator.clipboard.writeText(selectedFt?.principal as string)}
            >
              <TokenContractAddress data-testid="coin-contract-address">
                {getTruncatedAddress(selectedFt?.principal as string, 20)}
              </TokenContractAddress>
              <CopyButtonContainer>
                <CopyButton text={selectedFt?.principal as string} />
              </CopyButtonContainer>
            </ContractAddressCopyButton>
            <ContractDeploymentButton
              onClick={() => window.open(getExplorerUrl(selectedFt?.principal as string), '_blank')}
            >
              {t('OPEN_FT_CONTRACT_DEPLOYMENT')}
              <span>{t('STACKS_EXPLORER')}</span>
              <ShareIcon src={linkIcon} alt="link" />
            </ContractDeploymentButton>
          </SecondaryContainer>
        )}
        {showRuneBundles && (
          <SecondaryContainer data-testid="coin-secondary-container">
            <RuneBundlesContainer>
              {runeUtxos?.map((utxo) => {
                const fullTxId = getFullTxId(utxo);
                const runeAmount = utxo.runes?.filter((rune) => rune[0] === selectedFt?.name)[0][1]
                  .amount;
                return (
                  <RuneBundleRow
                    key={fullTxId}
                    txId={getTxIdFromFullTxId(fullTxId)}
                    vout={getVoutFromFullTxId(fullTxId)}
                    runeAmount={String(ftDecimals(runeAmount ?? 0, selectedFt?.decimals ?? 0))}
                    runeId={selectedFt?.principal ?? ''}
                    runeSymbol={selectedFt?.runeSymbol ?? ''}
                    satAmount={BigNumber(utxo.value).toNumber()}
                    bundle={mapRareSatsAPIResponseToBundle(utxo)}
                  />
                );
              })}
            </RuneBundlesContainer>
          </SecondaryContainer>
        )}
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
