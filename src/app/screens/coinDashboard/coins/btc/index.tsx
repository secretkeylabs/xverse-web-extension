import { GlobalPreferredBtcAddressSheet } from '@components/preferredBtcAddress';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import { broadcastResetUserFlow, useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CoinHeader from '../../coinHeader';
import { Button, Container, FtInfoContainer } from '../../index.styled';
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

  return (
    <>
      <TopRow onClick={handleGoBack} onSettingsClick={handleChangeAddressTypeClick} />
      <Container>
        <CoinHeader currency="BTC" />
        {/* TODO: import { Tabs } from ui-library/tabs.tsx */}
        <FtInfoContainer>
          <Button
            disabled={currentTab === 'primary'}
            isSelected={currentTab === 'primary'}
            onClick={() => setCurrentTab('primary')}
          >
            {t('TRANSACTIONS')}
          </Button>
          <Button
            data-testid="coin-secondary-button"
            disabled={currentTab === 'secondary'}
            isSelected={currentTab === 'secondary'}
            onClick={() => setCurrentTab('secondary')}
          >
            {t('BREAKDOWN')}
          </Button>
        </FtInfoContainer>
        {currentTab === 'primary' && (
          <TransactionsHistoryList
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
