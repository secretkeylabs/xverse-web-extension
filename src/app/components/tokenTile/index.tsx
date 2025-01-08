import { BestBarLoader } from '@components/barLoader';
import BtcAmountText from '@components/btcAmountText';
import FiatAmountText from '@components/fiatAmountText';
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
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const TileContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  padding: `${props.theme.space.m} 0`,
  borderRadius: props.theme.radius(2),
  alignItems: 'center',
}));

const TokenImageContainer = styled.div((props) => ({
  display: 'flex',
  marginRight: props.theme.space.m,
}));

const RowContainers = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
`;

const RowContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.m,
}));

const CoinBalanceContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
`;

const AmountContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CoinTickerText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  lineHeight: '140%',
  minHeight: 20,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const CoinSubtitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  lineHeight: '140%',
  minHeight: 20,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const CoinBalanceText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: 20,
  lineHeight: '140%',
  maxWidth: '100%',
}));

const TokenTitleContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
  overflow: 'hidden',
  marginBottom: props.theme.space.xxxs,
}));

const StyledBarLoader = styled(BestBarLoader)<{
  $withMarginBottom?: boolean;
}>((props) => ({
  marginBottom: props.$withMarginBottom ? props.theme.space.xxxs : 0,
}));

const FiatCurrencyRow = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const StyledFiatAmountText = styled(FiatAmountText)`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
  line-height: 140%;
  min-height: 20px;
`;

const FiatAmountContainer = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

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
        return <StyledFiatAmountText fiatAmount={fiatAmount} fiatCurrency={fiatCurrency} />;
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

    return <StyledFiatAmountText fiatAmount={fiatAmount} fiatCurrency={fiatCurrency} />;
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
            <CoinTickerText>{getTickerTitle()}</CoinTickerText>
          </TokenTitleContainer>
          {loading && <StyledBarLoader width="10%" height={20} $withMarginBottom />}
          {!loading && !hideSwapBalance && (
            <CoinBalanceContainer aria-label="CoinBalance Container">
              {balanceHidden && HIDDEN_BALANCE_LABEL}
              {!balanceHidden && (
                <NumericFormat
                  value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
                  displayType="text"
                  thousandSeparator
                  renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
                />
              )}
            </CoinBalanceContainer>
          )}
        </RowContainer>
        <RowContainer>
          <TokenTitleContainer>
            <CoinSubtitleText aria-label="Token SubTitle">{title}</CoinSubtitleText>
          </TokenTitleContainer>
          {loading && <StyledBarLoader width="20%" height={20} />}
          {!loading && !hideSwapBalance && (
            <AmountContainer aria-label="CurrencyBalance Container">
              {!balanceHidden && <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} />}
              {getAmountDisplay()}
            </AmountContainer>
          )}
        </RowContainer>
      </RowContainers>
    </TileContainer>
  );
}

export default TokenTile;
