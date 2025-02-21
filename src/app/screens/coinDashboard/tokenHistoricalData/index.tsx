import useGetCoinsMarketData from '@hooks/queries/useGetCoinsMarketData';
import useGetHistoricalData from '@hooks/queries/useGetHistoricalData';
import {
  HistoricalDataPeriods,
  type FungibleToken,
  type HistoricalDataParamsPeriod,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import styled from 'styled-components';
import { Button } from '../index.styled';
import type { ChartPriceStats } from '../tokenPrice';
import HistoricalDataChart, {
  EmptyHistoricalDataChart,
  LoadingHistoricalDataChart,
  MissingPeriodHistoricalDataChart,
} from './HistoricalDataChart';

const TabContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.space.m,
  justifyContent: 'center',
}));

type TokenHistoricalDataProps = {
  currency: CurrencyTypes;
  fungibleToken: FungibleToken | undefined;
  setChartPriceStats: Dispatch<SetStateAction<ChartPriceStats | undefined>>;
};

const FIRST_TAB = '1d';

export default function TokenHistoricalData({
  currency,
  fungibleToken,
  setChartPriceStats,
}: TokenHistoricalDataProps) {
  const [currentTab, setCurrentTab] = useState<HistoricalDataParamsPeriod>(FIRST_TAB);
  const { data, isLoading } = useGetHistoricalData(
    fungibleToken?.assetName || currency,
    currentTab,
  );
  const { data: btcMarketData } = useGetCoinsMarketData('bitcoin');
  const { data: stxMarketData } = useGetCoinsMarketData('blockstack');

  const dataToRender = useMemo(() => {
    const currentPrice =
      currency === 'BTC'
        ? btcMarketData?.current_price
        : currency === 'STX'
        ? stxMarketData?.current_price
        : fungibleToken?.currentPrice;
    const priceChangePercentage24h =
      currency === 'BTC'
        ? btcMarketData?.price_change_percentage_24h
        : currency === 'STX'
        ? stxMarketData?.price_change_percentage_24h
        : fungibleToken?.priceChangePercentage24h;

    if (!currentPrice || !data?.length) {
      return data;
    }

    const dataToRenderInternal = [...data];
    dataToRenderInternal[dataToRenderInternal.length - 1] = {
      ...dataToRenderInternal[dataToRenderInternal.length - 1],
      y: +currentPrice,
    };

    if (currentTab === '1d' && priceChangePercentage24h) {
      const priceChangePercentage = +priceChangePercentage24h;
      dataToRenderInternal[0] = {
        ...dataToRenderInternal[0],
        y: +currentPrice / (priceChangePercentage / 100 + 1),
      };
    }

    return dataToRenderInternal;
  }, [
    data,
    currency,
    btcMarketData?.current_price,
    stxMarketData?.current_price,
    btcMarketData?.price_change_percentage_24h,
    stxMarketData?.price_change_percentage_24h,
    fungibleToken?.currentPrice,
    fungibleToken?.priceChangePercentage24h,
    currentTab,
  ]);

  const noDataAtAll = !isLoading && !data?.length && currentTab === FIRST_TAB;
  if (noDataAtAll) return <EmptyHistoricalDataChart />;

  const renderChart = () => {
    if (isLoading) {
      return <LoadingHistoricalDataChart />;
    }

    if (dataToRender?.length) {
      return <HistoricalDataChart data={dataToRender} setChartPriceStats={setChartPriceStats} />;
    }

    return <MissingPeriodHistoricalDataChart />;
  };

  return (
    <>
      {renderChart()}
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
    </>
  );
}
