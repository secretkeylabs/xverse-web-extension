import ArrowDown from '@assets/img/dashboard/arrow_down.svg';
import ArrowUp from '@assets/img/dashboard/arrow_up.svg';
import Buy from '@assets/img/dashboard/black_plus.svg';
import List from '@assets/img/dashboard/list.svg';
import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import Lock from '@assets/img/transactions/Lock.svg';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import PercentageChange from '@components/percentageChange';
import SquareButton from '@components/squareButton';
import TokenImage from '@components/tokenImage';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useHasFeature from '@hooks/useHasFeature';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useToggleBalanceView from '@hooks/useToggleBalanceView';
import useWalletSelector from '@hooks/useWalletSelector';
import { getTrackingIdentifier, isMotherToken } from '@screens/swap/utils';
import {
  AnalyticsEvents,
  FeatureId,
  currencySymbolMap,
  getFiatBtcEquivalent,
  getFiatEquivalent,
  microstacksToStx,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { BTC_SYMBOL, HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { isInOptions, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import RoutePaths from 'app/routes/paths';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import {
  AvailableStxContainer,
  BalanceInfoContainer,
  BalanceTitleText,
  BalanceValuesContainer,
  CoinBalanceText,
  Container,
  FiatAmountText,
  FiatContainer,
  HeaderSeparator,
  LockedStxContainer,
  PriceStatsContainer,
  ProtocolText,
  RowButtonContainer,
  RowContainer,
  StacksLockedInfoText,
  StxLockedText,
  VerifyButtonContainer,
  VerifyOrViewContainer,
} from './coinHeader.styled';
import type { ChartPriceStats } from './tokenPrice';

type Props = {
  currency: CurrencyTypes;
  fungibleToken?: FungibleToken;
  chartPriceStats?: ChartPriceStats;
};

export default function CoinHeader({ currency, fungibleToken, chartPriceStats }: Props) {
  const selectedAccount = useSelectedAccount();
  const { fiatCurrency, network, balanceHidden } = useWalletSelector();

  // TODO: this should be a dumb component, move the logic to the parent
  // TODO: currently, we get btc and stx balances here for all currencies and FTs, but we should get them in
  // TODO: the relevant parent and pass them as props
  const { confirmedPaymentBalance: btcBalance } = useSelectedAccountBtcBalance();
  const { data: stxData } = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const isReceivingAddressesVisible = !isLedgerAccount(selectedAccount);

  const fiatValue = getFiatEquivalent(
    Number(getBalanceAmount(currency, fungibleToken, stxData, btcBalance)),
    currency,
    BigNumber(stxBtcRate),
    BigNumber(btcFiatRate),
    fungibleToken,
  );
  const btcValue = fiatValue
    ? getFiatBtcEquivalent(BigNumber(fiatValue), BigNumber(btcFiatRate)).toString()
    : undefined;
  const { toggleBalanceView, balanceDisplayState } = useToggleBalanceView(
    currency === 'BTC' || !fiatValue,
  );

  const showRunesListing =
    (useHasFeature(FeatureId.RUNES_LISTING) || process.env.NODE_ENV === 'development') &&
    network.type === 'Mainnet' &&
    fungibleToken?.protocol === 'runes';

  const handleReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const handleReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const getTokenTicker = () => {
    if (currency === 'STX' || currency === 'BTC') {
      return currency;
    }
    if (currency === 'FT' && fungibleToken) {
      return getFtTicker(fungibleToken);
    }
    return '';
  };

  const renderStackingBalances = () => {
    if (!new BigNumber(stxData?.locked ?? 0).eq(0) && currency === 'STX') {
      return (
        <>
          <HeaderSeparator />
          <Container>
            <LockedStxContainer>
              <img src={Lock} alt="locked" />
              <StacksLockedInfoText>{t('STX_LOCKED_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxData?.locked ?? '0')).toString()}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => (
                  <StxLockedText>
                    {balanceHidden && HIDDEN_BALANCE_LABEL}
                    {!balanceHidden && `${value} STX`}
                  </StxLockedText>
                )}
              />
            </LockedStxContainer>
            <AvailableStxContainer>
              <StacksLockedInfoText>{t('STX_AVAILABLE_BALANCE_PREFIX')}</StacksLockedInfoText>
              <NumericFormat
                value={microstacksToStx(new BigNumber(stxData?.availableBalance ?? 0)).toString()}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => (
                  <StxLockedText>
                    {balanceHidden && HIDDEN_BALANCE_LABEL}
                    {!balanceHidden && `${value} STX`}
                  </StxLockedText>
                )}
              />
            </AvailableStxContainer>
          </Container>
        </>
      );
    }
  };

  const goToSendScreen = async () => {
    let route = '';
    if (currency === 'BTC' || currency === 'STX') {
      route = `/send-${currency}`;
    } else {
      switch (fungibleToken?.protocol) {
        case 'stacks':
          route = `${RoutePaths.SendStx}?principal=${fungibleToken?.principal}`;
          break;
        case 'brc-20':
          route = `${RoutePaths.SendBrc20OneStep}?principal=${fungibleToken?.principal}`;
          break;
        case 'runes':
          route = `${RoutePaths.SendRune}?principal=${fungibleToken?.principal}`;
          break;
        default:
          break;
      }
    }

    if (
      (isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) &&
      !isInOptions()
    ) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`options.html#${route}`),
      });
    } else {
      navigate(route);
    }
  };

  const getDashboardTitle = () => {
    if (fungibleToken?.name) {
      return fungibleToken.name;
    }
    if (!currency) {
      return '';
    }
    if (currency === 'STX') {
      if (new BigNumber(stxData?.locked ?? 0).gt(0)) {
        return `${commonT('STACKS')} ${commonT('BALANCE')}`;
      }
      return commonT('STACKS');
    }
    if (currency === 'BTC') {
      return commonT('BITCOIN');
    }
    return `${currency}`;
  };

  const isCrossChainSwapsEnabled = useHasFeature(FeatureId.CROSS_CHAIN_SWAPS);
  const isStacksSwapsEnabled = useHasFeature(FeatureId.STACKS_SWAPS);

  const isSwapEligibleCurrency =
    (currency === 'FT' &&
      (fungibleToken?.protocol === 'runes' ||
        (isStacksSwapsEnabled && fungibleToken?.protocol === 'stacks'))) ||
    currency === 'BTC' ||
    (currency === 'STX' && isStacksSwapsEnabled);
  const showSwaps = isCrossChainSwapsEnabled && isSwapEligibleCurrency;

  const navigateToSwaps = () => {
    if (!showSwaps) {
      return;
    }
    trackMixPanel(AnalyticsEvents.InitiateSwapFlow, {
      selectedToken: fungibleToken ? getTrackingIdentifier(fungibleToken) : currency,
      principal: isMotherToken(fungibleToken) ? getTrackingIdentifier(fungibleToken) : undefined,
    });
    navigate(`/swap?from=${fungibleToken ? fungibleToken.principal : currency}`);
  };

  const navigateToReceive = () => {
    if (fungibleToken) {
      // RUNES & BRC20s => ordinal wallet, SIP-10 => STX wallet
      trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
        addressType: fungibleToken?.protocol === 'stacks' ? 'stx' : 'btc_ordinals',
        selectedToken: fungibleToken.principal,
        source: 'token',
      });
      return navigate(`/receive/${fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'}`);
    }

    if (isReceivingAddressesVisible) {
      trackMixPanel(AnalyticsEvents.InitiateReceiveFlow, {
        addressType: currency === 'BTC' ? 'btc_payment' : 'stx',
        source: 'token',
      });
      return navigate(`/receive/${currency}`);
    }

    handleReceiveModalOpen();
  };

  return (
    <Container>
      <BalanceInfoContainer>
        <TokenImage
          currency={currency || undefined}
          loading={false}
          fungibleToken={fungibleToken || undefined}
        />
        <RowContainer>
          <BalanceTitleText data-testid="coin-title-text">{getDashboardTitle()}</BalanceTitleText>
          {fungibleToken?.protocol && (
            <ProtocolText>
              {fungibleToken?.protocol === 'stacks'
                ? 'SIP-10'
                : fungibleToken.protocol?.toUpperCase()}
            </ProtocolText>
          )}
        </RowContainer>
        <BalanceValuesContainer>
          <NumericFormat
            value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <CoinBalanceText data-testid="coin-balance" onClick={toggleBalanceView}>
                {balanceHidden ? HIDDEN_BALANCE_LABEL : `${value} ${getTokenTicker()}`}
              </CoinBalanceText>
            )}
          />
          {balanceDisplayState === 'btc' && btcValue && (
            <NumericFormat
              value={btcValue}
              displayType="text"
              thousandSeparator
              prefix={BTC_SYMBOL}
              renderText={(value) => (
                <FiatAmountText onClick={toggleBalanceView}>{value}</FiatAmountText>
              )}
            />
          )}
          {(balanceDisplayState === 'unmodified' || balanceDisplayState === 'hidden') &&
            fiatValue && (
              <FiatContainer>
                <NumericFormat
                  value={fiatValue}
                  displayType="text"
                  thousandSeparator
                  prefix={`${currencySymbolMap[fiatCurrency]}`}
                  suffix={` ${fiatCurrency}`}
                  renderText={(value) => (
                    <FiatAmountText onClick={toggleBalanceView}>
                      {balanceHidden ? HIDDEN_BALANCE_LABEL : value}
                    </FiatAmountText>
                  )}
                />
              </FiatContainer>
            )}
        </BalanceValuesContainer>
      </BalanceInfoContainer>
      {renderStackingBalances()}
      {chartPriceStats && (
        <PriceStatsContainer>
          <PercentageChange
            ftCurrencyPairs={[[fungibleToken, currency]]}
            chartPriceStats={chartPriceStats}
            displayAmountChange
          />
        </PriceStatsContainer>
      )}
      <RowButtonContainer>
        <SquareButton src={ArrowUp} text={t('SEND')} onPress={goToSendScreen} />
        <SquareButton src={ArrowDown} text={t('RECEIVE')} onPress={navigateToReceive} />
        {showSwaps && <SquareButton src={ArrowSwap} text={t('SWAP')} onPress={navigateToSwaps} />}
        {showRunesListing && (
          <SquareButton
            src={List}
            text={t('LIST')}
            onPress={() => navigate(`/list-rune/${fungibleToken.principal}`)}
          />
        )}
        {!fungibleToken && (
          <SquareButton
            src={Buy}
            text={t('BUY')}
            onPress={() => {
              trackMixPanel(AnalyticsEvents.InitiateBuyFlow, {
                selectedToken: currency,
                source: 'token',
              });
              navigate(`/buy/${currency}`);
            }}
          />
        )}
      </RowButtonContainer>
      <BottomModal
        visible={openReceiveModal}
        header={t('RECEIVE')}
        onClose={handleReceiveModalClose}
      >
        <VerifyOrViewContainer>
          <VerifyButtonContainer>
            <ActionButton
              text={t('VERIFY_ADDRESS_ON_LEDGER')}
              onPress={async () => {
                await chrome.tabs.create({
                  url: chrome.runtime.getURL(
                    `options.html#/verify-ledger?currency=${
                      !fungibleToken
                        ? currency
                        : fungibleToken?.protocol === 'stacks'
                        ? 'STX'
                        : 'ORD'
                    }`,
                  ),
                });
              }}
            />
          </VerifyButtonContainer>
          <ActionButton
            transparent
            text={t('VIEW_ADDRESS')}
            onPress={() => {
              navigate(
                `/receive/${
                  !fungibleToken ? currency : fungibleToken?.protocol === 'stacks' ? 'STX' : 'ORD'
                }`,
              );
            }}
          />
        </VerifyOrViewContainer>
      </BottomModal>
    </Container>
  );
}
