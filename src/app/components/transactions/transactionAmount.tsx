import useWalletSelector from '@hooks/useWalletSelector';
import {
  BtcTransactionData,
  FungibleToken,
  microstacksToStx,
  satsToBtc,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { getFtBalance, getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

interface TransactionAmountProps {
  transaction: StxTransactionData | BtcTransactionData;
  coin: CurrencyTypes;
}

const TransactionValue = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

export default function TransactionAmount(props: TransactionAmountProps): JSX.Element | null {
  const { transaction, coin } = props;
  const { coinsList } = useWalletSelector();
  if (coin === 'STX' || coin === 'FT') {
    if (transaction.txType === 'token_transfer') {
      const prefix = transaction.incoming ? '' : '-';
      return (
        <NumericFormat
          value={microstacksToStx(transaction.amount).toString()}
          displayType="text"
          thousandSeparator
          prefix={prefix}
          renderText={(value: string) => <TransactionValue>{`${value} ${coin}`}</TransactionValue>}
        />
      );
    }
    if (transaction.txType === 'contract_call') {
      if (transaction.tokenType === 'fungible') {
        const token = coinsList?.find(
          (cn) => cn.principal === transaction.contractCall?.contract_id
        );
        const prefix = transaction.incoming ? '' : '-';
        return (
          <NumericFormat
            value={getFtBalance(token as FungibleToken)}
            displayType="text"
            thousandSeparator
            prefix={prefix}
            renderText={(value: string) => (
              <TransactionValue>{`${value} ${getFtTicker(
                token as FungibleToken
              )?.toUpperCase()}`}</TransactionValue>
            )}
          />
        );
      }
    }
  } else if (coin === 'BTC') {
    const prefix = transaction.incoming ? '' : '-';
    if (!new BigNumber(transaction.amount).isEqualTo(0)) {
      return (
        <NumericFormat
          value={satsToBtc(BigNumber(transaction.amount)).toString()}
          displayType="text"
          thousandSeparator
          prefix=""
          renderText={(value: string) => (
            <TransactionValue>{`${prefix}${value} BTC`}</TransactionValue>
          )}
        />
      );
    }
  }
  return null;
}
