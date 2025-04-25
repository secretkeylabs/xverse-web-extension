import useWalletSelector from '@hooks/useWalletSelector';
import { type EnhancedTx, type NetworkType } from '@secretkeylabs/xverse-core';
import { getBtcTxStatusUrl } from '@utils/helper';
import { useCallback } from 'react';
import styled from 'styled-components';
import { TransactionAmount, TransactionAuxiliaryAmount } from './transactionAmount';
import { TransactionRecipient } from './transactionRecipient';
import { TransactionStatusIcon } from './transactionStatusIcon';
import { TransactionTitle } from './transactionTitle';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: props.theme.spacing(5),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  background: 'none',
  ':hover': {
    background: props.theme.colors.white_900,
  },
  ':focus': {
    background: props.theme.colors.white_850,
  },
}));

const TransactionAmountContainer = styled.div({
  display: 'flex',
  flex: 1,
  width: '100%',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: props.theme.space.s,
}));

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.typography.body_bold_m,
}));

interface TransactionHistoryItemProps {
  tx: EnhancedTx;
  walletAddressesDictionary: Map<string, string>;
  networkType: NetworkType;
}
export default function BtcTxHistoryItem({
  tx,
  walletAddressesDictionary,
  networkType,
}: TransactionHistoryItemProps) {
  const { network } = useWalletSelector();

  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(tx.id, network), '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <TransactionContainer data-testid="transaction-container" onClick={openBtcTxStatusLink}>
      <TransactionStatusIcon tx={tx} networkType={networkType} />
      <TransactionInfoContainer>
        <TransactionRow>
          <div>
            <TransactionTitle tx={tx} />
            <TransactionRecipient tx={tx} walletAddressesDictionary={walletAddressesDictionary} />
          </div>
          <TransactionAmountContainer data-testid="transaction-amount">
            <TransactionAmount tx={tx} />
            <TransactionAuxiliaryAmount tx={tx} />
          </TransactionAmountContainer>
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
