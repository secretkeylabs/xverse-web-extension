import { BestBarLoader } from '@components/barLoader';
import FiatAmountText from '@components/fiatAmountText';
import PercentageChange from '@components/percentageChange';
import TokenImage from '@components/tokenImage';
import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
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
}));

const RowContainer = styled.div((props) => ({
  flex: '1 0 auto',
  display: 'flex',
  columnGap: props.theme.space.m,
}));

const TextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: props.theme.space.xxxs,
}));

const AmountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.xxs,
  overflow: 'hidden',
  alignItems: 'flex-end',
  rowGap: props.theme.space.xxxs,
}));

const LoaderMainContainer = styled.div({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const CoinTickerText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  lineHeight: '140%',
  minHeight: 20,
}));

const SubText = styled.p<{ $fullWidth: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  minHeight: 20,
  lineHeight: '140%',
  textAlign: 'left',
  maxWidth: props.$fullWidth ? 'unset' : 120,
  whiteSpace: props.$fullWidth ? 'normal' : 'nowrap',
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

const TokenTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
});

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

const CoinBalanceContainer = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
`;

const FiatAmountContainer = styled.div`
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
`;

function TokenLoader() {
  return (
    <LoaderMainContainer>
      <StyledBarLoader width={53} height={20} $withMarginBottom />
      <StyledBarLoader width={151} height={20} />
    </LoaderMainContainer>
  );
}

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
  const { fiatCurrency, balanceHidden } = useWalletSelector();
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
    if (fiatAmount) {
      return BigNumber(fiatAmount);
    }
    return undefined;
  };

  return (
    <TileContainer onClick={handleTokenPressed} className={className}>
      <RowContainer aria-label="Token Row">
        <TokenImage
          currency={currency}
          loading={loading}
          fungibleToken={fungibleToken}
          size={enlargeTicker ? 40 : 32}
          showProtocolIcon={showProtocolIcon}
        />
        <TextContainer>
          <CoinTickerText>{getTickerTitle()}</CoinTickerText>
          <TokenTitleContainer>
            <SubText aria-label="Token SubTitle" $fullWidth={hideSwapBalance}>
              {title}
            </SubText>
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading && <TokenLoader />}
      {!loading && !hideSwapBalance && (
        <AmountContainer aria-label="CoinBalance Container">
          <CoinBalanceContainer>
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
          <FiatCurrencyRow>
            <PercentageChange ftCurrencyPairs={[[fungibleToken, currency]]} />
            <StyledFiatAmountText fiatAmount={getFiatAmount()} fiatCurrency={fiatCurrency} />
          </FiatCurrencyRow>
        </AmountContainer>
      )}
    </TileContainer>
  );
}

export default TokenTile;
