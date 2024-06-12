import useLockedBtcData from '@hooks/queries/useLockedBtcData';
import useWalletSelector from '@hooks/useWalletSelector';
import { BtcAddressData, satsToBtc } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { formatDate } from '@utils/date';
import { lockedBitcoins } from '@utils/locked';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const ListItemsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const ListHeader = styled.h1((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(12),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  ...props.theme.headline_s,
}));

const LoadingContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const NoTransactionsContainer = styled.div((props) => ({
  ...props.theme.body_m,
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  color: props.theme.colors.white_400,
}));

const LockedBtcContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: props.theme.spacing(5),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  background: 'none',
  ':hover': {
    background: props.theme.colors.white_900,
  },
  ':focus': {
    background: props.theme.colors.white_850,
  },
}));
const LockedAddress = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));
const LockedAmountContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});
const LockeTimeContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});
const LockedValue = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));
function formatAddress(addr: string): string {
  return addr ? `${addr.substring(0, 4)}...${addr.substring(addr.length - 4, addr.length)}` : '';
}

function LockedBtcItem({
  lockedBtcData,
  lockTime = 0,
}: {
  lockedBtcData: BtcAddressData;
  lockTime?: number;
}) {
  return (
    <LockedBtcContainer>
      <LockedAddress>{formatAddress(lockedBtcData?.address ?? '')}</LockedAddress>
      <LockedAmountContainer>
        <NumericFormat
          value={satsToBtc(BigNumber(lockedBtcData?.finalBalance)).toString()}
          displayType="text"
          thousandSeparator
          allowNegative={false}
          renderText={(value: string) => <LockedValue>{`${value} BTC`}</LockedValue>}
        />
      </LockedAmountContainer>
      <LockeTimeContainer>
        <LockedValue>{`${formatDate(new Date(lockTime * 1000))}`}</LockedValue>
      </LockeTimeContainer>
    </LockedBtcContainer>
  );
}

export default function LockedBtcList() {
  const { lockedBtcBalances, btcAddress } = useWalletSelector();
  const { isLoading, error } = useLockedBtcData();
  const [lockedBtcMap, setLockedBtcMap] = useState<{
    [key: string]: { script: string; lockTime: number };
  }>();
  useEffect(() => {
    (async () => {
      const lockedMap = await lockedBitcoins.get(btcAddress);
      setLockedBtcMap(lockedMap);
    })();
  }, [btcAddress]);

  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  return (
    <ListItemsContainer>
      <ListHeader>{t('LOCKED_BTC_LIST_TITLE')}</ListHeader>
      {Object.keys(lockedBtcBalances).map((address) => (
        <LockedBtcItem
          key={address}
          lockedBtcData={lockedBtcBalances[address]}
          lockTime={lockedBtcMap?.[address].lockTime}
        />
      ))}
      {isLoading && (
        <LoadingContainer>
          <Spinner color="white" size={20} />
        </LoadingContainer>
      )}
      {!!error && <NoTransactionsContainer>{t('LOCKED_BTC_LIST_ERROR')}</NoTransactionsContainer>}
      {Object.keys(lockedBtcBalances).length === 0 && !error && (
        <NoTransactionsContainer>{t('LOCKED_BTC_LIST_EMPTY')}</NoTransactionsContainer>
      )}
    </ListItemsContainer>
  );
}
