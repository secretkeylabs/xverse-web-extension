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
  size?: number;
  loaderSize?: LoaderSize;
  round?: boolean;
}

const TickerImage = styled.img<{ size?: number; round?: boolean }>((props) => ({
  height: props.size ?? 44,
  width: props.size ?? 44,
  borderRadius: props.round ? '50%' : 'none',
}));

const LoaderImageContainer = styled.div({
  flex: 0.5,
});

const TickerIconContainer = styled.div<{ size?: number; round?: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: props.size ?? 44,
  width: props.size ?? 44,
  marginRight: props.theme.spacing(3),
  borderRadius: props.round ? '50%' : props.theme.radius(2),
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 13,
}));

export default function TokenImage(props: TokenImageProps) {
  const { token, loading, fungibleToken } = props;

  const getCoinIcon = useCallback(() => {
    if (token === 'STX') {
      return IconStacks;
    }
    if (token === 'BTC') {
      return IconBitcoin;
    }
  }, [token]);

  if (fungibleToken) {
    if (!loading) {
      if (fungibleToken?.image) {
        return <TickerImage size={props.size} src={fungibleToken.image} />;
      }
      let ticker = fungibleToken?.ticker;
      if (!ticker && fungibleToken?.name) {
        ticker = getTicker(fungibleToken?.name);
      }
      const background = stc(ticker);
      ticker = ticker && ticker.substring(0, 4);
      return (
        <TickerIconContainer size={props.size} color={background} round={props.round}>
          <TickerIconText>{ticker}</TickerIconText>
        </TickerIconContainer>
      );
    }
    return (
      <LoaderImageContainer>
        <BarLoader loaderSize={props.loaderSize ?? LoaderSize.LARGE} />
      </LoaderImageContainer>
    );
  }
  return <TickerImage size={props.size} src={getCoinIcon()} round={props.round} />;
}
