import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import type { PostConditionWire } from '@stacks/transactions';
import PostConditionsView from './postConditionView';
import { getAmountFromPostCondition } from './postConditionView/helper';

interface Props {
  postCondition: PostConditionWire;
}
function StxPostConditionCard({ postCondition }: Props) {
  console.log('🚀 ~ StxPostConditionCard ~ postCondition:', postCondition);
  const amount = getAmountFromPostCondition(postCondition) ?? '';
  console.log('🚀 ~ StxPostConditionCard ~ amount:', amount);

  return <PostConditionsView postCondition={postCondition} amount={amount} icon={IconStacks} />;
}

export default StxPostConditionCard;
