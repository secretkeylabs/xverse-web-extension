import BarLoader from '@components/barLoader';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useGetRuneFungibleTokens';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { LoaderSize } from '@utils/constants';
import { calculateTotalBalance } from '@utils/helper';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(11),
}));

const BalanceHeadingText = styled.h3((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_200,
  textTransform: 'uppercase',
  opacity: 0.7,
}));

const CurrencyText = styled.label((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_0,
  fontSize: 13,
}));

const BalanceAmountText = styled.p((props) => ({
  ...props.theme.headline_xl,
  color: props.theme.colors.white_0,
}));

const BarLoaderContainer = styled.div((props) => ({
  display: 'flex',
  maxWidth: 300,
  marginTop: props.theme.spacing(5),
}));

const CurrencyCard = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: props.theme.colors.elevation3,
  width: 45,
  borderRadius: 30,
  marginLeft: props.theme.spacing(4),
}));

const BalanceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: props.theme.spacing(5),
}));

interface BalanceCardProps {
  isLoading: boolean;
  isRefetching: boolean;
}

function BalanceCard(props: BalanceCardProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const { fiatCurrency, hideStx, accountBalances } = useWalletSelector();
  const { data: btcBalance } = useBtcWalletData();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const { setAccountBalance } = useAccountBalance();
  const { isLoading, isRefetching } = props;
  const oldTotalBalance = accountBalances[selectedAccount.btcAddress];
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { visible: brc20CoinsList } = useVisibleBrc20FungibleTokens();
  const { visible: runesCoinList } = useVisibleRuneFungibleTokens();

  const balance = calculateTotalBalance({
    stxBalance: stxData?.balance.toString() ?? '0',
    btcBalance: btcBalance?.toString() ?? '0',
    sipCoinsList: sip10CoinsList,
    brcCoinsList: brc20CoinsList,
    runesCoinList,
    btcFiatRate,
    stxBtcRate,
    hideStx,
  });

  useEffect(() => {
    if (!balance || !selectedAccount || isLoading || isRefetching) {
      return;
    }

    if (oldTotalBalance !== balance) {
      setAccountBalance(selectedAccount, balance);
    }
  }, [balance, oldTotalBalance, selectedAccount, isLoading, isRefetching]);

  useEffect(() => {
    (() => {
      const balanceEl = document.getElementById('balance');

      if (!balanceEl || !balanceEl.parentElement) {
        return;
      }

      const fontSize = balanceEl.style.fontSize ? parseInt(balanceEl.style.fontSize, 10) : 42;

      for (let i = fontSize; i >= 0; i--) {
        // 26 is loading icon + padding
        const overflow = balanceEl.clientWidth + 26 > balanceEl.parentElement.clientWidth;
        if (overflow) {
          balanceEl.style.fontSize = `${i}px`;
        }
      }
    })();
  });

  return (
    <>
      <RowContainer>
        <BalanceHeadingText>{t('TOTAL_BALANCE')}</BalanceHeadingText>
        <CurrencyCard>
          <CurrencyText data-testid="currency-text">{fiatCurrency}</CurrencyText>
        </CurrencyCard>
      </RowContainer>
      {isLoading ? (
        <BarLoaderContainer>
          <BarLoader loaderSize={LoaderSize.LARGE} />
        </BarLoaderContainer>
      ) : (
        <BalanceContainer>
          <NumericFormat
            value={balance}
            displayType="text"
            prefix={`${currencySymbolMap[fiatCurrency]}`}
            thousandSeparator
            renderText={(value: string) => (
              <BalanceAmountText data-testid="total-balance-value">{value}</BalanceAmountText>
            )}
          />
          {isRefetching && (
            <div>
              <Spinner color="white" size={16} />
            </div>
          )}
        </BalanceContainer>
      )}
    </>
  );
}

export default BalanceCard;
