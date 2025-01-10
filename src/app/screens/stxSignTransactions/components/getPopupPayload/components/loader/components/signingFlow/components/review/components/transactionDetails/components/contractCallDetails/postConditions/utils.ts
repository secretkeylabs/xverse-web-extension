import { stacksValue } from '@components/postCondition/postConditionView/helper';
import useSelectedAccount from '@hooks/useSelectedAccount';
import {
  addressToString,
  type ContractCallPayload,
  type STXPostCondition,
} from '@stacks/transactions';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function contractPrincipalFromContractCallPayload(payload: ContractCallPayload) {
  return `${addressToString(payload.contractAddress)}.${payload.contractName.content}`;
}

export function stxAmountFromPostCondition(pc: STXPostCondition) {
  return stacksValue({ value: pc.amount.toString(), withTicker: false });
}

type UseOriginatingAccountDescriptionArgs = {
  /**
   * The post condition's originating principal.
   */
  postConditionOriginatingPrincipal: string;

  /**
   * The contract principal of the contract-call transaction the post-condition
   * is for. Use `null` when the transaction is not a contract call.
   */
  contractPrincipal: string | null;
};

export function useGetOriginatingAccountDescription() {
  const { t } = useTranslation('translation', { keyPrefix: 'POST_CONDITION_MESSAGE' });
  const { stxAddress } = useSelectedAccount();

  const getOriginatingAccountDescription = useCallback(
    ({
      postConditionOriginatingPrincipal,
      contractPrincipal,
    }: UseOriginatingAccountDescriptionArgs) => {
      if (postConditionOriginatingPrincipal === contractPrincipal) return t('CONTRACT');

      if (postConditionOriginatingPrincipal === stxAddress) return t('YOU');

      // QUESTION: Should we show a generic "Another address" or should we show the actual address?
      return t('ANOTHER_ADDRESS');
    },
    [stxAddress, t],
  );

  return useMemo(() => ({ getOriginatingAccountDescription }), [getOriginatingAccountDescription]);
}
