import i18n from 'locales';
import {
  addressToString,
  STXPostCondition,
  FungiblePostCondition,
  NonFungiblePostCondition,
  PostConditionType,
  FungibleConditionCode,
  NonFungibleConditionCode,
} from '@stacks/transactions';

export const getIconStringFromPostCondition = (
  pc: STXPostCondition | FungiblePostCondition | NonFungiblePostCondition
) => {
  if (pc.conditionType === PostConditionType.Fungible)
    return `${addressToString(pc.assetInfo.address)}.${pc.assetInfo.contractName}.${
      pc.assetInfo.assetName.content
    }`;
  if (pc.conditionType === PostConditionType.STX) return 'STX';
  return pc.assetInfo.assetName.content;
};

export const getSymbolFromPostCondition = (
  pc: STXPostCondition | FungiblePostCondition | NonFungiblePostCondition
) => {
  if ('assetInfo' in pc) {
    return pc.assetInfo.assetName.content.slice(0, 3).toUpperCase();
  }
  return 'STX';
};

export const getNameFromPostCondition = (
  pc: STXPostCondition | FungiblePostCondition | NonFungiblePostCondition
) => {
  if ('assetInfo' in pc) {
    return pc.assetInfo.assetName.content;
  }
  return 'STX';
};

export function getPostConditionCodeMessage(
  code: FungibleConditionCode | NonFungibleConditionCode,
  isSender: boolean
) {
  const sender = isSender
    ? i18n.t('post_condition_message.you')
    : i18n.t('post_condition_message.contract');
  switch (code) {
    case FungibleConditionCode.Equal:
      return `${sender} ${i18n.t('post_condition_message.post_condition_equal')}`;

    case FungibleConditionCode.Greater:
      return `${sender} ${i18n.t('post_condition_message.post_condition_greater')}`;

    case FungibleConditionCode.GreaterEqual:
      return `${sender} ${i18n.t('post_condition_message.post_condition_greater_equal')}`;

    case FungibleConditionCode.Less:
      return `${sender} ${i18n.t('post_condition_message.post_condition_less')}`;

    case FungibleConditionCode.LessEqual:
      return `${sender} ${i18n.t('post_condition_message.post_condition_less_equal')}`;

    case NonFungibleConditionCode.DoesNotSend:
      return `${sender} ${i18n.t('post_condition_message.post_condition_does_not_own')}`;

    case NonFungibleConditionCode.Sends:
      return `${sender} ${i18n.t('post_condition_message.post_condition_own')}`;
  }
}

const getTitleFromConditionCode = (code: FungibleConditionCode | NonFungibleConditionCode) => {
  switch (code) {
    case FungibleConditionCode.Equal:
      return i18n.t('post_condition_message.post_condition_transfer_equal');
    case FungibleConditionCode.Greater:
      return i18n.t('post_condition_message.post_condition_transfer_greater');
    case FungibleConditionCode.GreaterEqual:
      return i18n.t('post_condition_message.post_condition_transfer_greater_equal');
    case FungibleConditionCode.Less:
      return i18n.t('post_condition_message.post_condition_transfer_less');
    case FungibleConditionCode.LessEqual:
      return i18n.t('post_condition_message.post_condition_transfer_less_equal');
    case NonFungibleConditionCode.DoesNotSend:
      return i18n.t('post_condition_message.post_condition_transfer_does_not_own');
    case NonFungibleConditionCode.Sends:
      return i18n.t('post_condition_message.post_condition_transfer_own');
    default:
      return '';
  }
};

export const getPostConditionTitle = (
  pc: STXPostCondition | FungiblePostCondition | NonFungiblePostCondition
) => {
  return getTitleFromConditionCode(pc.conditionCode) || '';
};
