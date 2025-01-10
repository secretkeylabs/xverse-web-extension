import {
  type PostConditionWire,
  FungibleConditionCode,
  NonFungibleConditionCode,
} from '@stacks/transactions';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useGetPostConditionCodeDescription() {
  const { t } = useTranslation('translation', { keyPrefix: 'POST_CONDITION_MESSAGE' });

  const getPostConditionCodeDescription = useCallback(
    (postCondition: PostConditionWire) => {
      switch (postCondition.conditionCode) {
        case FungibleConditionCode.Equal:
          return t('TRANSFER_EQUAL');
        case FungibleConditionCode.Greater:
          return t('TRANSFER_GREATER');
        case FungibleConditionCode.GreaterEqual:
          return t('TRANSFER_GREATER_EQUAL');
        case FungibleConditionCode.Less:
          return t('TRANSFER_LESS');
        case FungibleConditionCode.LessEqual:
          return t('TRANSFER_LESS_EQUAL');
        case NonFungibleConditionCode.Sends:
          return t('TRANSFER_DOES_NOT_OWN');
        case NonFungibleConditionCode.DoesNotSend:
          return t('TRANSFER_OWN');
        default:
          return '';
      }
    },
    [t],
  );

  return useMemo(() => ({ getPostConditionCodeDescription }), [getPostConditionCodeDescription]);
}
