import BtcAmountText from '@components/btcAmountText';
import PercentageChange from '@components/percentageChange';
import TokenImage from '@components/tokenImage';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getFiatBtcEquivalent,
  getFiatEquivalent,
  type FungibleToken,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { EMPTY_LABEL, HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import {
  AmountContainer,
  FiatAmountContainer,
  RowContainer,
  RowContainers,
  StyledBarLoader,
  StyledFiatAmountText,
  TileContainer,
  TokenImageContainer,
  TokenTicker,
  TokenTitle,
  TokenTitleContainer,
} from './index.styled';

type Props = {
  title: string;
  loading?: boolean;
  currency: CurrencyTypes;
  onPress: (coin: CurrencyTypes, fungibleToken: FungibleToken | undefined) => void;
  fungibleToken?: FungibleToken;
  enlargeTicker?: boolean;
  className?: string;
  showProtocolIcon?: boolean;
  hideSwapBalance?: boolean;
  hidePriceChange?: boolean;
};

function TokenTile({
  title,
  loading = false,
  currency,
  onPress,
  fungibleToken,
  enlargeTicker = false,
  className,
  showProtocolIcon = true,
  hideSwapBalance = false,
  hidePriceChange = false,
}: Props) {
  const { fiatCurrency, balanceHidden, showBalanceInBtc } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();
  const { data: stxData } = useStxWalletData();
  const { confirmedPaymentBalance: btcBalance } = useSelectedAccountBtcBalance();

  const getTickerTitle = () => {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    return `${getFtTicker(fungibleToken as FungibleToken)}`;
  };

  const handleTokenPressed = () => onPress(currency, fungibleToken);

  const getFiatAmount = () => {
    const fiatAmount = getFiatEquivalent(
      Number(getBalanceAmount(currency, fungibleToken, stxData, btcBalance)),
      currency,
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
      fungibleToken,
    );

    return fiatAmount ? BigNumber(fiatAmount) : BigNumber(0);
  };

  const fiatAmount = getFiatAmount();

  const getAmountDisplay = () => {
    if (balanceHidden) {
      return <FiatAmountContainer>{HIDDEN_BALANCE_LABEL}</FiatAmountContainer>;
    }

    if (showBalanceInBtc) {
      if (currency === 'BTC') {
        return (
          <StyledFiatAmountText fiatAmount={fiatAmount} fiatCurrency={fiatCurrency} withoutSuffix />
        );
      }

      return (
        <BtcAmountText
          btcAmount={
            fiatAmount
              ? getFiatBtcEquivalent(fiatAmount, BigNumber(btcFiatRate)).toString()
              : undefined
          }
        />
      );
    }

    return (
      <StyledFiatAmountText fiatAmount={fiatAmount} fiatCurrency={fiatCurrency} withoutSuffix />
    );
  };

  return (
    <TileContainer onClick={handleTokenPressed} className={className} aria-label="Token Row">
      <TokenImageContainer>
        <TokenImage
          currency={currency}
          loading={loading}
          fungibleToken={fungibleToken}
          size={enlargeTicker ? 40 : 32}
          showProtocolIcon={showProtocolIcon}
        />
      </TokenImageContainer>
      <RowContainers>
        <RowContainer>
          <TokenTitleContainer>
            {loading && <StyledBarLoader width="25%" height={20} />}
            {!loading && <TokenTitle aria-label={`Token Title: ${title}`}>{title}</TokenTitle>}
          </TokenTitleContainer>
          {loading && <StyledBarLoader width="20%" height={20} $withMarginBottom />}
          {!loading && !hideSwapBalance && (
            <AmountContainer aria-label="Currency Balance Container">
              {getAmountDisplay()}
            </AmountContainer>
          )}
        </RowContainer>
        <RowContainer>
          <TokenTitleContainer>
            {loading && <StyledBarLoader width="75%" height={20} />}
            {!loading && !hideSwapBalance && !balanceHidden && (
              <NumericFormat
                value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
                displayType="text"
                thousandSeparator
                renderText={(value: string) => (
                  <TokenTicker aria-label={`Token Ticker: ${getTickerTitle()}`}>
                    {`${value} ${getTickerTitle()}`}
                  </TokenTicker>
                )}
              />
            )}
            {balanceHidden && <TokenTicker>{HIDDEN_BALANCE_LABEL}</TokenTicker>}
          </TokenTitleContainer>
          {loading && <StyledBarLoader width="25%" height={20} />}
          {!loading && !hideSwapBalance && !hidePriceChange && (
            <AmountContainer>
              {balanceHidden && <TokenTicker>{EMPTY_LABEL}</TokenTicker>}
              {!balanceHidden && <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} />}
            </AmountContainer>
          )}
        </RowContainer>
      </RowContainers>
    </TileContainer>
  );
}

export default TokenTile;
