import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import OrdinalIcon from '@assets/img/transactions/ordinal.svg';
import RunesIcon from '@assets/img/transactions/runes.svg';
import { StyledBarLoader } from '@components/tilesSkeletonLoader';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { ORDINALS_URL } from '@secretkeylabs/xverse-core/constant';
import { CurrencyTypes } from '@utils/constants';
import { getTicker } from '@utils/helper';
import { useCallback } from 'react';
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
  backgroundColor: props.theme.colors.white_400,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.elevation0,
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 11,
}));

const TickerProtocolContainer = styled.div({
  position: 'relative',
  alignSelf: 'center',
  display: 'inline-flex',
});

const ProtocolIcon = styled.div<{ isSquare?: boolean }>((props) => ({
  width: props.isSquare ? 18 : 22,
  height: props.isSquare ? 18 : 22,
  borderRadius: props.isSquare ? 0 : 22,
  position: 'absolute',
  right: props.isSquare ? -9 : -11,
  bottom: -2,
  backgroundColor: props.theme.colors.elevation1,
  padding: 2,
}));

const ProtocolImage = styled.img({
  height: '100%',
  width: '100%',
});

export interface TokenImageProps {
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

  const getCurrencyIcon = useCallback(() => {
    if (currency === 'STX') {
      return IconStacks;
    }
    if (currency === 'BTC') {
      return IconBitcoin;
    }
    if (currency === 'Locked-BTC') {
      return IconBitcoin;
    }
  }, [currency]);

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
      return <TickerImage data-testid="token-image" size={size} src={getCurrencyIcon()} />;
    }
    if (fungibleToken?.image) {
      return <TickerImage data-testid="token-image" size={size} src={fungibleToken.image} />;
    }
    if (fungibleToken.runeInscriptionId) {
      const img = new Image(); // determine if valid image
      img.src = ORDINALS_URL(network.type, fungibleToken.runeInscriptionId);
      if (img.complete) {
        return (
          <TickerImage
            data-testid="token-image"
            size={size}
            src={ORDINALS_URL(network.type, fungibleToken.runeInscriptionId)}
          />
        );
      }
    }
    if (fungibleToken.runeSymbol) {
      return (
        <TickerIconContainer size={size} round={round}>
          <TickerIconText>{fungibleToken.runeSymbol}</TickerIconText>
        </TickerIconContainer>
      );
    }

    const ticker = fungibleToken?.name
      ? getTicker(fungibleToken.name)
      : fungibleToken?.ticker || fungibleToken?.assetName || '';

    return (
      <TickerIconContainer size={size} round={round}>
        <TickerIconText>{ticker.substring(0, 4)}</TickerIconText>
      </TickerIconContainer>
    );
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
      {renderIcon()}
      {ftProtocol && showProtocolIcon && (
        <ProtocolIcon isSquare={ftProtocol === 'runes'}>{getProtocolIcon()}</ProtocolIcon>
      )}
    </TickerProtocolContainer>
  );
}
