import { ChainID, type ContractCallPayload, type StacksTransaction } from '@stacks/transactions';
import { useTranslation } from 'react-i18next';
import * as TDStyles from '../../../../styles';
import { Card, CardRowContainer, CardRowPrimary } from '../../../card';
import { CallSummaryLoader } from '../callSummaryLayout';

type TransactionDetailsProps = {
  transaction: StacksTransaction;

  // Although it seems redundant to pass the `payload` separately, which is
  // contained within the transaction, it is necessary to preserve its type
  // information, which is not possible with the `transaction` alone.
  //
  // https://github.com/hirosystems/stacks.js/issues/1776
  payload: ContractCallPayload;
};
const chainIdToNetworkName = {
  [ChainID.Mainnet]: 'Mainnet',
  [ChainID.Testnet]: 'Testnet',
};

export function TransactionDetailsLayout({ payload, transaction }: TransactionDetailsProps) {
  const { t } = useTranslation();

  return (
    <TDStyles.Container>
      <TDStyles.Title>{t('CONFIRM_TRANSACTION.TRANSACTION_DETAILS')}</TDStyles.Title>
      <CallSummaryLoader payload={payload} />
      <Card>
        <CardRowContainer>
          <CardRowPrimary title="Network" value={chainIdToNetworkName[transaction.chainId]} />
        </CardRowContainer>
      </Card>
    </TDStyles.Container>
  );
}
