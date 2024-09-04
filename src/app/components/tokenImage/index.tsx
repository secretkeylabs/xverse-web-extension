import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import OrdinalIcon from '@assets/img/transactions/ordinal.svg';
import RunesIcon from '@assets/img/transactions/runes.svg';
import { StyledBarLoader } from '@components/tilesSkeletonLoader';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import { XVERSE_ORDIVIEW_URL, type CurrencyTypes } from '@utils/constants';
import { getTicker } from '@utils/helper';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

const DEFAULT_SIZE = 40;

const TickerImage = styled.img<{ size?: number }>((props) => ({
  height: props.size ?? DEFAULT_SIZE,
  width: props.size ?? DEFAULT_SIZE,
  borderRadius: '50%',
}));

const LoaderImageContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TickerIconContainer = styled.div<{ size?: number; round?: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: props.size ?? DEFAULT_SIZE,
  width: props.size ?? DEFAULT_SIZE,
  borderRadius: '50%',
  backgroundColor: props.theme.colors.white_850,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 11,
}));

const TickerProtocolContainer = styled.div`
  position: relative;
  align-self: center;
  display: inline-flex;
`;

const ProtocolIcon = styled.div<{ isSquare?: boolean }>((props) => ({
  width: props.isSquare ? 18 : 20,
  height: props.isSquare ? 18 : 20,
  borderRadius: props.isSquare ? 0 : 20,
  position: 'absolute',
  right: props.isSquare ? -9 : -10,
  bottom: -2,
  backgroundColor: props.theme.colors.elevation0,
  padding: 2,
}));

const ProtocolImage = styled.img({
  height: '100%',
  width: '100%',
});

interface TokenImageProps {
  currency?: CurrencyTypes;
  fungibleToken?: FungibleToken;
  loading?: boolean;
  size?: number;
  round?: boolean;
  showProtocolIcon?: boolean;
}

export default function TokenImage({
  currency,
  fungibleToken,
  loading,
  size,
  round,
  showProtocolIcon = true,
}: TokenImageProps) {
  const { network } = useWalletSelector();
  const ftProtocol = fungibleToken?.protocol;
  const [imageError, setImageError] = useState(false);

  const getCurrencyIcon = useCallback(() => {
    if (currency === 'STX') {
      return IconStacks;
    }
    if (currency === 'BTC') {
      return IconBitcoin;
    }
  }, [currency]);

  const ticker =
    fungibleToken?.ticker ||
    (fungibleToken?.name ? getTicker(fungibleToken.name) : fungibleToken?.assetName || '');

  const tickerComponent = () => (
    <TickerIconContainer size={size} round={round}>
      <TickerIconText data-testid="token-image">{ticker.substring(0, 4)}</TickerIconText>
    </TickerIconContainer>
  );

  const getProtocolIcon = () => {
    if (!ftProtocol) {
      return null;
    }
    switch (ftProtocol) {
      case 'stacks':
        return <ProtocolImage src={IconStacks} alt="stacks" />;
      case 'brc-20':
        return <ProtocolImage src={OrdinalIcon} alt="brc20" />;
      case 'runes':
        return <ProtocolImage src={RunesIcon} alt="runes" />;
      default:
        return null;
    }
  };

  const renderIcon = () => {
    if (!fungibleToken) {
      return (
        <TickerImage
          data-testid="token-image"
          size={size}
          src={getCurrencyIcon()}
          onError={() => setImageError(true)}
        />
      );
    }
    if (fungibleToken.protocol === 'runes') {
      if (fungibleToken.runeInscriptionId) {
        return (
          <TickerImage
            data-testid="token-image"
            size={size}
            src={`${XVERSE_ORDIVIEW_URL(network.type)}/thumbnail/${
              fungibleToken.runeInscriptionId
            }`}
            onError={() => setImageError(true)}
          />
        );
      }
      if (fungibleToken?.runeSymbol) {
        return (
          <TickerIconContainer size={size} round={round}>
            <TickerIconText data-testid="token-image">{fungibleToken.runeSymbol}</TickerIconText>
          </TickerIconContainer>
        );
      }
    }
    if (fungibleToken?.image) {
      return (
        <TickerImage
          data-testid="token-image"
          size={size}
          src={fungibleToken.image}
          onError={() => setImageError(true)}
        />
      );
    }
    return tickerComponent();
  };

  if (loading) {
    return (
      <TickerProtocolContainer>
        <LoaderImageContainer>
          <StyledBarLoader width={size ?? DEFAULT_SIZE} height={size ?? DEFAULT_SIZE} />
        </LoaderImageContainer>
      </TickerProtocolContainer>
    );
  }

  return (
    <TickerProtocolContainer>
      {imageError ? tickerComponent() : renderIcon()}
      {ftProtocol && showProtocolIcon && (
        <ProtocolIcon isSquare={ftProtocol === 'runes'}>{getProtocolIcon()}</ProtocolIcon>
      )}
    </TickerProtocolContainer>
  );
}
