import { BetterBarLoader } from '@components/barLoader';
import { ChartLine } from '@phosphor-icons/react';
import type {
  HistoricalDataResponsePrice,
  HistoricalDataResponsePrices,
} from '@secretkeylabs/xverse-core';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import Theme from 'theme';
import type { ChartPriceStats } from '../tokenPrice';

type HistoricalDataChartProps = {
  data: HistoricalDataResponsePrices;
  setChartPriceStats: Dispatch<SetStateAction<ChartPriceStats | undefined>>;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: undefined | [{ payload: HistoricalDataResponsePrice }];
}) {
  return active && payload && payload.length ? (
    <span>{payload[0].payload.tooltipLabel}</span>
  ) : null;
}

const StyledBetterBarLoader = styled(BetterBarLoader)<{}>({
  marginLeft: '-21px',
});
export function LoadingHistoricalDataChart() {
  return <StyledBetterBarLoader width={370} height={215} />;
}

const EmptyHistoricalDataChartContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: Theme.space.xxs,
  marginRight: Theme.space.m,
  marginTop: Theme.space.xxl,
  height: '130px',
});
const StyledChartLine = styled(ChartLine)({
  marginBottom: '20px',
});
const Title = styled.h1({
  ...Theme.typography.body_medium_l,
  textAlign: 'center',
});
const Text = styled.p({
  ...Theme.typography.body_m,
  color: Theme.colors.white_400,
  textAlign: 'center',
});
export function EmptyHistoricalDataChart() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_PRICE_CHART.EMPTY_CHART' });

  return (
    <EmptyHistoricalDataChartContainer>
      <StyledChartLine color={Theme.colors.white_600} size="40" />

      <Title>{t('TITLE')}</Title>
      <Text>{t('TEXT')}</Text>
    </EmptyHistoricalDataChartContainer>
  );
}

const MissingPeriodHistoricalDataChartContainer = styled.div({
  marginTop: '104px',
  marginBottom: '154px',
});
export function MissingPeriodHistoricalDataChart() {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_PRICE_CHART.MISSING_PERIOD' });

  return (
    <MissingPeriodHistoricalDataChartContainer>
      <Text>{t('TEXT')}</Text>
    </MissingPeriodHistoricalDataChartContainer>
  );
}

export default function HistoricalDataChart({
  data,
  setChartPriceStats,
}: HistoricalDataChartProps) {
  const first = data[0].y;
  const last = data[data.length - 1].y;
  const defaultChartPriceStats = { amount: last, change: last / first };

  const { colors } = Theme;
  const increased = last > first;
  const strokeColor = increased ? colors.success_medium : colors.danger_medium;
  const fillColor = increased ? colors.emerald : colors.red_0;

  const onMouseLeave = () => setChartPriceStats(defaultChartPriceStats);
  const onMouseMove = (e) => {
    const selectedAmount = e.activePayload?.at(0)?.payload.y;
    if (selectedAmount) {
      setChartPriceStats({ amount: selectedAmount, change: selectedAmount / first });
    }
  };

  useEffect(() => {
    setChartPriceStats(defaultChartPriceStats);
  }, [data]);

  return (
    <AreaChart
      // eslint-disable-next-line
      style={{ marginLeft: '-21px' }}
      width={370}
      height={215}
      data={data}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <XAxis hide dataKey="x" />
      <YAxis hide />
      <Tooltip
        content={<CustomTooltip />}
        position={{ y: -20 }}
        cursor={{
          stroke: 'grey',
          strokeWidth: '1',
          strokeDasharray: '1.5',
        }}
      />
      <defs>
        <linearGradient id="gradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="y" stroke={strokeColor} fill="url(#gradientFill)" />
    </AreaChart>
  );
}
