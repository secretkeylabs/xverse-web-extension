import { CurrencyTypes } from '@utils/constants';
import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import styled from 'styled-components';
import { isAddressTransactionWithTransfers, Tx } from '@utils/transactions/transactions';
import { StxTransactionData } from '@secretkeylabs/xverse-core';
import { parseStxTransactionData } from '@secretkeylabs/xverse-core/api/helper';
import useWalletSelector from '@hooks/useWalletSelector';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';
import TxTransfers from './txTransfers';

const TransactionContainer = styled.div((props) => ({
  display: 'flex',
  marginBottom: props.theme.spacing(10),
}));

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(6),
  flex: 1,
}));

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.body_bold_m,
}));

interface StxTransferTransactionProps {
  transaction: StxTransactionData;
  transactionCoin: CurrencyTypes;
}
function StxTransferTransaction(props: StxTransferTransactionProps) {
  const { transaction, transactionCoin } = props;
  return (
    <TransactionContainer>
      <TransactionStatusIcon transaction={transaction} currency="STX" />
      <TransactionInfoContainer>
        <TransactionRow>
          <TransactionTitle transaction={transaction} />
          <TransactionAmount transaction={transaction} coin={transactionCoin} />
        </TransactionRow>
        <TransactionRecipient transaction={transaction} />
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}

interface TransactionHistoryItemProps {
  transaction: AddressTransactionWithTransfers | Tx;
  transactionCoin: CurrencyTypes;
}

export default function StxTransactionHistoryItem(props: TransactionHistoryItemProps) {
  const { transaction, transactionCoin } = props;
  const { selectedAccount } = useWalletSelector();
  if (!isAddressTransactionWithTransfers(transaction)) {
    return (
      <StxTransferTransaction
        transaction={parseStxTransactionData({
          responseTx: transaction,
          stxAddress: selectedAccount?.stxAddress as string,
        })}
        transactionCoin={transactionCoin}
      />
    );
  } // This is a normal Transaction or MempoolTransaction

  // Show transfer only for contract calls
  if (transaction.tx.tx_type !== 'contract_call') {
    return (
      <StxTransferTransaction
        transaction={parseStxTransactionData({
          responseTx: transaction.tx,
          stxAddress: selectedAccount?.stxAddress as string,
        })}
        transactionCoin={transactionCoin}
      />
    );
  }
  return (
    <>
      <TxTransfers transaction={transaction} coin={transactionCoin} />
      <StxTransferTransaction
        transaction={parseStxTransactionData({
          responseTx: transaction.tx,
          stxAddress: selectedAccount?.stxAddress as string,
        })}
        transactionCoin={transactionCoin}
      />
    </>
  );
}
