import styled from 'styled-components';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { useCallback } from 'react';
import BarLoader from '@components/barLoader';
import stc from 'string-to-color';
import { LoaderSize } from '@utils/constants';
import { getTicker } from '@utils/helper';
import { FungibleToken } from '@secretkeylabs/xverse-core';

interface TokenImageProps {
  token?: string;
  loading?: boolean;
  fungibleToken?: FungibleToken;
}

const TickerImage = styled.img({
  height: 44,
  width: 44,
});

const LoaderImageContainer = styled.div({
  flex: 0.5,
});

const TickerIconContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  width: 32,
  marginRight: props.theme.spacing(3),
  borderRadius: props.theme.radius(2),
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

export default function TokenImage(props: TokenImageProps) {
  const {
    token,
    loading,
    fungibleToken,
  } = props;

  const getCoinIcon = useCallback(() => {
    if (token === 'STX') {
      return IconStacks;
    } if (token === 'BTC') {
      return IconBitcoin;
    }
  }, [token]);

  if (fungibleToken) {
    if (!loading) {
      if (fungibleToken?.image) {
        return <TickerImage src={fungibleToken.image} />;
      }
      let ticker = fungibleToken?.ticker;
      if (!ticker && fungibleToken?.name) {
        ticker = getTicker(fungibleToken?.name);
      }
      const background = stc(ticker);
      ticker = ticker && ticker.substring(0, 4);
      return (
        <TickerIconContainer color={background}>
          <TickerIconText>{ticker}</TickerIconText>
        </TickerIconContainer>
      );
    }
    return (
      <LoaderImageContainer>
        <BarLoader loaderSize={LoaderSize.LARGE} />
      </LoaderImageContainer>
    );
  }
  return (
    <TickerImage src={getCoinIcon()} />
  );
}
