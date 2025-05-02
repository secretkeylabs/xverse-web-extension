import { GlobalPreferredBtcAddressSheet } from '@components/preferredBtcAddress';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useHasFeature from '@hooks/useHasFeature';
import { broadcastResetUserFlow, useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import type { Tab } from '@screens/coinDashboard';
import BtcTxHistoryList from '@screens/coinDashboard/btcTxHistoryList';
import TokenHistoricalData from '@screens/coinDashboard/tokenHistoricalData';
import TokenPrice, { type ChartPriceStats } from '@screens/coinDashboard/tokenPrice';
import { FeatureId } from '@secretkeylabs/xverse-core';
import { Tabs, type TabProp } from '@ui-library/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CoinHeader from '../../coinHeader';
import { ChartContainer, Container, FtInfoContainer, ScrollContainer } from '../../index.styled';
import BalanceBreakdown from './balanceBreakdown';

export default function CoinDashboard() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const fromSecondaryTab = searchParams.get('secondaryTab') === 'true' ? 'third' : 'first';

  const [currentTab, setCurrentTab] = useState<Tab>(fromSecondaryTab);
  const [showPreferredBtcAddressSheet, setShowPreferredBtcAddressSheet] = useState(false);

  const [chartPriceStats, setChartPriceStats] = useState<ChartPriceStats | undefined>();

  useResetUserFlow('/coinDashboard');

  const showBtcAddressTypeSelector = useCanUserSwitchPaymentType();

  const handleGoBack = () => broadcastResetUserFlow();
  const handleChangeAddressTypeClick = showBtcAddressTypeSelector
    ? () => setShowPreferredBtcAddressSheet(true)
    : undefined;

  useTrackMixPanelPageViewed({});

  const onCancelAddressType = () => setShowPreferredBtcAddressSheet(false);
  const showDataTab = useHasFeature(FeatureId.PORTFOLIO_TRACKING);

  const tabs: TabProp<Tab>[] = [
    {
      label: t('TRANSACTIONS'),
      value: 'first',
    },
    {
      label: t('BREAKDOWN'),
      value: 'third',
    },
  ];

  if (showDataTab) {
    tabs.splice(1, 0, {
      label: t('ABOUT'),
      value: 'second',
    });
  }

  return (
    <>
      <TopRow onClick={handleGoBack} onSettingsClick={handleChangeAddressTypeClick} />
      <ScrollContainer>
        <Container>
          <CoinHeader currency="BTC" chartPriceStats={chartPriceStats} />
          <ChartContainer>
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
          {currentTab === 'first' && <BtcTxHistoryList />}
          {currentTab === 'second' && <TokenPrice currency="BTC" fungibleToken={undefined} />}
          {currentTab === 'third' && <BalanceBreakdown />}
        </Container>
      </ScrollContainer>
      <BottomBar tab="dashboard" />
      <GlobalPreferredBtcAddressSheet
        onHide={onCancelAddressType}
        visible={showPreferredBtcAddressSheet}
      />
    </>
  );
}
