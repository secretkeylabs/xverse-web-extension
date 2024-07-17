import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useGetQuotes from '@hooks/queries/swaps/useGetQuotes';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  btcToSats,
  getBtcFiatEquivalent,
  type FungibleToken,
  type Quote,
  type Token,
  type UtxoQuote,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { satsToBtcString } from '@utils/helper';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AmountInput from './components/amountInput';
import RouteItem from './components/routeItem';
import TokenFromBottomSheet from './components/tokenFromBottomSheet';
import TokenToBottomSheet from './components/tokenToBottomSheet';
import QuotesModal from './quotesModal';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
}));

const Flex1 = styled.div`
  flex: 1;
`;

const RouteContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: `${props.theme.space.l} 0`,
}));

const SwapButtonContainer = styled.button((props) => ({
  display: 'flex',
  background: props.theme.colors.white_0,
  padding: props.theme.space.xs,
  alignSelf: 'flex-end',
  borderRadius: props.theme.space.xxl,
  marginBottom: props.theme.space.xs,
  ':hover': {
    opacity: 0.8,
  },
}));

const SendButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

const Icon = styled.img`
  width: 16px;
  height: 16px;
  rotate: 90deg;
`;

// TODO: add form validations, empty state and error handling
export default function SwapScreen() {
  const [amount, setAmount] = useState('');
  const [getQuotesModalVisible, setGetQuotesModalVisible] = useState(false);
  const [tokenSelectionBottomSheet, setTokenSelectionBottomSheet] = useState<'from' | 'to' | null>(
    null,
  );
  const [fromToken, setFromToken] = useState<FungibleToken | 'BTC' | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [error, setError] = useState('');

  const { fiatCurrency } = useWalletSelector();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { data: btcBalance } = useBtcWalletData();
  const { btcFiatRate } = useCoinRates();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultFrom = params.get('from');
  const { quotes, loading: quotesLoading, error: quotesError, fetchQuotes } = useGetQuotes();

  useEffect(() => {
    if (defaultFrom && runesCoinsList.length > 0) {
      const token =
        defaultFrom === 'BTC'
          ? 'BTC'
          : runesCoinsList.find((coin) => coin.principal === defaultFrom);
      setFromToken(token);
    }
  }, [defaultFrom, runesCoinsList.length]);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!quotesLoading && quotes) {
      setGetQuotesModalVisible(true);
    }
  }, [quotes, quotesLoading, quotesError]);

  const getQuotes = async () => {
    // fetch quotes here
    // example
    fetchQuotes({
      from: { ticker: 'BTC', protocol: 'btc' },
      to: { ticker: 'UNCOMMON•GOODS', protocol: 'runes' },
      amount: '50',
    });
  };

  const onClickFrom = () => setTokenSelectionBottomSheet('from');
  const onClickTo = () => setTokenSelectionBottomSheet('to');

  const onClickSwapRoute = () => {
    // TODO: implement swap route
  };

  const onChangeToToken = (token: Token) => {
    setToToken(token);
  };

  const onChangeFromToken = (token: FungibleToken | 'BTC') => {
    setError('');
    setAmount('');
    setFromToken(token);
    if (fromToken) {
      setToToken(undefined);
    }
  };

  const onChangeAmount = (value: string) => {
    if (!fromToken) {
      return;
    }

    if (fromToken === 'BTC') {
      const amountInSats = btcToSats(new BigNumber(value));
      setError(
        BigNumber(amountInSats).gt(BigNumber(btcBalance ?? 0))
          ? t('SEND.ERRORS.INSUFFICIENT_BALANCE')
          : '',
      );
      return setAmount(value);
    }

    setError(
      BigNumber(value).gt(getFtBalance(fromToken)) ? t('SEND.ERRORS.INSUFFICIENT_BALANCE') : '',
    );
    setAmount(value);
  };

  // extends this for other protocols and stx when needed
  const getFromBalance = () => {
    if (!fromToken) {
      return undefined;
    }

    if (fromToken === 'BTC') {
      return satsToBtcString(BigNumber(btcBalance ?? 0));
    }

    if (fromToken.protocol === 'runes') {
      return getFtBalance(fromToken);
    }
  };

  // extends this for other protocols and stx when needed
  const getFromAmountFiatValue = () => {
    const balance = new BigNumber(amount || '0');

    if (fromToken === 'BTC') {
      const amountInSats = btcToSats(new BigNumber(balance));
      return getBtcFiatEquivalent(amountInSats, new BigNumber(btcFiatRate)).toFixed(2);
    }

    if (fromToken?.protocol !== 'runes' || !fromToken?.tokenFiatRate || !fromToken.decimals) {
      return '0.00';
    }

    const rate = new BigNumber(fromToken.tokenFiatRate);
    return balance.multipliedBy(rate).toFixed(2);
  };

  const onClickMax = () => {
    if (!fromToken) {
      return;
    }

    // we can't use max for btc
    if (fromToken === 'BTC') {
      return;
    }

    setError('');
    setAmount(getFtBalance(fromToken));
  };

  const errorMsg = error || quotesError;
  const isGetQuotesDisabled =
    !fromToken || !toToken || Boolean(error) || quotesLoading || Boolean(quotesError);
  const isMaxDisabled =
    !fromToken || fromToken === 'BTC' || BigNumber(amount).eq(getFtBalance(fromToken));

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <StyledP typography="headline_s" color="white_0">
          {t('SWAP_SCREEN.SWAP')}
        </StyledP>
        <Flex1>
          <RouteContainer>
            <RouteItem token={fromToken} label={t('SWAP_SCREEN.FROM')} onClick={onClickFrom} />
            <SwapButtonContainer onClick={onClickSwapRoute}>
              <Icon src={ArrowSwap} />
            </SwapButtonContainer>
            <RouteItem token={toToken} label={t('SWAP_SCREEN.TO')} onClick={onClickTo} />
          </RouteContainer>
          <AmountInput
            label={t('SWAP_CONFIRM_SCREEN.AMOUNT')}
            input={{
              value: amount,
              onChange: onChangeAmount,
              fiatValue: getFromAmountFiatValue(),
              fiatCurrency,
            }}
            max={
              fromToken === 'BTC' ? undefined : { isDisabled: isMaxDisabled, onClick: onClickMax }
            }
            balance={getFromBalance()}
          />
        </Flex1>
        <SendButtonContainer>
          <Button
            disabled={isGetQuotesDisabled}
            variant={errorMsg ? 'danger' : 'primary'}
            title={errorMsg || t('SWAP_SCREEN.GET_QUOTES')}
            loading={quotesLoading}
            onClick={getQuotes}
          />
        </SendButtonContainer>
        <QuotesModal
          visible={getQuotesModalVisible}
          onClose={() => {
            setGetQuotesModalVisible(false);
          }}
          ammProviders={quotes?.amm || []}
          utxoProviders={quotes?.utxo || []}
          ammProviderClicked={(provider: Quote) => {
            // todo: navigate to quote screen here
            console.log('amm clicked', provider);
          }}
          utxoProviderClicked={(provider: UtxoQuote) => {
            // todo: navigate to utxo selection screen
            console.log('utxo clicked', provider);
          }}
        />
        <TokenFromBottomSheet
          onClose={() => setTokenSelectionBottomSheet(null)}
          onSelectCoin={onChangeFromToken}
          visible={tokenSelectionBottomSheet === 'from'}
          title={t('SWAP_SCREEN.ASSET_TO_CONVERT_FROM')}
          to={toToken}
        />
        <TokenToBottomSheet
          onClose={() => setTokenSelectionBottomSheet(null)}
          onSelectCoin={onChangeToToken}
          visible={tokenSelectionBottomSheet === 'to'}
          title={t('SWAP_SCREEN.ASSET_TO_CONVERT_FROM')}
          from={fromToken}
        />
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}
