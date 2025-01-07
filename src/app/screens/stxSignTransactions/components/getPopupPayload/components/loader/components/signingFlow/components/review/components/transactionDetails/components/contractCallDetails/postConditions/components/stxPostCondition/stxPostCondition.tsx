import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import {
  addressToString,
  isContractCallPayload,
  StacksTransaction,
  type STXPostCondition,
} from '@stacks/transactions';
import { useTranslation } from 'react-i18next';
import { useGetPostConditionCodeDescription } from '../../../hooks';
import { PostConditionStyles as PC } from '../../styles';
import {
  contractPrincipalFromContractCallPayload,
  stxAmountFromPostCondition,
  useGetOriginatingAccountDescription,
} from '../../utils';

type StxPostConditionLayoutProps = {
  originatingAccountDescription: string;
  postConditionCodeDescription: string;
  amount: string | number | bigint;
  fiatAmount?: string;
};

/**
 * Not currently used given the post-conditions work is on pause, and marked as
 * `@public` so `knip` throw an error.
 * @public
 */
export function StxPostConditionLayout({
  originatingAccountDescription,
  postConditionCodeDescription,
  amount,
  fiatAmount,
}: StxPostConditionLayoutProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  return (
    <PC.Container>
      <PC.OriginatingPrincipalDescription>
        {originatingAccountDescription}
      </PC.OriginatingPrincipalDescription>
      <PC.Card>
        <PC.CardStack>
          <PC.PostConditionCodeDescription>
            {postConditionCodeDescription}
          </PC.PostConditionCodeDescription>
          <PC.AssetDescriptionContainer>
            <PC.IconContainer>
              <PC.Icon src={stacksIcon} alt="Stacks icon" />
              <PC.SubIcon src={stacksIcon} alt="Stacks icon" />
            </PC.IconContainer>
            <PC.DataContainer>
              <PC.DataRow>
                <PC.DataMainText>{t('AMOUNT')}</PC.DataMainText>
                <PC.DataMainText>{String(amount)} STX</PC.DataMainText>
              </PC.DataRow>
              <PC.DataRow>
                <PC.DataSecondaryText>Stacks</PC.DataSecondaryText>
                {fiatAmount && <PC.DataSecondaryText>{fiatAmount}</PC.DataSecondaryText>}
              </PC.DataRow>
            </PC.DataContainer>
          </PC.AssetDescriptionContainer>
        </PC.CardStack>
      </PC.Card>
    </PC.Container>
  );
}

type StxPostConditionProps = {
  postCondition: STXPostCondition;
  transaction: StacksTransaction;
};

export function StxPostCondition({ postCondition: pc, transaction }: StxPostConditionProps) {
  const { getPostConditionCodeDescription } = useGetPostConditionCodeDescription();
  const { getOriginatingAccountDescription } = useGetOriginatingAccountDescription();
  const contractPrincipal = isContractCallPayload(transaction.payload)
    ? contractPrincipalFromContractCallPayload(transaction.payload)
    : null;
  const amount = stxAmountFromPostCondition(pc);
  const postConditionOriginatingPrincipal = addressToString(pc.principal.address);
  const pcCodeDescription = getPostConditionCodeDescription(pc);
  const pcOriginatingAccountDescription = getOriginatingAccountDescription({
    postConditionOriginatingPrincipal,
    contractPrincipal,
  });

  return (
    <StxPostConditionLayout
      amount={amount}
      originatingAccountDescription={pcOriginatingAccountDescription}
      postConditionCodeDescription={pcCodeDescription}
    />
  );
}
