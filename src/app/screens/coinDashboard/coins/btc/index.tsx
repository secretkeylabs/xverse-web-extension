import { GlobalPreferredBtcAddressSheet } from '@components/preferredBtcAddress';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import { broadcastResetUserFlow, useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { Tabs, type TabProp } from '@ui-library/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CoinHeader from '../../coinHeader';
import { Container, FtInfoContainer } from '../../index.styled';
import TransactionsHistoryList from '../../transactionsHistoryList';
import BalanceBreakdown from './balanceBreakdown';

export default function CoinDashboard() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const fromSecondaryTab = searchParams.get('secondaryTab') === 'true' ? 'secondary' : 'primary';

  const [currentTab, setCurrentTab] = useState<'primary' | 'secondary'>(fromSecondaryTab);
  const [showPreferredBtcAddressSheet, setShowPreferredBtcAddressSheet] = useState(false);

  useResetUserFlow('/coinDashboard');

  const showBtcAddressTypeSelector = useCanUserSwitchPaymentType();

  const handleGoBack = () => broadcastResetUserFlow();
  const handleChangeAddressTypeClick = showBtcAddressTypeSelector
    ? () => setShowPreferredBtcAddressSheet(true)
    : undefined;

  useTrackMixPanelPageViewed({});

  const onCancelAddressType = () => setShowPreferredBtcAddressSheet(false);

  const tabs: TabProp<'primary' | 'secondary'>[] = [
    {
      label: t('TRANSACTIONS'),
      value: 'primary',
    },
    {
      label: t('BREAKDOWN'),
      value: 'secondary',
    },
  ];

  return (
    <>
      <TopRow onClick={handleGoBack} onSettingsClick={handleChangeAddressTypeClick} />
      <Container>
        <CoinHeader currency="BTC" />
        <FtInfoContainer>
          <Tabs
            tabs={tabs}
            activeTab={currentTab}
            onTabClick={(tabClicked: 'primary' | 'secondary') => setCurrentTab(tabClicked)}
          />
        </FtInfoContainer>
        {currentTab === 'primary' && (
          <TransactionsHistoryList
            withTitle={false}
            coin="BTC"
            stxTxFilter={null}
            brc20Token={null}
            runeToken={null}
            runeSymbol={null}
          />
        )}
        {currentTab === 'secondary' && <BalanceBreakdown />}
      </Container>
      <BottomBar tab="dashboard" />
      <GlobalPreferredBtcAddressSheet
        onHide={onCancelAddressType}
        visible={showPreferredBtcAddressSheet}
      />
    </>
  );
}
