import useGetHistoricalData from '@hooks/queries/useGetHistoricalData';
import {
  HistoricalDataPeriods,
  type FungibleToken,
  type HistoricalDataParamsPeriod,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import type { CurrencyTypes } from '@utils/constants';
import { useState, type Dispatch, type SetStateAction } from 'react';
import styled from 'styled-components';
import { Button } from '../index.styled';
import type { ChartPriceStats } from '../tokenPrice';
import HistoricalDataChart from './HistoricalDataChart';

const TabContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.xl,
}));

const LoadingContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'left',
  alignItems: 'center',
});

type TokenHistoricalDataProps = {
  currency: CurrencyTypes;
  fungibleToken: FungibleToken | undefined;
  setChartPriceStats: Dispatch<SetStateAction<ChartPriceStats | undefined>>;
};

export default function TokenHistoricalData({
  currency,
  fungibleToken,
  setChartPriceStats,
}: TokenHistoricalDataProps) {
  // const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [currentTab, setCurrentTab] = useState<HistoricalDataParamsPeriod>('1d');
  const { data, isLoading } = useGetHistoricalData(fungibleToken?.name || currency, currentTab);

  return (
    <>
      <TabContainer>
        {HistoricalDataPeriods.map((tab) => (
          <Button
            key={tab}
            disabled={currentTab === tab}
            isSelected={currentTab === tab}
            onClick={() => setCurrentTab(tab)}
          >
            {tab.toUpperCase()}
          </Button>
        ))}
      </TabContainer>
      {isLoading ? (
        <LoadingContainer>
          <Spinner color="white" size={20} />
        </LoadingContainer>
      ) : data?.length ? (
        <HistoricalDataChart data={data} setChartPriceStats={setChartPriceStats} />
      ) : null}
    </>
  );
}
