import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { broadcastResetUserFlow, useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import CoinHeader from '../../coinHeader';
import { Container } from '../../index.styled';

// type Tab = 'transactions' | 'market';

export default function Strk() {
  // const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  // const [currentTab, setCurrentTab] = useState<Tab>('transactions');

  // const [chartPriceStats, setChartPriceStats] = useState<ChartPriceStats | undefined>();

  useResetUserFlow('/coinDashboard');

  const handleGoBack = () => broadcastResetUserFlow();

  useTrackMixPanelPageViewed({});

  // const tabs: TabProp<Tab>[] = [
  //   {
  //     label: t('TRANSACTIONS'),
  //     value: 'transactions',
  //   },
  //   {
  //     label: t('BREAKDOWN'),
  //     value: 'market',
  //   },
  // ];

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <CoinHeader
          currency="STRK"
          // chartPriceStats={chartPriceStats}
        />
        {/* <ChartContainer>
          <TokenHistoricalData
            currency="BTC"
            fungibleToken={undefined}
            setChartPriceStats={setChartPriceStats}
          />
        </ChartContainer>
        <FtInfoContainer>
          <Tabs
            tabs={tabs}
            activeTab={currentTab}
            onTabClick={(tabClicked: Tab) => setCurrentTab(tabClicked)}
          />
        </FtInfoContainer>
        {currentTab === 'first' && (
          <TransactionsHistoryList
            withTitle={false}
            coin="BTC"
            stxTxFilter={null}
            brc20Token={null}
            runeToken={null}
            runeSymbol={null}
          />
        )}
        {currentTab === 'second' && (
          <TokenPrice currency="BTC" fungibleToken={undefined} chartPriceStats={chartPriceStats} />
        )}
        {currentTab === 'third' && <BalanceBreakdown />} */}
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
