import useWalletSelector from '@hooks/useWalletSelector';
import { parseStxTransactionData } from '@secretkeylabs/xverse-core';
import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import { CurrencyTypes } from '@utils/constants';
import { isAddressTransactionWithTransfers, Tx } from '@utils/transactions/transactions';
// import IncreaseFeeIcon from '@assets/img/transactions/increaseFee.svg';
// import styled from 'styled-components';
// import { useTranslation } from 'react-i18next';
import StxTransferTransaction from './stxTransferTransaction';
import TxTransfers from './txTransfers';

// const IncreaseFeeButton = styled.button((props) => ({
//   ...props.theme.body_xs,
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   alignSelf: 'flex-start',
//   background: 'none',
//   paddingLeft: props.theme.spacing(8),
//   paddingRight: props.theme.spacing(8),
//   color: props.theme.colors.white_0,
//   border: `0.5px solid ${props.theme.colors.elevation3}`,
//   height: 34,
//   borderRadius: props.theme.radius(3),
//   img: {
//     marginRight: props.theme.spacing(3),
//   },
// }));

interface TransactionHistoryItemProps {
  transaction: AddressTransactionWithTransfers | Tx;
  transactionCoin: CurrencyTypes;
  txFilter: string | null;
}

export default function StxTransactionHistoryItem(props: TransactionHistoryItemProps) {
  const { transaction, transactionCoin, txFilter } = props;
  const { selectedAccount } = useWalletSelector();
  // const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  if (!isAddressTransactionWithTransfers(transaction)) {
    return (
      <>
        <StxTransferTransaction
          transaction={parseStxTransactionData({
            responseTx: transaction as any, // TODO fix type error
            stxAddress: selectedAccount?.stxAddress as string,
          })}
          transactionCoin={transactionCoin}
        />
        {/* <IncreaseFeeButton>
          <img src={IncreaseFeeIcon} alt="fee" />
          {t('INCREASE_FEE_BUTTON')}
        </IncreaseFeeButton> */}
      </>
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
