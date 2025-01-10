import styled from 'styled-components';
import type { TransactionInfoProps } from '../../types';
import { isNotAllowingTransfers } from '../../utils';
import { TransactionDetails } from './callSummary';
import { Fee } from './components/fee';
import { NoTransfersMessage } from './noTransfersMessage';
import { PostConditionsDetails } from './postConditions';

const DEVDEBUG_SHOW_POST_CONDITIONS: boolean = false;

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.l,
}));

export function ContractCallDetails({ transaction, onEditFee }: TransactionInfoProps) {
  const showNoTransfersMessage = isNotAllowingTransfers(transaction);

  return (
    <Container>
      {showNoTransfersMessage && <NoTransfersMessage />}
      <TransactionDetails transaction={transaction} />
      {DEVDEBUG_SHOW_POST_CONDITIONS && <PostConditionsDetails transaction={transaction} />}
      <Fee transaction={transaction} onEdit={onEditFee} />
    </Container>
  );
}
