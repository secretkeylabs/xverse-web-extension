import { BetterBarLoader } from '@components/barLoader';
import { StyledFiatAmountText } from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import { getFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
import type { StoreState } from '@stores/index';
import type { CurrencyTypes } from '@utils/constants';
import { getBalanceAmount, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const TileContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: props.color,
  width: '100%',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(7.25),
  paddingBottom: props.theme.spacing(7.25),
  borderRadius: props.theme.radius(2),
  marginBottom: props.theme.spacing(0),
}));

const RowContainer = styled.div({
  flex: '1 0 auto',
  display: 'flex',
});

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const AmountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.xxs,
  overflow: 'hidden',
  alignItems: 'flex-end',
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
}));

const SubText = styled.p<{ fullWidth: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  fontSize: 12,
  textAlign: 'left',
  maxWidth: props.fullWidth ? undefined : 100,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const CoinBalanceText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
}));

const TokenTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(2) : 0,
}));

function TokenLoader() {
  return (
    <LoaderMainContainer>
      <StyledBarLoader width={80} height={16} withMarginBottom />
      <StyledBarLoader width={70} height={14} />
    </LoaderMainContainer>
  );
}

interface Props {
  title: string;
  loading?: boolean;
  currency: CurrencyTypes;
  onPress: (coin: CurrencyTypes, fungibleToken: FungibleToken | undefined) => void;
  fungibleToken?: FungibleToken;
  enlargeTicker?: boolean;
  className?: string;
  showProtocolIcon?: boolean;
  hideBalance?: boolean;
}

function TokenTile({
  title,
  loading = false,
  currency,
  onPress,
  fungibleToken,
  enlargeTicker = false,
  className,
  showProtocolIcon = true,
  hideBalance = false,
}: Props) {
  const { fiatCurrency } = useSelector((state: StoreState) => state.walletState);
  const { btcFiatRate, stxBtcRate } = useCoinRates();
  const { data: stxData } = useStxWalletData();
  const { data: btcBalance } = useBtcWalletData();

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
            <SubText aria-label="Token SubTitle" fullWidth={hideBalance}>
              {title}
            </SubText>
          </TokenTitleContainer>
        </TextContainer>
      </RowContainer>
      {loading ? (
        <TokenLoader />
      ) : (
        !hideBalance && (
          <AmountContainer aria-label="CoinBalance Container">
            <NumericFormat
              value={getBalanceAmount(currency, fungibleToken, stxData, btcBalance)}
              displayType="text"
              thousandSeparator
              renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
            />
            <StyledFiatAmountText fiatAmount={getFiatAmount()} fiatCurrency={fiatCurrency} />
          </AmountContainer>
        )
      )}
    </TileContainer>
  );
}

export default TokenTile;
