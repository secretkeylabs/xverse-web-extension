import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import Theme from 'theme';
import type { ChartPriceStats } from '../tokenPrice';

type HistoricalDataChartProps = {
  data: { x: number; y: number; tooltipLabel: string }[];
  setChartPriceStats: Dispatch<SetStateAction<ChartPriceStats | undefined>>;
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any }) {
  return active && payload && payload.length ? (
    <span>{payload[0].payload.tooltipLabel}</span>
  ) : null;
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
  const fillColor = increased ? colors.emerald : '#F00';

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
