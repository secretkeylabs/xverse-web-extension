/**
import useGetHistoricalData from '@hooks/queries/useGetHistoricalData';
import {
  HistoricalDataPeriods,
  type FungibleToken,
  type HistoricalDataParamsPeriod,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import type { CurrencyTypes } from '@utils/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button } from './index.styled';

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
};

export default function TokenHistoricalData({ currency, fungibleToken }: TokenHistoricalDataProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const [currentTab, setCurrentTab] = useState<HistoricalDataParamsPeriod>('1d');
  const { data, isLoading } = useGetHistoricalData(fungibleToken?.name || currency, currentTab);

  useEffect(() => {
    console.log('chm data: ', data, isLoading);
  }, [data, isLoading]);

  // chm todo: split the core formatting to two methods; one fetching and one formatting
  // chm todo: create a new component that takes in the tuples and returns a victoryjs chart
  // chm todo: add the chart

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
      ) : // <VictoryLine
      //   standalone={false}
      //   theme={VictoryTheme.material}
      //   containerComponent={
      //     <svg
      //       style={{
      //         border: 'none',
      //         boxShadow: 'none',
      //         width: '100%',
      //         height: '100%',
      //         display: 'block',
      //       }}
      //     />
      //   }
      //   style={{
      //     parent: { border: 'none', boxShadow: 'none', width: window.innerWidth },
      //   }}
      //   data={[
      //     { x: 1, y: 2 },
      //     { x: 2, y: 3 },
      //     { x: 3, y: 5 },
      //     { x: 4, y: 4 },
      //     { x: 5, y: 6 },
      //   ]}
      // />
      null}
    </>
  );
}
 */
