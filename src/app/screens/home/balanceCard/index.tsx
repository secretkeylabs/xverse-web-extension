import { BestBarLoader } from '@components/barLoader';
import PercentageChange from '@components/percentageChange';
import { useVisibleBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { useStore } from '@hooks/useStore';
import useToggleBalanceView from '@hooks/useToggleBalanceView';
import useWalletSelector from '@hooks/useWalletSelector';
import { Eye } from '@phosphor-icons/react';
import { animated, useTransition } from '@react-spring/web';
import {
  currencySymbolMap,
  getFiatBtcEquivalent,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import {
  ANIMATION_EASING,
  BTC_SYMBOL,
  HIDDEN_BALANCE_LABEL,
  type CurrencyTypes,
} from '@utils/constants';
import { calculateTotalBalance } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import {
  BalanceAmountText,
  BalanceContainer,
  BalanceHeadingText,
  BarLoaderContainer,
  Container,
  ContentWrapper,
  LoaderContainer,
  PercentageChangeContainer,
  RowContainer,
  ShowBalanceButton,
} from './index.styled';

type Props = {
  isLoading: boolean;
  isRefetching: boolean;
  combinedFtList: FungibleToken[];
};

function BalanceCard({ isLoading, isRefetching, combinedFtList }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const selectedAccount = useSelectedAccount();
  const { fiatCurrency, hideStx, balanceHidden, showBalanceInBtc, network } = useWalletSelector();
  const { confirmedPaymentBalance: btcBalance, isLoading: btcBalanceLoading } =
    useSelectedAccountBtcBalance();
  const accountBalanceStore = useStore(
    'accountBalances',
    (store, utils) => store[utils.getAccountStorageKey(selectedAccount, network.type)],
  );

  const { data: stxData, isLoading: stxLoading } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: sip10CoinsList = [] } = useVisibleSip10FungibleTokens();
  const { data: brc20CoinsList = [] } = useVisibleBrc20FungibleTokens();
  const { data: runesCoinList = [] } = useVisibleRuneFungibleTokens();
  const { toggleBalanceView, balanceDisplayState } = useToggleBalanceView();

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
    if (
      !balance ||
      !selectedAccount ||
      isLoading ||
      btcBalanceLoading ||
      stxLoading ||
      isRefetching
    ) {
      return;
    }

    if (accountBalanceStore.data !== balance) {
      accountBalanceStore.actions.setAccountBalance(selectedAccount, network.type, balance);
    }
  }, [
    balance,
    accountBalanceStore.data,
    accountBalanceStore.actions,
    selectedAccount,
    isLoading,
    isRefetching,
    btcBalanceLoading,
    stxLoading,
    network.type,
  ]);

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

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') toggleBalanceView();
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
              <LoaderContainer>
                <BarLoaderContainer>
                  <BestBarLoader width={96} height={20} />
                </BarLoaderContainer>
                <BarLoaderContainer>
                  <BestBarLoader width={244} height={34} />
                </BarLoaderContainer>
                <BarLoaderContainer>
                  <BestBarLoader width={96} height={20} />
                </BarLoaderContainer>
              </LoaderContainer>
            ) : (
              <>
                <RowContainer>
                  {balanceHidden ? (
                    <ShowBalanceButton onClick={toggleBalanceView}>
                      <Eye size={20} weight="fill" />
                      {t('SHOW_BALANCE')}
                    </ShowBalanceButton>
                  ) : (
                    <BalanceHeadingText>
                      {t('TOTAL_BALANCE')}{' '}
                      <span data-testid="currency-text">
                        {showBalanceInBtc ? commonT('BTC') : fiatCurrency}
                      </span>
                    </BalanceHeadingText>
                  )}
                </RowContainer>
                <BalanceContainer
                  onClick={toggleBalanceView}
                  role="button"
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                >
                  {(() => {
                    switch (balanceDisplayState) {
                      case 'btc':
                        return (
                          <NumericFormat
                            value={getFiatBtcEquivalent(
                              BigNumber(balance),
                              BigNumber(btcFiatRate),
                            ).toString()}
                            displayType="text"
                            prefix={BTC_SYMBOL}
                            thousandSeparator
                            renderText={(value: string) => (
                              <BalanceAmountText aria-label={`Total balance: ${value}`}>
                                {value}
                              </BalanceAmountText>
                            )}
                          />
                        );
                      case 'hidden':
                        return (
                          <BalanceAmountText aria-label={`Total balance: ${HIDDEN_BALANCE_LABEL}`}>
                            {HIDDEN_BALANCE_LABEL}
                          </BalanceAmountText>
                        );
                      case 'unmodified':
                      default:
                        return (
                          <>
                            <NumericFormat
                              value={balance}
                              displayType="text"
                              prefix={`${currencySymbolMap[fiatCurrency]}`}
                              thousandSeparator
                              renderText={(value: string) => (
                                <BalanceAmountText
                                  aria-label={`Total balance: ${value} ${fiatCurrency}`}
                                >
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
                        );
                    }
                  })()}
                </BalanceContainer>
                <PercentageChangeContainer>
                  <PercentageChange
                    isHidden={balanceHidden}
                    displayTimeInterval
                    displayBalanceChange
                    ftCurrencyPairs={[
                      [undefined, 'BTC'],
                      [undefined, 'STX'],
                      ...combinedFtList.map(
                        (ft) => [ft, 'FT'] as [FungibleToken | undefined, CurrencyTypes],
                      ),
                    ]}
                  />
                </PercentageChangeContainer>
              </>
            )}
          </animated.div>
        </ContentWrapper>
      ))}
    </Container>
  );
}

export default BalanceCard;
