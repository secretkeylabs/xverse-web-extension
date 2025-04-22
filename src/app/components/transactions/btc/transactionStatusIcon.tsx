import ArrowSwap from '@assets/img/icons/ArrowSwap.svg';
import BitcoinIcon from '@assets/img/transactions/bitcoin.svg';
import OrdinalsIcon from '@assets/img/transactions/ordinal.svg';
import RunesIcon from '@assets/img/transactions/runes.svg';

import styled from 'styled-components';

import {
  ArrowDown,
  ArrowsInLineVertical,
  ArrowUp,
  Fire,
  Hammer,
  PenNib,
  RocketLaunch,
  Wallet,
} from '@phosphor-icons/react';
import type { EnhancedTx, NetworkType } from '@secretkeylabs/xverse-core';
import { XVERSE_ORDIVIEW_URL } from '@utils/constants';
import Theme from 'theme';

const StatusIcon = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.white_600};
`;

const SubIconContainer = styled.div`
  position: absolute;
  right: -8px;
  bottom: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  overflow: hidden;
  padding: 1.5px;
  background-color: ${(props) => props.theme.colors.elevation0};

  &:has(img[alt='runes']) {
    border-radius: 0;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
`;

const iconProps = {
  size: 16,
  color: Theme.colors.elevation0,
  weight: 'bold',
} as const;

export function TransactionStatusIcon({
  tx,
  networkType,
}: {
  tx: EnhancedTx;
  networkType: NetworkType;
}) {
  const getIconByType = () => {
    switch (tx.txType) {
      case 'receive':
        return <ArrowDown {...iconProps} />;
      case 'send':
        return <ArrowUp {...iconProps} />;
      case 'consolidate':
        return <ArrowsInLineVertical {...iconProps} />;
      case 'inscribe':
        return <PenNib {...iconProps} />;
      case 'burn':
        return <Fire {...iconProps} />;
      case 'mint':
        return <Hammer {...iconProps} />;
      case 'etch':
        return <RocketLaunch {...iconProps} />;
      case 'trade':
        return <img src={ArrowSwap} width={16} height={16} alt="trade" />;
      default:
        return <Wallet {...iconProps} />;
    }
  };

  const getSubIconByAssetType = () => {
    if (tx.assetInTx === 'inscriptions') {
      return tx.inscriptions.items.length > 1 ? (
        <img src={OrdinalsIcon} alt="inscriptions" />
      ) : (
        <img
          src={`${XVERSE_ORDIVIEW_URL(networkType)}/thumbnail/${
            tx.inscriptions.items[0].inscriptionId
          }`}
          alt="protocol"
        />
      );
    }

    if (tx.assetInTx === 'runes') {
      if (!tx.runes.items.length) {
        return null;
      }
      return tx.runes.items.length > 1 || !tx.runes.items[0].inscriptionId ? (
        <img src={RunesIcon} alt="runes" />
      ) : (
        <img
          src={`${XVERSE_ORDIVIEW_URL(networkType)}/thumbnail/${tx.runes.items[0].inscriptionId}`}
          alt="protocol"
        />
      );
    }

    if (tx.assetInTx === 'multipleAssets') {
      return tx.txType === 'etch' ? <img src={RunesIcon} alt="runes" /> : null;
    }

    return <img src={BitcoinIcon} alt="bitcoin" />;
  };

  const subIcon = getSubIconByAssetType();

  return (
    <StatusIcon>
      {getIconByType()}
      {subIcon && <SubIconContainer>{subIcon}</SubIconContainer>}
    </StatusIcon>
  );
}
