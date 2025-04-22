import BitcoinIcon from '@assets/img/transactions/bitcoin.svg';
import BurnIcon from '@assets/img/transactions/burned.svg';
import ContractIcon from '@assets/img/transactions/contract.svg';
import FailedIcon from '@assets/img/transactions/failed.svg';
import OrdinalsIcon from '@assets/img/transactions/ordinal.svg';
import PendingIcon from '@assets/img/transactions/pending.svg';
import ReceiveIcon from '@assets/img/transactions/received.svg';
import RunesIcon from '@assets/img/transactions/runes.svg';
import SendIcon from '@assets/img/transactions/sent.svg';

import styled from 'styled-components';

import type {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  FungibleTokenProtocol,
  GetRunesActivityForAddressEvent,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';

const IconContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const MiniIcon = styled.div`
  position: absolute;
  right: -8px;
  bottom: -1.45px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.elevation0};
  padding: 1.45px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
  }
`;

interface TransactionStatusIconPros {
  transaction:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent;
  currency: CurrencyTypes;
  protocol?: FungibleTokenProtocol;
}

const legacyIconProps = {
  width: 28,
  height: 28,
} as const;

function TransactionStatusIcon(props: TransactionStatusIconPros) {
  const { currency, transaction, protocol } = props;

  const renderWithMiniIcon = (baseIcon: JSX.Element, miniIconSrc: string) => (
    <IconContainer>
      {baseIcon}
      <MiniIcon>
        <img src={miniIconSrc} alt="protocol" />
      </MiniIcon>
    </IconContainer>
  );

  if (currency === 'STX' || (currency === 'FT' && protocol === 'stacks')) {
    const tx = transaction as StxTransactionData;
    if (tx.txStatus === 'abort_by_response' || tx.txStatus === 'abort_by_post_condition') {
      return <img {...legacyIconProps} src={FailedIcon} alt="failed" />;
    }
    if (tx.txType === 'token_transfer' || tx.tokenType === 'fungible') {
      if (tx.txStatus === 'pending') {
        return <img {...legacyIconProps} src={PendingIcon} alt="pending" />;
      }
      return tx.incoming ? (
        <img {...legacyIconProps} src={ReceiveIcon} alt="received" />
      ) : (
        <img {...legacyIconProps} src={SendIcon} alt="sent" />
      );
    }
    return tx.txStatus === 'pending' ? (
      <img {...legacyIconProps} src={PendingIcon} alt="pending" />
    ) : (
      <img {...legacyIconProps} src={ContractIcon} alt="contract-call" />
    );
  }

  if (currency === 'BTC') {
    const tx = transaction as BtcTransactionData;
    if (tx.txStatus === 'pending') {
      return renderWithMiniIcon(
        <img {...legacyIconProps} src={PendingIcon} alt="pending" />,
        tx.isOrdinal ? OrdinalsIcon : BitcoinIcon,
      );
    }

    const baseIcon = tx.incoming ? (
      <img {...legacyIconProps} src={ReceiveIcon} alt="received" />
    ) : (
      <img {...legacyIconProps} src={SendIcon} alt="sent" />
    );

    return renderWithMiniIcon(baseIcon, tx.isOrdinal ? OrdinalsIcon : BitcoinIcon);
  }

  if (currency === 'FT' && protocol === 'brc-20') {
    const tx = transaction as Brc20HistoryTransactionData;
    if (tx.txStatus === 'pending') {
      return <img {...legacyIconProps} src={PendingIcon} alt="pending" />;
    }

    let baseIcon;
    if (tx.incoming) {
      baseIcon = <img {...legacyIconProps} src={ReceiveIcon} alt="received" />;
    } else if (tx.operation === 'transfer_send') {
      baseIcon = <img {...legacyIconProps} src={SendIcon} alt="sent" />;
    } else {
      baseIcon = <img {...legacyIconProps} src={ContractIcon} alt="inscribe-transaction" />;
    }

    return renderWithMiniIcon(baseIcon, OrdinalsIcon);
  }

  if (currency === 'FT' && protocol === 'runes') {
    const tx = transaction as GetRunesActivityForAddressEvent;
    let baseIcon;

    if (tx.burned) {
      baseIcon = <img {...legacyIconProps} src={BurnIcon} alt="burned" />;
    } else if (BigNumber(tx.amount).lt(0)) {
      baseIcon = <img {...legacyIconProps} src={SendIcon} alt="sent" />;
    } else if (BigNumber(tx.amount).gt(0)) {
      baseIcon = <img {...legacyIconProps} src={ReceiveIcon} alt="received" />;
    } else {
      baseIcon = <img {...legacyIconProps} src={ContractIcon} alt="contract" />;
    }

    return renderWithMiniIcon(baseIcon, RunesIcon);
  }

  return <img {...legacyIconProps} src={ContractIcon} alt="contract" />;
}

export default TransactionStatusIcon;
