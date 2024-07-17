import useSelectedAccount from '@hooks/useSelectedAccount';
import { parseStxTransactionData } from '@secretkeylabs/xverse-core';
import type { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import type { CurrencyTypes } from '@utils/constants';
import { isAddressTransactionWithTransfers, type Tx } from '@utils/transactions/transactions';
import StxTransferTransaction from './stxTransferTransaction';
import TxTransfers from './txTransfers';

interface TransactionHistoryItemProps {
  transaction: AddressTransactionWithTransfers | Tx;
  transactionCoin: CurrencyTypes;
  txFilter: string | null;
}

export default function StxTransactionHistoryItem({
  transaction,
  transactionCoin,
  txFilter,
}: TransactionHistoryItemProps) {
  const selectedAccount = useSelectedAccount();
  if (!isAddressTransactionWithTransfers(transaction)) {
    return (
      <StxTransferTransaction
        transaction={parseStxTransactionData({
          responseTx: transaction as any, // TODO fix type error
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
          responseTx: transaction.tx as any, // TODO fix type error
          stxAddress: selectedAccount?.stxAddress as string,
        })}
        transactionCoin={transactionCoin}
      />
    );
  }
  return (
    <>
      <TxTransfers transaction={transaction} coin={transactionCoin} txFilter={txFilter} />
      <StxTransferTransaction
        transaction={parseStxTransactionData({
          responseTx: transaction.tx as any, // TODO fix type error
          stxAddress: selectedAccount?.stxAddress as string,
        })}
        transactionCoin={transactionCoin}
      />
    </>
  );
}
