import BarLoader from '@components/barLoader';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { setBalanceHiddenToggleAction } from '@stores/wallet/actions/actionCreators';
import Spinner from '@ui-library/spinner';
import { HIDDEN_BALANCE_LABEL, LoaderSize } from '@utils/constants';
import { calculateTotalBalance, getAccountBalanceKey } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useDispatch } from 'react-redux';
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
  width: 'fit-content',
  alignItems: 'center',
  gap: props.theme.spacing(5),
  cursor: 'pointer',
}));

interface BalanceCardProps {
  isLoading: boolean;
  isRefetching: boolean;
}

function BalanceCard(props: BalanceCardProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const dispatch = useDispatch();
  const { fiatCurrency, hideStx, accountBalances, balanceHidden } = useWalletSelector();
  const { confirmedPaymentBalance: btcBalance, isLoading: btcBalanceLoading } =
    useSelectedAccountBtcBalance();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { setAccountBalance } = useAccountBalance();
  const { isLoading, isRefetching } = props;
  // TODO: refactor this into a hook
  const oldTotalBalance = accountBalances[getAccountBalanceKey(selectedAccount)];
  const { data: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { data: brc20CoinsList } = useVisibleBrc20FungibleTokens();
  const { data: runesCoinList } = useVisibleRuneFungibleTokens();

  const balance = calculateTotalBalance({
    stxBalance: BigNumber(stxData?.balance ?? 0).toString(),
    btcBalance: (btcBalance ?? 0).toString(),
    sipCoinsList: sip10CoinsList,
    brcCoinsList: brc20CoinsList,
    runesCoinList,
    btcFiatRate,
    stxBtcRate,
    hideStx,
  });

  useEffect(() => {
    if (!balance || !selectedAccount || isLoading || btcBalanceLoading || isRefetching) {
      return;
    }

    if (oldTotalBalance !== balance) {
      setAccountBalance(selectedAccount, balance);
    }
  }, [balance, oldTotalBalance, selectedAccount, isLoading, isRefetching, btcBalanceLoading]);

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

  const onClickBalance = () => dispatch(setBalanceHiddenToggleAction({ toggle: !balanceHidden }));

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') onClickBalance();
  };

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
        <BalanceContainer onClick={onClickBalance} role="button" tabIndex={0} onKeyDown={onKeyDown}>
          {balanceHidden && (
            <BalanceAmountText data-testid="total-balance-value">
              {HIDDEN_BALANCE_LABEL}
            </BalanceAmountText>
          )}
          {!balanceHidden && (
            <>
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
            </>
          )}
        </BalanceContainer>
      )}
    </>
  );
}

export default BalanceCard;
