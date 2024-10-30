import { BestBarLoader } from '@components/barLoader';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useAccountBalance from '@hooks/queries/useAccountBalance';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { animated, useTransition } from '@react-spring/web';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { setBalanceHiddenToggleAction } from '@stores/wallet/actions/actionCreators';
import Spinner from '@ui-library/spinner';
import { ANIMATION_EASING, HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { calculateTotalBalance, getAccountBalanceKey } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  min-height: 62px; // it's the height of RowContainer + BalanceContainer + indent between them
  margin-top: ${({ theme }) => theme.space.m};
`;

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.space.xs,
  columnGap: props.theme.space.xxs,
  minHeight: 20,
}));

const BalanceHeadingText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  lineHeight: '140%',
}));

const CurrencyText = styled.label((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const BalanceAmountText = styled.p((props) => ({
  ...props.theme.typography.headline_l,
  lineHeight: '1',
  color: props.theme.colors.white_0,
}));

const BarLoaderContainer = styled.div({
  display: 'flex',
});

const CurrencyCard = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: props.theme.colors.elevation3,
  width: 45,
  borderRadius: 30,
}));

const BalanceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: 'fit-content',
  alignItems: 'center',
  gap: props.theme.spacing(5),
  minHeight: 34,
  cursor: 'pointer',
}));

const ContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

type Props = {
  isLoading: boolean;
  isRefetching: boolean;
};

function BalanceCard({ isLoading, isRefetching }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const dispatch = useDispatch();
  const { fiatCurrency, hideStx, accountBalances, balanceHidden } = useWalletSelector();
  const { confirmedPaymentBalance: btcBalance, isLoading: btcBalanceLoading } =
    useSelectedAccountBtcBalance();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { setAccountBalance } = useAccountBalance();
  // TODO: refactor this into a hook
  const oldTotalBalance = accountBalances[getAccountBalanceKey(selectedAccount)];
  const { data: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { data: brc20CoinsList } = useVisibleBrc20FungibleTokens();
  const { data: runesCoinList } = useVisibleRuneFungibleTokens();

  const balance = calculateTotalBalance({
    stxBalance: BigNumber(stxData?.balance ?? 0)
      .plus(stxData?.locked ?? 0)
      .toString(),
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

  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const loaderTransitions = useTransition(isLoading, {
    from: { opacity: isInitialMount.current ? 1 : 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 400,
      easing: ANIMATION_EASING,
    },
    exitBeforeEnter: true, // This ensures the leave animation completes before the enter animation starts
  });

  return (
    <Container>
      {loaderTransitions((style, loading) => (
        <ContentWrapper>
          <animated.div style={style}>
            {loading ? (
              <>
                <RowContainer>
                  <BarLoaderContainer>
                    <BestBarLoader width={76.5} height={20} />
                  </BarLoaderContainer>
                </RowContainer>
                <BarLoaderContainer>
                  <BestBarLoader width={244} height={34} />
                </BarLoaderContainer>
              </>
            ) : (
              <>
                <RowContainer>
                  <BalanceHeadingText>{t('TOTAL_BALANCE')}</BalanceHeadingText>
                  <CurrencyCard>
                    <CurrencyText data-testid="currency-text">{fiatCurrency}</CurrencyText>
                  </CurrencyCard>
                </RowContainer>
                <BalanceContainer
                  onClick={onClickBalance}
                  role="button"
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                >
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
                          <BalanceAmountText data-testid="total-balance-value">
                            {value}
                          </BalanceAmountText>
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
              </>
            )}
          </animated.div>
        </ContentWrapper>
      ))}
    </Container>
  );
}

export default BalanceCard;
