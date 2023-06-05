import { PostCondition } from '@stacks/transactions';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import PostConditionsView from './postConditionView';
import { getAmountFromPostCondition } from './postConditionView/helper';

interface Props {
  postCondition: PostCondition;
}
function StxPostConditionCard({ postCondition }: Props) {
  const amount = getAmountFromPostCondition(postCondition) ?? '';
  return (
    <PostConditionsView
      postCondition={postCondition}
      amount={amount}
      icon={IconStacks}
    />
  );
}

export default StxPostConditionCard;
