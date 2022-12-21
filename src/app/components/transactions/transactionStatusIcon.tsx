import { BtcTransactionData, StxTransactionData } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import ReceiveIcon from '@assets/img/transactions/received.svg';
import SendIcon from '@assets/img/transactions/sent.svg';
import PendingIcon from '@assets/img/transactions/pending.svg';
import ContractIcon from '@assets/img/transactions/contract.svg';
import FailedIcon from '@assets/img/transactions/failed.svg';

interface TransactionStatusIconPros {
  transaction: StxTransactionData | BtcTransactionData;
  currency: CurrencyTypes;
}

function TransactionStatusIcon(props: TransactionStatusIconPros) {
  const { currency, transaction } = props;
  if (currency === 'STX' || currency === 'FT') {
    const tx = transaction as StxTransactionData;
    if (tx.txStatus === 'abort_by_response' || tx.txStatus === 'abort_by_post_condition') {
      return <img src={FailedIcon} alt="pending" />;
    }
    if (tx.txType === 'token_transfer' || tx.tokenType === 'fungible') {
      if (tx.txStatus === 'pending') {
        return <img src={PendingIcon} alt="pending" />;
      }
      if (tx.incoming) {
        return <img src={ReceiveIcon} alt="received" />;
      }
      return <img src={SendIcon} alt="sent" />;
    }
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    return <img src={ContractIcon} alt="contract-call" />;
  }
  if (currency === 'BTC') {
    const tx = transaction as BtcTransactionData;
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    if (tx.incoming) {
      return <img src={ReceiveIcon} alt="received" />;
    }
    return <img src={SendIcon} alt="sent" />;
  }
  return <img src={ContractIcon} alt="contract" />;
}
export default TransactionStatusIcon;
