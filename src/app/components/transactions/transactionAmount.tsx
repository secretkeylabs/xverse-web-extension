import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import {
  microstacksToStx,
  satsToBtc,
  type Brc20HistoryTransactionData,
  type BtcTransactionData,
  type FungibleToken,
  type FungibleTokenProtocol,
  type GetRunesActivityForAddressEvent,
  type StxTransactionData,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

interface TransactionAmountProps {
  transaction:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent;
  currency: CurrencyTypes;
  protocol?: FungibleTokenProtocol;
  tokenSymbol?: string;
}

const TransactionValue = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export default function TransactionAmount(props: TransactionAmountProps): JSX.Element | null {
  const { transaction, currency, protocol, tokenSymbol } = props;
  const { data: sip10CoinsList } = useVisibleSip10FungibleTokens();
  if (currency === 'STX' || (currency === 'FT' && protocol === 'stacks')) {
    const stxTransaction = transaction as StxTransactionData;
    if (stxTransaction.txType === 'token_transfer') {
      const prefix = stxTransaction.incoming ? '' : '-';
      return (
        <NumericFormat
          value={microstacksToStx(stxTransaction.amount).toString()}
          displayType="text"
          thousandSeparator
          prefix={prefix}
          allowNegative={false}
          renderText={(value: string) => (
            <TransactionValue>{`${value} ${currency}`}</TransactionValue>
          )}
        />
      );
    }
    if (stxTransaction.txType === 'contract_call') {
      if (stxTransaction.tokenType === 'fungible') {
        const token = sip10CoinsList.find(
          (cn) => cn.principal === stxTransaction.contractCall?.contract_id,
        );
        const prefix = stxTransaction.incoming ? '' : '-';
        return (
          <NumericFormat
            value={getFtBalance(token as FungibleToken)}
            displayType="text"
            thousandSeparator
            prefix={prefix}
            allowNegative={false}
            renderText={(value: string) => (
              <TransactionValue>{`${value} ${getFtTicker(
                token as FungibleToken,
              )?.toUpperCase()}`}</TransactionValue>
            )}
          />
        );
      }
    }
  } else if (currency === 'BTC') {
    const btcTransaction = transaction as BtcTransactionData;
    const prefix = btcTransaction.incoming ? '' : '-';
    if (btcTransaction.isOrdinal && btcTransaction.txStatus === 'pending') {
      return null;
    }
    if (!new BigNumber(btcTransaction.amount).isEqualTo(0)) {
      return (
        <NumericFormat
          value={satsToBtc(BigNumber(btcTransaction.amount)).toString()}
          displayType="text"
          thousandSeparator
          prefix={prefix}
          allowNegative={false}
          renderText={(value: string) => <TransactionValue>{`${value} BTC`}</TransactionValue>}
        />
      );
    }
  } else if (currency === 'FT' && protocol === 'brc-20') {
    const brc20Transaction = transaction as Brc20HistoryTransactionData;
    const prefix = brc20Transaction.incoming ? '' : '-';
    if (!new BigNumber(brc20Transaction.amount).isEqualTo(0)) {
      return (
        <NumericFormat
          value={BigNumber(brc20Transaction.amount).toString()}
          displayType="text"
          thousandSeparator
          prefix={prefix}
          allowNegative={false}
          renderText={(value: string) => (
            <TransactionValue>{`${value} ${brc20Transaction.ticker.toUpperCase()}`}</TransactionValue>
          )}
        />
      );
    }
  } else if (currency === 'FT' && protocol === 'runes') {
    const runeTransaction = transaction as GetRunesActivityForAddressEvent;
    return (
      <NumericFormat
        value={BigNumber(runeTransaction.amount).toString()}
        displayType="text"
        thousandSeparator
        allowNegative
        renderText={(value: string) => (
          <TransactionValue>{`${value} ${tokenSymbol}`}</TransactionValue>
        )}
      />
    );
  }
  return null;
}
